import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDisciplineById, validateDayInLife, validateSalaryRange } from './dataLoader.js';
import { normalizeEmployersList } from './employersNormalize.js';
import {
  normalizeInternshipProgramsWithLlmFallback,
  normalizeLlmApplicationPrograms,
} from './internshipsNormalize.js';
import { loadPusulaSession } from './pusulaSession.js';
import { getLlmProvider } from './llmConfig.js';
import { groqGenerateText } from './groqClient.js';

const MIN_ROLE_COUNT = 4;
const MAX_ROLE_COUNT = 5;

/**
 * Ücretsiz planda `gemini-2.0-flash` birçok projede kota limiti 0; yedek zincire alınmıyor.
 * .env ile `VITE_GEMINI_MODEL` geçersen önce o, sonra 1.5 ailesi yedekleri denenir.
 */
const DEFAULT_MODEL = 'gemini-1.5-flash-latest';

/** v1beta generateContent ile artık kullanılamayan model adları (.env’de yazsa bile atlanır) */
const DEPRECATED_MODEL_IDS = new Set(['gemini-pro', 'gemini-pro-vision']);

/** `gemini-1.5-flash` (suffixsiz) v1beta’da 404; yalnızca -latest veya tam model adı kullan */
function normalizeEnvGeminiModelId(raw) {
  const id = raw?.trim();
  if (!id) return '';
  if (id === 'gemini-1.5-flash') return 'gemini-1.5-flash-latest';
  return id;
}

function getModelAttemptChain() {
  const env = normalizeEnvGeminiModelId(import.meta.env.VITE_GEMINI_MODEL);
  const primary = env || DEFAULT_MODEL;
  // gemini-pro v1beta’da 404; gemini-2.0-flash ücretsiz kotada sık limit:0; gemini-1.5-flash suffixsiz 404.
  const chain = [primary, DEFAULT_MODEL, 'gemini-1.5-pro-latest'];
  return [...new Set(chain)].filter((id) => !DEPRECATED_MODEL_IDS.has(id));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isQuotaOrRateError(e) {
  const msg = e?.message ?? String(e);
  return /429|Resource exhausted|quota|Too Many Requests/i.test(msg);
}

/** API “limit: 0” döndüğünde beklemek işe yaramaz; hemen sıradaki modele geçilir */
function isQuotaDisabledForModelError(e) {
  const msg = e?.message ?? String(e);
  return isQuotaOrRateError(e) && /limit:\s*0\b/i.test(msg);
}

function isModelNotFoundError(e) {
  const msg = e?.message ?? String(e);
  return /404|is not found|not supported for generateContent/i.test(msg);
}

/** SDK timeout veya fetch iptali — sıradaki model denenir */
function isTimeoutOrAbortError(e) {
  if (!e) return false;
  const msg = String(e.message ?? e);
  return (
    e.name === 'AbortError' || /Request aborted|aborted when fetching|aborted when reading/i.test(msg)
  );
}

function parseRetryDelayMs(e) {
  const msg = e?.message ?? String(e);
  const m = msg.match(/retry in ([\d.]+)\s*s/i);
  if (m) return Math.min(90_000, Math.ceil(parseFloat(m[1]) * 1000) + 800);
  return 16_000;
}

/**
 * 429’da bir kez bekleyip tekrarlar; kota/model bulunamadıysa sıradaki model adını dener.
 */
async function generateTextMultiModel(apiKey, modelParamsBase, prompt) {
  const models = getModelAttemptChain();
  let lastError;

  for (const modelName of models) {
    const model = createModel(apiKey, { ...modelParamsBase, model: modelName });

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.();
        if (!text) throw new Error('Boş yanıt');
        return text;
      } catch (e) {
        lastError = e;
        if (isTimeoutOrAbortError(e)) break;
        if (isQuotaOrRateError(e)) {
          if (isQuotaDisabledForModelError(e)) break;
          if (attempt === 0) {
            await sleep(parseRetryDelayMs(e));
            continue;
          }
          break;
        }
        if (isModelNotFoundError(e)) break;
        throw e;
      }
    }
  }

  throw lastError ?? new Error('Gemini çağrısı başarısız');
}

