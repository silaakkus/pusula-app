import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDisciplineById } from './dataLoader.js';
import { loadPusulaSession } from './pusulaSession.js';

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

function splitLooseList(s) {
  return s
    .split(/\n|•|;|,(?=\s)/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * API yanıtı: yeni şema { title, why, tags, resources } veya eski { roleName, whyFits, ... }
 */
function normalizeRole(r, index) {
  const usesCompact =
    r &&
    (Object.prototype.hasOwnProperty.call(r, 'title') ||
      Object.prototype.hasOwnProperty.call(r, 'why') ||
      Object.prototype.hasOwnProperty.call(r, 'resources'));

  let roleName = `Rol ${index + 1}`;
  if (usesCompact) {
    if (isNonEmptyString(r.title)) roleName = r.title.trim();
    else if (isNonEmptyString(r.roleName)) roleName = r.roleName.trim();
  } else if (isNonEmptyString(r?.roleName)) {
    roleName = r.roleName.trim();
  }

  let whyFits = [];
  if (usesCompact && r.why != null) {
    if (Array.isArray(r.why)) {
      whyFits = r.why.filter(isNonEmptyString).map((s) => s.trim());
    } else if (isNonEmptyString(r.why)) {
      const parts = splitLooseList(r.why);
      whyFits = parts.length ? parts : [r.why.trim()];
    }
  }
  if (!whyFits.length && Array.isArray(r?.whyFits)) {
    whyFits = r.whyFits.filter(isNonEmptyString).map((s) => s.trim());
  }

  let starterResources = [];
  if (usesCompact && r.resources != null) {
    if (Array.isArray(r.resources)) {
      starterResources = r.resources.filter(isNonEmptyString).map((s) => s.trim());
    } else if (isNonEmptyString(r.resources)) {
      const parts = r.resources.split(/[,;]\s*|\n/).map((x) => x.trim()).filter(Boolean);
      starterResources = parts.length ? parts : [r.resources.trim()];
    }
  }
  if (!starterResources.length && Array.isArray(r?.starterResources)) {
    starterResources = r.starterResources.filter(isNonEmptyString).map((s) => s.trim());
  }

  let firstSteps = Array.isArray(r?.firstSteps) ? r.firstSteps.filter(isNonEmptyString).map((s) => s.trim()) : [];

  let tags = [];
  if (usesCompact && Array.isArray(r.tags)) {
    tags = r.tags.filter(isNonEmptyString).map((s) => s.trim().toLowerCase());
  }
  if (!tags.length && Array.isArray(r?.tags)) {
    tags = r.tags.filter(isNonEmptyString).map((s) => s.trim().toLowerCase());
  }

  const employersTurkey = Array.isArray(r?.employersTurkey)
    ? r.employersTurkey.filter(isNonEmptyString).map((s) => s.trim()).slice(0, 5)
    : [];

  if (!firstSteps.length) {
    const r0 = starterResources[0] ?? 'Patika.dev veya Kodluyoruz giriş modülü';
    firstSteps = [
      `${r0} için 30 dakikalık bir blok ayır.`,
      'Bu hafta tamamlayacağın tek küçük çıktıyı (ör. özet, mini proje) yaz.',
      'SistersLab, UP School veya WTM duyurularından bir etkinliği takvimine ekle.',
    ];
  }

  return { roleName, whyFits, firstSteps, starterResources, tags, employersTurkey };
}

/**
 * Tam 3 rol; UI için whyFits / firstSteps / starterResources tamamlanır.
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
          title: `Önerilen rol ${roles.length + 1}`,
          why: ['Profil ve disiplin matrisi sinyalleriyle uyumlu bir rol.'],
          resources: ['UP School', 'SistersLab', 'Women Techmakers etkinlikleri'],
          tags: ['data'],
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
  while (actions.length < 2) {
    actions.push('Bu hafta 20 dakika ayırıp önerilen rollerden biriyle ilgili tek bir kaynağı incele.');
  }
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

const CAREER_SYSTEM = `Sen Pusula'nın AI kariyer rehberisin. Türkiye'deki üniversite öğrencisi kadınlara teknoloji kariyeri öneriyorsun.
Yanıtların Türkçe, samimi ve yargılamayan bir tonda olmalı.
Her zaman JSON formatında yanıt ver: {roles: [{title, why, tags, resources}]}
Başka metin veya markdown kullanma; yalnızca tek bir JSON nesnesi.

Ek teknik kurallar:
- Tam olarak 3 rol üret.
- why: string veya string dizisi (en az iki net gerekçe).
- tags: kısa etiket dizisi (örn. data, ux, pm).
- resources: en az 3 kısa kaynak başlığı veya adı içeren dizi.
- Aşağıdaki profil ve disiplin matrisi özetine uy; metni kopyalama, kişiselleştir.`;

const BARRIER_SYSTEM = `Sen empati kuran bir kariyer koçusun. Kullanıcının yazdığı engeli kariyer dışlayıcı olarak değil,
yeniden çerçeveleyerek ele al. Yanıtın Türkçe olsun ve 2 somut aksiyon adımı içersin.
JSON formatında yanıt ver: {reframe, actions: [action1, action2]}
Başka metin veya markdown ekleme; yalnızca tek bir JSON nesnesi.
"İmkansız", "yapamazsın" gibi dışlayıcı dil kullanma.`;

function buildSuggestedRolesContext() {
  const session = loadPusulaSession();
  const list = session?.roles;
  if (!Array.isArray(list) || list.length === 0) {
    return '(Henüz bu oturumda kayıtlı rol önerisi yok.)';
  }
  return JSON.stringify(
    list.map((role) => ({
      title: role.roleName ?? role.title,
      tags: role.tags,
      resources: role.starterResources ?? role.resources,
    })),
    null,
    2,
  );
}

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

  const prompt = `Aşağıdaki profil ve matris özetini kullanarak yalnızca JSON üret.\n\n${JSON.stringify(userPayload, null, 2)}`;

  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Boş yanıt');
  return parseAndValidateCareerJson(text);
}

export async function runBarrierReframe({ apiKey, barrierText, profileSummary }) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('API anahtarı eksik');
  const model = createModel(apiKey, {
    model: MODEL_ID,
    systemInstruction: BARRIER_SYSTEM,
  });
  const rolesBlock = buildSuggestedRolesContext();
  const prompt = `Profil özeti: ${profileSummary}

Önceki analizde önerilen roller (localStorage oturumundan bağlam — kullanıcıya uygun yanıt verirken bunları dikkate al):
${rolesBlock}

Kullanıcının engeli: ${barrierText}`;
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Boş yanıt');
  return parseBarrierResponse(text);
}
