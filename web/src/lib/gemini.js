import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDisciplineById } from './dataLoader.js';

/** Bare `gemini-1.5-flash` çoğu anahtarda v1beta ile 404 veriyor; `-latest` soneki güncel takma adı kullanır. */
const MODEL_ID = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

function geminiRequestOptions() {
  const raw = import.meta.env.VITE_GEMINI_API_VERSION;
  const apiVersion = raw && String(raw).trim() ? String(raw).trim() : 'v1beta';
  return { apiVersion };
}

function createModel(apiKey, modelParams) {
  const genAI = new GoogleGenerativeAI(apiKey.trim());
  return genAI.getGenerativeModel(modelParams, geminiRequestOptions());
}

function stripCodeFences(text) {
  let t = text.trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) t = m[1].trim();
  return t;
}

function parseJsonLoose(text) {
  const cleaned = stripCodeFences(text);
  return JSON.parse(cleaned);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeRole(r, index) {
  const roleName = isNonEmptyString(r?.roleName) ? r.roleName.trim() : `Rol ${index + 1}`;
  const whyFits = Array.isArray(r?.whyFits) ? r.whyFits.filter(isNonEmptyString).map((s) => s.trim()) : [];
  const firstSteps = Array.isArray(r?.firstSteps) ? r.firstSteps.filter(isNonEmptyString).map((s) => s.trim()) : [];
  const starterResources = Array.isArray(r?.starterResources)
    ? r.starterResources.filter(isNonEmptyString).map((s) => s.trim())
    : [];
  const tags = Array.isArray(r?.tags) ? r.tags.filter(isNonEmptyString).map((s) => s.trim().toLowerCase()) : [];
  const employersTurkey = Array.isArray(r?.employersTurkey)
    ? r.employersTurkey.filter(isNonEmptyString).map((s) => s.trim()).slice(0, 5)
    : [];
  return { roleName, whyFits, firstSteps, starterResources, tags, employersTurkey };
}

/**
 * Tam 3 rol ve PRD alanlarını doğrular; eksikleri güvenli şekilde doldurur.
 */
export function parseAndValidateCareerJson(rawText) {
  const obj = parseJsonLoose(rawText);
  let roles = Array.isArray(obj?.roles) ? obj.roles : null;
  if (!roles) throw new Error('Yanıtta roles dizisi yok');

  roles = roles.slice(0, 5).map((r, i) => normalizeRole(r, i));
  while (roles.length < 3) {
    roles.push(
      normalizeRole(
        {
          roleName: `Önerilen rol ${roles.length + 1}`,
          whyFits: ['Profil ve disiplin matrisi sinyalleriyle uyumlu bir rol.'],
          firstSteps: ['Patika.dev veya Kodluyoruz üzerinden bir giriş modülü seç.', 'Haftada 3 saat öğrenme takvimi oluştur.', 'Bir mentorluk veya topluluk etkinliğine kaydol.'],
          starterResources: ['UP School', 'SistersLab', 'Women Techmakers etkinlikleri'],
          tags: ['data'],
          employersTurkey: [],
        },
        roles.length,
      ),
    );
  }
  roles = roles.slice(0, 3);

  for (const r of roles) {
    if (r.whyFits.length < 1) r.whyFits.push('Profilinle uyumlu bir geçiş alanı.');
    if (r.firstSteps.length < 3) {
      while (r.firstSteps.length < 3) {
        r.firstSteps.push('Küçük bir portföy görevi tanımla ve iki haftada tamamla.');
      }
    }
    if (r.starterResources.length < 3) {
      while (r.starterResources.length < 3) {
        r.starterResources.push('Yerel program ve topluluk duyurularını takip et.');
      }
    }
    if (r.tags.length < 1) r.tags.push('research');
  }

  return { roles };
}

export function parseBarrierResponse(rawText) {
  const obj = parseJsonLoose(rawText);
  const reframe = isNonEmptyString(obj?.reframe) ? obj.reframe.trim() : '';
  let actions = Array.isArray(obj?.actions) ? obj.actions.filter(isNonEmptyString).map((s) => s.trim()) : [];
  if (!reframe) throw new Error('reframe alanı eksik');
  if (actions.length < 1) actions = ['Bu hafta 30 dakikalık tek bir öğrenme bloğu ayır.'];
  if (actions.length > 2) actions = actions.slice(0, 2);
  return { reframe, actions };
}

function buildMatrixExcerpt(matrix, disciplineId) {
  const d = getDisciplineById(matrix, disciplineId);
  if (!d) return '';
  const lines = d.roleMatches.map(
    (rm) =>
      `- ${rm.roleName} [tags: ${rm.tags.join(', ')}]: ${rm.whyFits[0]?.slice(0, 120) ?? ''}…`,
  );
  return `Disiplin: ${d.disciplineName}\nMatris özeti (rehber):\n${lines.join('\n')}`;
}

const CAREER_SYSTEM = `Sen "Multidisipliner Kariyer Mentörü"sün. Türkiye'deki üniversite eğitimi alan kadın öğrencilere teknoloji sektörüne geçişte yardımcı oluyorsun.
Kurallar:
- Dil: Türkçe. Yargılayıcı, aşağılayıcı veya "sen yapamazsın" tonu kullanma.
- Çıktıyı YALNIZCA geçerli bir JSON nesnesi olarak ver; markdown veya açıklama metni ekleme.
- Tam olarak 3 rol öner. Her rol için alanlar: roleName (string), whyFits (string array, en az 2 madde), firstSteps (string array, tam 3 madde), starterResources (string array, tam 3 kısa kaynak adı veya başlık), tags (string array, küçük harf kısa etiketler: data, ux, pm, biotech, hrtech, edtech, gamedev, ai-ethics, fintech, sustainability, research, marketing-analytics gibi), employersTurkey (Türkiye'de bu role yakın işveren veya ekip örnekleri, 3–5 şirket adı, string array).
- Öneriler kullanıcının profili ve aşağıdaki disiplin matrisi özetiyle tutarlı olsun; matrisi kopyalama, kişiselleştir.`;

export async function runCareerAnalysis({ apiKey, profile, matrix }) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('API anahtarı eksik');

  const model = createModel(apiKey, {
    model: MODEL_ID,
    systemInstruction: CAREER_SYSTEM,
  });

  const userPayload = {
    profile: {
      disciplineId: profile.disciplineId,
      disciplineLabel: profile.disciplineLabel,
      interests: profile.interests,
      strengths: profile.strengths,
      learningStyle: profile.learningStyle,
      goal: profile.goal,
    },
    matrixExcerpt: buildMatrixExcerpt(matrix, profile.disciplineId),
  };

  const prompt = `Aşağıdaki profil ve matris özetini kullanarak JSON üret.\n\n${JSON.stringify(userPayload, null, 2)}\n\nŞema: {"roles":[{...},{...},{...}]}`;

  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Boş yanıt');
  return parseAndValidateCareerJson(text);
}

const BARRIER_SYSTEM = `Sen destekleyici bir kariyer koçusun. Kullanıcının yazdığı engeli yeniden çerçevele (olumlu, gerçekçi, yargısız) ve 1–2 somut küçük aksiyon öner.
Kurallar: Türkçe. "İmkansız", "yapamazsın", aşağılama yok.
Çıktı yalnızca JSON: {"reframe":"...","actions":["...","..."]} — actions en fazla 2 madde.`;

export async function runBarrierReframe({ apiKey, barrierText, profileSummary }) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('API anahtarı eksik');
  const model = createModel(apiKey, {
    model: MODEL_ID,
    systemInstruction: BARRIER_SYSTEM,
  });
  const prompt = `Profil özeti: ${profileSummary}\n\nKullanıcının engeli: ${barrierText}`;
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Boş yanıt');
  return parseBarrierResponse(text);
}