function geminiRequestOptions() {
  const raw = import.meta.env.VITE_GEMINI_API_VERSION;
  const apiVersion = raw && String(raw).trim() ? String(raw).trim() : 'v1beta';
  const timeoutRaw = import.meta.env.VITE_GEMINI_TIMEOUT_MS;
  const parsed =
    timeoutRaw != null && String(timeoutRaw).trim() !== '' ? Number(timeoutRaw) : NaN;
  const timeout = Number.isFinite(parsed) && parsed >= 15_000 ? Math.floor(parsed) : 90_000;
  return { apiVersion, timeout };
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

/** Groq/Gemini bazen JSON öncesi/sonrası metin veya gevşek biçim döndürür. */
function extractJsonObject(rawText) {
  if (rawText == null) return null;
  let cleaned = stripCodeFences(String(rawText).trim());
  try {
    return JSON.parse(cleaned);
  } catch {
    /* devam */
  }
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
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

/** Groq/Gemini bazen internshipPrograms anahtarını farklı yazar */
function pickInternshipProgramsRaw(r) {
  if (!r || typeof r !== 'object') return [];
  const keys = ['internshipPrograms', 'internship_programs', 'internships', 'stajProgramlari', 'staj_programlari'];
  for (const k of keys) {
    if (Array.isArray(r[k])) return r[k];
  }
  return [];
}

/** JSON anahtarını karşılaştırma için sadeleştirir (Türkçe / farklı yazım). */
function normSalaryKey(k) {
  return String(k ?? '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\s_\-]/g, '');
}

function asTrimmedString(v) {
  if (v == null) return '';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string') return v.trim();
  return String(v).trim();
}

/**
 * Groq/Gemini bazen source bırakmaz veya junior/mid yerine Türkçe anahtar kullanır;
 * validateSalaryRange geçmezse maaş tamamen düşer — matriste tek blok kalır.
 */
function coerceSalaryRangeObject(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  let junior = '';
  let mid = '';
  let senior = '';
  let source = '';

  for (const [key, val] of Object.entries(raw)) {
    const nk = normSalaryKey(key);
    const s = asTrimmedString(val);
    if (!s) continue;

    if (nk === 'junior' || nk === 'juniorlevel' || nk.startsWith('junior')) {
      if (!junior) junior = s;
      continue;
    }
    if (nk === 'mid' || nk === 'middle' || nk === 'orta' || nk === 'ortaseviye' || nk.startsWith('mid')) {
      if (!mid) mid = s;
      continue;
    }
    if (
      nk === 'senior' ||
      nk === 'kidemli' ||
      nk.startsWith('senior') ||
      (nk.includes('kidem') && !nk.includes('junior'))
    ) {
      if (!senior) senior = s;
      continue;
    }
    if (nk === 'source' || nk === 'kaynak' || nk === 'referans' || nk === 'aciklama' || nk === 'not') {
      if (!source) source = s;
    }
  }

  if (!junior || !mid || !senior) return null;
  if (!source) {
    source =
      'Tahmini piyasa bandı (yapay zeka), Türkiye, brüt ₺/ay; şehir ve şirkete göre değişir — kesin ücret değildir.';
  }
  return { junior, mid, senior, source };
}

function pickRawSalaryRange(r) {
  if (!r || typeof r !== 'object') return null;
  if (r.salaryRange && typeof r.salaryRange === 'object') return r.salaryRange;
  if (r.salary_range && typeof r.salary_range === 'object') return r.salary_range;
  return null;
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

  const employersTurkey = normalizeEmployersList(Array.isArray(r?.employersTurkey) ? r.employersTurkey : [], 8);

  const internshipPrograms = normalizeInternshipProgramsWithLlmFallback(pickInternshipProgramsRaw(r), 6);

  const llmApplicationPrograms = normalizeLlmApplicationPrograms(
    Array.isArray(r?.applicationPrograms) ? r.applicationPrograms : [],
    5,
  );

  const roleId = isNonEmptyString(r?.roleId) ? r.roleId.trim() : undefined;

  let dayInLife;
  if (validateDayInLife(r?.dayInLife)) {
    dayInLife = {
      morning: r.dayInLife.morning.trim(),
      afternoon: r.dayInLife.afternoon.trim(),
      evening: r.dayInLife.evening.trim(),
    };
  }

  let salaryRange;
  const rawSr = pickRawSalaryRange(r);
  if (validateSalaryRange(rawSr)) {
    salaryRange = {
      junior: rawSr.junior.trim(),
      mid: rawSr.mid.trim(),
      senior: rawSr.senior.trim(),
      source: rawSr.source.trim(),
    };
  } else {
    const coerced = coerceSalaryRangeObject(rawSr);
    if (coerced) salaryRange = coerced;
  }

  if (!firstSteps.length) {
    const r0 = starterResources[0] ?? 'Patika.dev veya Kodluyoruz giriş modülü';
    firstSteps = [
      `${r0} için 30 dakikalık bir blok ayır.`,
      'Bu hafta tamamlayacağın tek küçük çıktıyı (ör. özet, mini proje) yaz.',
      'SistersLab, UP School veya WTM duyurularından bir etkinliği takvimine ekle.',
    ];
  }

  const out = { roleName, whyFits, firstSteps, starterResources, tags, employersTurkey };
  if (roleId) out.roleId = roleId;
  if (dayInLife) out.dayInLife = dayInLife;
  if (salaryRange) out.salaryRange = salaryRange;
  if (internshipPrograms.length) out.internshipPrograms = internshipPrograms;
  if (llmApplicationPrograms.length) out.llmApplicationPrograms = llmApplicationPrograms;
  return out;
}

/** 4-5 rol; UI için whyFits / firstSteps / starterResources tamamlanır. */
export function parseAndValidateCareerJson(rawText) {
  let obj = extractJsonObject(rawText);
  if (!obj || !Array.isArray(obj.roles)) {
    try {
      obj = parseJsonLoose(rawText);
    } catch {
      obj = null;
    }
  }
  let roles = Array.isArray(obj?.roles) ? obj.roles : null;
  if (!roles) throw new Error('Yanıtta roles dizisi yok');

  roles = roles.slice(0, MAX_ROLE_COUNT).map((r, i) => normalizeRole(r, i));
  while (roles.length < MIN_ROLE_COUNT) {
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
  roles = roles.slice(0, MAX_ROLE_COUNT);

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
  const obj = extractJsonObject(rawText);
  if (!obj) throw new Error('Engel yanıtı JSON olarak çözülemedi');
  const reframe = isNonEmptyString(obj?.reframe) ? obj.reframe.trim() : '';
  let actions = Array.isArray(obj?.actions) ? obj.actions.filter(isNonEmptyString).map((s) => s.trim()) : [];
  if (!reframe) throw new Error('reframe alanı eksik');
  while (actions.length < 3) {
    actions.push('Bu hafta 20 dakika ayırıp önerilen rollerden biriyle ilgili tek bir kaynağı incele ve 2 maddelik not çıkar.');
  }
  if (actions.length > 4) actions = actions.slice(0, 4);
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
- 5 rol üret (minimum 4, ideal 5).
- why: string veya string dizisi (en az iki net gerekçe).
- tags: kısa etiket dizisi (örn. data, ux, pm).
- resources: en az 3 kısa kaynak başlığı veya adı içeren dizi.
- Aşağıdaki profil ve disiplin matrisi özetine uy; metni kopyalama, kişiselleştir.`;

/** Groq: daha tutarlı rol + eğitim önerileri için sıkı karar kuralları. */
const GROQ_CAREER_SYSTEM = `Sen dünyanın en iyi kariyer koçu ve eğitim danışmanısın.
Kullanıcının disiplin grubu, bölüm bağlamı ve yetkinlik sinyallerini analiz ederek nokta atışı teknoloji rolleri ve eğitim önerileri üretiyorsun.

ZORUNLU ÇIKTI:
- Sadece TEK JSON nesnesi döndür (markdown, açıklama, code fence yok).
- Şema:
{
  "roles": [
    {
      "title": "Rol adı",
      "why": ["gerekçe1", "gerekçe2", "gerekçe3"],
      "tags": ["data","analytics","pm"],
      "resources": ["spesifik kaynak adı 1", "spesifik kaynak adı 2", "spesifik kaynak adı 3"],
      "employersTurkey": [{"name":"...", "url":"https://..."}],
      "salaryRange": {"junior":"...", "mid":"...", "senior":"...", "source":"..."},
      "internshipPrograms": [{"name":"...", "url":"https://...", "summary":"...", "eligibility":"..."}],
      "applicationPrograms": [{"name":"...", "url":"https://...", "forWho":"...", "summary":"..."}]
    }
  ]
}

ANALİZ KRİTERLERİ (zorunlu):
1) Disiplin Uyumu: Rol, kullanıcının disiplin/bölüm sinyaliyle teknik olarak uyumlu olmalı.
2) Yetenek Ağırlığı: Kullanıcının seçtiği ilgi ve keyif alanları gerekçede doğrudan anılsın.
3) Pazar Uygunluğu: Türkiye’de gerçek karşılığı olan ve güncel ekiplerde görülen roller seçilsin.
4) Öğrenme Gerçekçiliği: Önerilen adımlar kullanıcının zaman/çalışma modu tercihiyle uyumlu olsun.

ROL KALİTESİ:
- 5 rol üret (minimum 4, ideal 5).
- Her rol bir diğerinden anlamlı biçimde farklı olsun (aynı rolün varyasyonu olmasın).
- why alanı en az 3 kısa madde; kullanıcıdan gelen en az 2 sinyale doğrudan referans ver.
- tags alanı 3-5 etiket olsun; genel ve alakasız etiketlerden kaçın.

PROGRAM VE EĞİTİM KALİTESİ:
- resources alanında genel ifadeler YASAK ("Python kursu", "AI eğitimi" vb).
- Her kaynak mümkün olduğunca spesifik program/kurs/kitap/dokümantasyon adı içermeli.
- internshipPrograms ve applicationPrograms içinde marka + program adı seviyesinde netlik ver.
- Her program girdisi gerçekçi, tıklanabilir https URL içermeli.
- Her program girdisinde "kimler katılabilir" bilgisini açık yaz:
  • internshipPrograms.eligibility alanı zorunlu ve net kitle tanımı içermeli.
  • applicationPrograms.forWho alanı "Kimler katılabilir: ..." formatında başlamalı.

SPESİFİK PROGRAM KATALOĞU (öncelikli kullan; role göre seç):
- UP School: "Birbirini Geliştiren Kadınlar", "Future Talent Program", "AI-First Developer Programı" (https://upschool.io/)
- UP School (program sayfasındaki geçmiş programlardan role göre seç): "E-Ticarette Güçlü Kadınlar Programı", "Google Associate Cloud Engineer Certificate Programme", "AI-First Developer Programı", "Java Development Programı", "Machine Learning Program", "Data Analysis Programı", "Data Science Programı", "Frontend Development Programı", "Digital Marketing Programı" (https://www.upschool.io/program)
- SistersLab: "Women in Tech Academy", "Hepsiburada Yarınlara Söz Programı", STEAM/dijital beceri programları (https://sisterslab.org/)
- SistersLab (Projelerimiz bölümünü role göre kullan): "Tech4Youth", "Dijital Kızlar", "STEM Kızlara İyi Gelecek", "Tech+45", "Hepsiburada Yarınlara Söz Programı" (https://sisterslab.org/)
- Kodluyoruz: bootcamp ve topluluk programları (https://www.kodluyoruz.org/)
- Patika.dev: yazılım/veri patikaları, AI/Data öğrenme patikaları (https://www.patika.dev/)
- Women Techmakers: topluluk etkinlikleri (https://www.womentechmakers.com/)
- Google Developer Student Clubs: kampüs kulüpleri ve proje toplulukları (https://developers.google.com/community/gdsc)
- YGA: Young Guru Academy, Çift Kanatlı Liderlik / sosyal etki programları (https://www.yga.org.tr/)
- Geleceği Yazan Kadınlar: mentorluk ve eğitim programları (https://www.gelecegiyazankadinlar.com/)
- Teknolojide Kadın Derneği: program ve topluluk çalışmaları (https://www.teknolojidekadin.org/)
- Youthall: staj / yeni mezun program ve şirket program sayfaları (https://youthall.com/tr/)
- LinkedIn Jobs: şirketlerin güncel staj ve early-career ilanları (https://www.linkedin.com/jobs/)

BAĞLANTI GÜVENİLİRLİĞİ:
- Sadece güvenilir resmi alan adları kullan.
- Uydurma kurum, hayali program adı, test/example URL kullanma.
- Emin olmadığın durumda daha genel ama gerçek kurum/program adı ver; sahte detay uydurma.
- Staj/program URL'si için mümkünse resmi kariyer sayfası; alternatif olarak Youthall veya LinkedIn Jobs kullanılabilir.

salaryRange zorunlu:
- junior/mid/senior/source anahtarları mutlaka dolu.
- Türkiye brüt aylık bandı ver; kesin ücret iddiası kurma.

Dil:
- Türkçe, anlaşılır, yargılamayan ve motive eden ton.
- Profil/matris özetini kişiselleştir; metni ezber tekrar etme.`;

const BARRIER_SYSTEM = `Sen empati kuran bir kariyer koçusun. Kullanıcının yazdığı engeli kariyer dışlayıcı olarak değil,
yeniden çerçeveleyerek ele al. Yanıtın Türkçe olsun ve 3-4 somut aksiyon adımı içersin.
JSON formatında yanıt ver: {reframe, actions: [action1, action2, action3]}
Başka metin veya markdown ekleme; yalnızca tek bir JSON nesnesi.
"İmkansız", "yapamazsın" gibi dışlayıcı dil kullanma.`;

/** Groq: sözdizimi kararlılığı için ek sıkı kurallar (parse hatası → yedek metne düşmesin). */
const BARRIER_GROQ_SYSTEM = `Sen empati kuran bir kariyer koçusun. Kullanıcının yazdığı engeli yargılamadan, kariyer dışlayıcı değil,
yeniden çerçeveleyen bir dille ele al.

ZORUNLU ÇIKTI: Yalnızca TEK bir JSON nesnesi. Başında/sonunda açıklama yok; markdown yok; \`\`\` kod bloğu yok.
Şema (Türkçe metinler):
{"reframe":"4-6 cümle, destekleyici ve kişiye özel","actions":["somut aksiyon 1","somut aksiyon 2","somut aksiyon 3","opsiyonel aksiyon 4"]}

- reframe içinde: (1) duyguyu doğrula, (2) engeli yeniden çerçevele, (3) profil/rol bağlamına köprü kur, (4) kısa umut cümlesi ver.
- actions 3 veya 4 öğe olsun; her madde tek cümle, uygulanabilir ve net zaman/süre veya çıktı içersin.
- Her aksiyon mümkünse bu formata yakın olsun: "Ne yap? + ne kadar süre? + somut çıktı".
- İngilizce tek kelime düşmesin; kullanıcı Türkçe (ör. "necessary" yazma).
- "İmkansız", "yapamazsın", "asla" gibi dışlayıcı dil kullanma.`;

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
  const key = apiKey != null ? String(apiKey).trim() : '';
  if (!key) {
    throw new Error(
      getLlmProvider() === 'groq'
        ? 'Groq API anahtarı eksik — .env içinde VITE_GROQ_API_KEY'
        : 'Gemini API anahtarı eksik — .env içinde VITE_GEMINI_API_KEY',
    );
  }

  const userPayload = {
    profile: {
      facultyId: profile.facultyId,
      facultyLabel: profile.facultyLabel,
      departmentId: profile.departmentId,
      departmentLabel: profile.departmentLabel,
      disciplineId: profile.disciplineId,
      disciplineLabel: profile.disciplineLabel,
      interests: profile.interests,
      strengths: profile.strengths,
      deptInterests: profile.deptInterests,
      joyActivities: profile.joyActivities,
      learningStyle: profile.learningStyle,
      goal: profile.goal,
      disciplineFocus: profile.disciplineFocus,
      availability: profile.availability,
      availabilityLabel: profile.availabilityLabel,
      workMode: profile.workMode,
      workModeLabel: profile.workModeLabel,
      workEnvironment: profile.workEnvironment,
      workEnvironmentLabel: profile.workEnvironmentLabel,
      impactTheme: profile.impactTheme,
      impactThemeLabel: profile.impactThemeLabel,
      cityId: profile.cityId,
      cityLabel: profile.cityLabel,
    },
    matrixExcerpt: buildMatrixExcerpt(matrix, profile.disciplineId),
  };

  const prompt = `Aşağıdaki profil ve matris özetini kullanarak yalnızca JSON üret.\n\n${JSON.stringify(userPayload, null, 2)}`;

  if (getLlmProvider() === 'groq') {
    const text = await groqGenerateText({
      apiKey: key,
      systemInstruction: GROQ_CAREER_SYSTEM,
      userPrompt: prompt,
      temperature: 0.2,
    });
    return parseAndValidateCareerJson(text);
  }

  const text = await generateTextMultiModel(key, { systemInstruction: CAREER_SYSTEM }, prompt);
  return parseAndValidateCareerJson(text);
}

export async function runBarrierReframe({ apiKey, barrierText, profileSummary }) {
  const key = apiKey != null ? String(apiKey).trim() : '';
  if (!key) {
    throw new Error(
      getLlmProvider() === 'groq'
        ? 'Groq API anahtarı eksik — .env içinde VITE_GROQ_API_KEY'
        : 'Gemini API anahtarı eksik — .env içinde VITE_GEMINI_API_KEY',
    );
  }
  const rolesBlock = buildSuggestedRolesContext();
  const prompt = `Profil özeti: ${profileSummary}

Önceki analizde önerilen roller (localStorage oturumundan bağlam — kullanıcıya uygun yanıt verirken bunları dikkate al):
${rolesBlock}

Kullanıcının engeli: ${barrierText}`;

  if (getLlmProvider() === 'groq') {
    const text = await groqGenerateText({
      apiKey: key,
      systemInstruction: BARRIER_GROQ_SYSTEM,
      userPrompt: prompt,
      temperature: 0.2,
    });
    return parseBarrierResponse(text);
  }

  const text = await generateTextMultiModel(key, { systemInstruction: BARRIER_SYSTEM }, prompt);
  return parseBarrierResponse(text);
}
