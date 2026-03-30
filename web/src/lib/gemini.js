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

function normalizeStepText(step) {
  const text = String(step ?? '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  const hasThirtyMin = /30\s*dak/.test(lower);
  const isProgramLike = /(program|up school|sisterslab|bootcamp|akademi|academy)/i.test(text);
  if (hasThirtyMin && isProgramLike) {
    return 'Programın başvuru/takvim sayfasını kontrol et; canlı ders saatlerinden uygun oturumu takvimine ekleyip kaydını tamamla.';
  }
  return text;
}

/**
 * UP School program sayfasında listelenen / Pusula veri katmanında doğrulanmış adlar.
 * "Simülasyon Programı", "X Patikası", "X Bootcamp" gibi rol-uyarlama isimleri YASAK — halüsinasyon.
 */
const UP_SCHOOL_KNOWN_FRAGMENTS = [
  'birbirini geliştiren',
  'future talent',
  'ai-first',
  'e-ticarette',
  'google associate cloud engineer',
  'java development',
  'machine learning program',
  'data analysis program',
  'data science program',
  'frontend development program',
  '.net core',
  'android development',
  'ios development',
  'digital marketing program',
  'rpa program',
  'teknolojide güvenlik akademisi',
  'solana blockchain',
  'sign up for a europeantech',
  'growth companion',
  'up ai',
  'mentorluk ve kariyer',
];

const UP_SCHOOL_SAFE_LINE =
  'UP School — resmi program listesinden rolüne uygun olanı seç: https://www.upschool.io/program';
const PATIKA_SAFE_LINE = 'Patika.dev — patika ve bootcamp sayfaları: https://www.patika.dev/';
const KODLUYORUZ_SAFE_LINE = 'Kodluyoruz — programlar ve bootcamp duyuruları: https://www.kodluyoruz.org/';

function normResource(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/** resources[] satırı: marka + uydurma program adını generic güvenli satıra çevirir. */
function sanitizeCareerResourceLine(line) {
  const raw = String(line ?? '').trim();
  if (!raw) return '';
  const n = normResource(raw);

  if (/up\s*school|upschool/.test(n)) {
    const hit = UP_SCHOOL_KNOWN_FRAGMENTS.some((frag) => n.includes(normResource(frag)));
    if (hit) return raw;
    if (/upschool\.io\/program/.test(raw)) return raw;
    return UP_SCHOOL_SAFE_LINE;
  }

  /* resources[]: özel patika/bootcamp yol adları yerine genel portal (prompt da kitap odaklı) */
  if (n.includes('patika')) {
    return PATIKA_SAFE_LINE;
  }
  if (n.includes('kodluyoruz') || n.includes('kodluyor')) {
    return KODLUYORUZ_SAFE_LINE;
  }

  return raw;
}

/** applicationPrograms kaydı: UP School için yalnızca bilinen isimler; değilse güvenli başlık. */
function sanitizeLlmApplicationProgramRecord(p) {
  if (!p || typeof p !== 'object') return p;
  const name = String(p.name ?? '').trim();
  if (!name) return p;
  const n = normResource(name);
  const url = String(p.url ?? '');
  if (/up\s*school|upschool/.test(n) || /upschool\.io/i.test(url)) {
    const hit = UP_SCHOOL_KNOWN_FRAGMENTS.some((frag) => n.includes(normResource(frag)));
    if (!hit) {
      return {
        ...p,
        name: 'UP School — programlar (resmi liste)',
        url: /^https:\/\/(www\.)?upschool\.io\/program/i.test(url) ? url : 'https://www.upschool.io/program',
      };
    }
  }
  if (n.includes('patika') && /simulasyon|simulation/.test(n)) {
    return { ...p, name: 'Patika.dev — öğrenme patikaları', url: /^https:\/\/www\.patika\.dev/i.test(url) ? url : 'https://www.patika.dev/' };
  }
  if ((n.includes('kodluyoruz') || n.includes('kodluyor')) && /simulasyon|simulation/.test(n)) {
    return {
      ...p,
      name: 'Kodluyoruz — bootcamp ve programlar',
      url: /^https:\/\/(www\.)?kodluyoruz\.org/i.test(url) ? url : 'https://www.kodluyoruz.org/',
    };
  }
  return p;
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
  const meta = pickSalaryMetaFromObject(raw);
  return { junior, mid, senior, source, ...meta };
}

function pickSalaryMetaFromObject(raw) {
  if (!raw || typeof raw !== 'object') return {};
  let methodology = '';
  let referenceYear = '';
  for (const [key, val] of Object.entries(raw)) {
    const nk = normSalaryKey(key);
    const s = asTrimmedString(val);
    if (!s) continue;
    if (nk === 'methodology' || nk === 'methodoloji' || nk === 'yontem' || nk.includes('methodol')) {
      methodology = s;
      continue;
    }
    if (
      nk === 'referenceyear' ||
      nk === 'referansyili' ||
      nk === 'veriyili' ||
      nk === 'yil' ||
      nk === 'datayear'
    ) {
      referenceYear = s;
    }
  }
  const out = {};
  if (methodology) out.methodology = methodology;
  if (referenceYear) out.referenceYear = referenceYear;
  return out;
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
      const parts = r.resources
        .split(/[,;]\s*|\n/)
        .map((x) => x.trim())
        .filter(Boolean);
      starterResources = parts.length ? parts : [r.resources.trim()];
    }
  }
  if (!starterResources.length && Array.isArray(r?.starterResources)) {
    starterResources = r.starterResources.filter(isNonEmptyString).map((s) => s.trim());
  }
  starterResources = starterResources.map(sanitizeCareerResourceLine).filter(Boolean);
  {
    const seen = new Set();
    starterResources = starterResources.filter((s) => {
      const k = s.trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  let firstSteps = Array.isArray(r?.firstSteps)
    ? r.firstSteps.filter(isNonEmptyString).map((s) => normalizeStepText(s))
    : [];

  let tags = [];
  if (usesCompact && Array.isArray(r.tags)) {
    tags = r.tags.filter(isNonEmptyString).map((s) => s.trim().toLowerCase());
  }
  if (!tags.length && Array.isArray(r?.tags)) {
    tags = r.tags.filter(isNonEmptyString).map((s) => s.trim().toLowerCase());
  }

  const employersTurkey = normalizeEmployersList(Array.isArray(r?.employersTurkey) ? r.employersTurkey : [], 8);

  let internshipPrograms = normalizeInternshipProgramsWithLlmFallback(pickInternshipProgramsRaw(r), 6);
  internshipPrograms = internshipPrograms.map((p) => {
    if (!p?.name) return p;
    const n = normResource(p.name);
    if (!/up\s*school|upschool/.test(n)) return p;
    const hit = UP_SCHOOL_KNOWN_FRAGMENTS.some((frag) => n.includes(normResource(frag)));
    if (hit) return p;
    return { ...p, name: 'UP School — programlar (resmi)', url: 'https://www.upschool.io/program' };
  });

  const llmApplicationPrograms = normalizeLlmApplicationPrograms(
    Array.isArray(r?.applicationPrograms) ? r.applicationPrograms : [],
    5,
  ).map(sanitizeLlmApplicationProgramRecord);

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
    const meta = pickSalaryMetaFromObject(rawSr);
    if (meta.methodology) salaryRange.methodology = meta.methodology;
    if (meta.referenceYear) salaryRange.referenceYear = meta.referenceYear;
  } else {
    const coerced = coerceSalaryRangeObject(rawSr);
    if (coerced) salaryRange = coerced;
  }

  if (!firstSteps.length) {
    const portalLike = (s) =>
      /patika\.dev|kodluyoruz|upschool|http/i.test(String(s ?? ''));
    const bookOrDoc =
      starterResources.find((s) => !portalLike(s)) ?? starterResources[0] ?? null;
    const step0 = bookOrDoc
      ? `Şu kaynaktan ilk bölümü veya giriş ünitesini bu hafta bitir ve dört maddelik özet yaz: ${bookOrDoc}.`
      : 'Rolüne uygun bir giriş kitabı veya resmi dokümantasyon seç; ilk bölümü bu hafta bitir ve kısa not çıkar.';
    firstSteps = [
      step0,
      'Bu hafta tamamlayacağın tek küçük çıktıyı (ör. özet, küçük egzersiz, mini not) yaz.',
      'İlerleyen hafta için takvimine bir sonraki bölümü veya bir uygulamalı mini görevi blokla.',
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
          resources: [
            'Rolüne uygun çok okunan bir giriş kitabı seç (başlık ve yazar adıyla).',
            'İlgili konuda resmi dokümantasyon veya ücretsiz ders notu (ör. Khan Academy, Python.org) işaretle.',
            'Seçtiğin kitabın ilk iki bölümü için haftalık okuma planı yaz.',
          ],
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
      const pad = [
        'Üniversite kütüphanesinde veya açık erişimde aynı konuda bir ders kitabı araştır.',
        'Rol etiketlerinden biriyle arama yapıp bir “getting started” rehberi veya resmi öğretici sayfası ekle.',
      ];
      let i = 0;
      while (r.starterResources.length < 3) {
        r.starterResources.push(pad[i % pad.length]);
        i += 1;
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
- why: string veya string dizisi (en az iki net gerekçe). Profilde techDomainInterests, techHandsOnInterests, techContextInterests doluysa en az bir gerekçede bu teknoloji sinyallerinden birini doğrudan an.
- tags: kısa etiket dizisi (örn. data, ux, pm).
- resources: en az 3 madde; çoğunluğu gerçek kitap adı (yazar ile) veya tanınmış dokümantasyon / kaliteli giriş kaynağı; bootcamp veya patika özel program adları buraya değil (bunlar ayrı program listelerinde).
- Tam şema kullanıyorsan salaryRange içinde source, referenceYear ve methodology (kaynak türü ve yıl açıklaması) alanlarını doldur.
- facultyLabel / departmentLabel / disiplin bilgisini ve aşağıdaki JSON’daki tüm profil alanlarını kullan; metni kopyalama, kişiselleştir.`;

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
      "resources": ["Yazar — Kitap adı 1", "Yazar — Kitap adı 2", "Resmi dokümantasyon veya güvenilir giriş kaynağı"],
      "employersTurkey": [{"name":"...", "url":"https://..."}],
      "salaryRange": {"junior":"...", "mid":"...", "senior":"...", "source":"Kısa kaynak etiketi (örn. Glassdoor TR · Kariyer.net)", "referenceYear":"2025", "methodology":"3-5 cümle: hangi kaynak türlerine dayandın, hangi şehir/segment varsayımı, nasıl yuvarladın; kesin ücret olmadığını belirt"},
      "internshipPrograms": [{"name":"...", "url":"https://...", "summary":"...", "eligibility":"..."}],
      "applicationPrograms": [{"name":"...", "url":"https://...", "forWho":"...", "summary":"..."}]
    }
  ]
}

PROFİL JSON — ALAN ANLAMI (kullanıcı gövdesinde gelir; hepsini oku):
- facultyLabel / departmentLabel: Gerçek üniversite fakülte ve bölüm adı (bağlam ve geçiş hikâyesi için).
- disciplineId / disciplineLabel: Matris eşlemesi; rol önerisi teknik tutarlılık için temel.
- interests, strengths (veya deptInterests, joyActivities): Bölüm bazlı akademik ilgi ve keyif maddeleri.
- techDomainInterests: Teknoloji dünyasında kullanıcıyı çeken alanlar (ör. bulut, veri mühendisliği, güvenlik).
- techHandsOnInterests: Teknolojiyle yapmak veya öğrenmek istediği pratikler (ör. prototip, script, dashboard).
- techContextInterests: Yakın hissettiği ortam veya rol tipi (ör. startup, kurumsal ürün, araştırma).
Bu üç tech* dizide yalnızca "Belirtmek istemiyorum" varsa o kova kişisel sinyal değildir; gerekçede zorunlu tutma. Anlamlı maddeler varsa roller ve why metni bunlarla açıkça ilişkilendirilmeli.

YÖNELİM TESTİ (orientation — gövdede nesne olarak gelir):
- Kullanıcı JSON içinde "orientation" alanında archetypeId, archetypeLabel, headline (ve varsa subline, scoreHints) ile yönelim özetini gönderir.
- orientation null değilse roller ve en az iki why maddesi bu yön ile uyumlu olmalı; matris disipliniyle çelişen öneri verme. Yönelim + bölüm + tech sinyallerini birlikte kullan.
- orientation null ise yalnızca profil ve matris özetiyle yürü.

ANALİZ KRİTERLERİ (zorunlu):
1) Disiplin ve bölüm uyumu: Rol, disciplineLabel / matris ile teknik olarak uyumlu olmalı; mümkünse facultyLabel veya departmentLabel bağlamı gerekçede tek cümleyle hatırlatılabilir (kopya metin değil, kişiselleştir).
2) İlgi ve keyif: deptInterests / interests ve joyActivities / strengths gerekçede doğrudan anılmalı (en az bir why maddesinde somut referans).
3) Teknoloji üçlüsü: techDomainInterests, techHandsOnInterests ve techContextInterests içinde anlamlı seçimler varsa, toplamda en az iki why maddesi bu alanlardan en az birine doğrudan temas etmeli; roller seçilirken bu yönlerden en az biri (alan, pratik veya ortam) dikkate alınmalı.
4) Pazar uygunluğu: Türkiye’de gerçek karşılığı olan ve güncel ekiplerde görülen roller seçilsin.
5) Öğrenme gerçekçiliği: İlk adımlar ve kaynak önerileri learningStyle, availabilityLabel, workModeLabel ve goal ile uyumlu olsun; impactThemeLabel ve cityLabel fırsat/ton için ipucu verir.

ROL KALİTESİ:
- 5 rol üret (minimum 4, ideal 5).
- Her rol bir diğerinden anlamlı biçimde farklı olsun (aynı rolün varyasyonu olmasın).
- why alanı en az 3 kısa madde; kullanıcıdan gelen en az 2 farklı sinyal tipine doğrudan referans ver (ör. bölüm ilgisi + teknoloji alanı, veya keyif + ortam tercihi).
- tags alanı 3-5 etiket olsun; genel ve alakasız etiketlerden kaçın.

BAŞLANGIÇ KAYNAKLARI (resources — arayüzde "Başlangıç kaynakları"):
- Tam olarak en az 3 madde; bunlardan en az 2’si gerçek kitap adı olmalı (mümkünse "Yazar — Başlık" formatında; Türkçe veya İngilizce; örn. "Andy Hunt, Dave Thomas — Pragmatik Programcı", "Charles Petzold — Code", "Albert Cairo — The Truthful Art", "Joel Grus — Data Science from Scratch").
- Kalan maddeler: resmi dokümantasyon, ücretsiz ders notu veya güvenilir giriş kaynağı (örn. "Python.org — Tutorial", "MDN — Learn HTML"; soyut "Python kursu", "AI eğitimi" YASAK).
- Bu diziye bootcamp veya platforma özel uydurma yol/program adı koyma (örn. "Veri Analizi Patikası", "X Bootcamp 2026" uydurması); böyle içerik internshipPrograms / applicationPrograms içinde URL ve bilinen katalogla verilsin.
- En fazla 1 madde genel portal olabilir (örn. Patika veya Kodluyoruz ana site — tek satır); öncelik her zaman kitap ve temel öğrenme.

PROGRAM VE BOOTCAMP LİSTELERİ (internshipPrograms / applicationPrograms):
- Burada marka + bilinen veya katalogdaki program adı ve net https URL kullan.
- Her program girdisi gerçekçi, tıklanabilir https URL içermeli.
- Her program girdisinde "kimler katılabilir" bilgisini açık yaz:
  • internshipPrograms.eligibility alanı zorunlu ve net kitle tanımı içermeli.
  • applicationPrograms.forWho alanı "Kimler katılabilir: ..." formatında başlamalı.

HALÜSİNASYON YASAĞI (kritik):
- resources içinde uydurma "X Patikası", "Y Bootcamp" özel adı veya rol uydurmak için sahte kurs adı yazma; şüphede kitap veya genel resmi dokümantasyon öner.
- Rol adına göre uydurma program adı yazma (örn. "Simülasyon Programı", "Simülasyon Patikası", "Simülasyon Bootcamp").
- UP School için YALNIZCA aşağıdaki katalogdaki tam program adlarından birini kullan veya genel yaz: "UP School — programlar: https://www.upschool.io/program"
- Simülasyon / operasyon araştırması ilgisi için uygunsa tek istisna: "UP AI Growth Companion" (rol simülasyonu / mikro öğrenme; https://www.upschool.io/en/up veya upschool.io çatısı) — "UP School Simülasyon Programı" diye AYRI bir bootcamp adı uydurma.
- Patika.dev için site dışında uydurma patika adı yazma; şüphede: "Patika.dev — https://www.patika.dev/"
- Kodluyoruz için uydurma bootcamp adı yazma; şüphede: "Kodluyoruz — https://www.kodluyoruz.org/"

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

salaryRange (her rol için zorunlu):
- junior, mid, senior, source mutlaka dolu; Türkiye brüt aylık bandı; kesin ücret iddiası kurma.
- referenceYear: veriyi hangi yıla veya döneme yakın düşündüğün (örn. "2025", "2024–2025") — tek kısa ifade.
- methodology: 3-5 tam cümle Türkçe; şunları açık yaz: (1) Örnekleme için hangi kaynak türlerini kullandın (LinkedIn/Kariyer.net/Glassdoor TR/Indeed TR/şirket kariyer sayfaları/sektör blogları vb.), (2) bandı hangi kariyer seviyesine göre yuvarladın, (3) şehir veya segment varsayımı (örn. İstanbul kurumsal teknoloji), (4) Bu çıktının tahmin olduğu ve gerçek tekliften sapabileceği.
- source alanı kısa bir etiket cümlesi olabilir; ayrıntı methodology içinde olmalı.

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

export async function runCareerAnalysis({ apiKey, profile, matrix, orientation }) {
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
      techDomainInterests: profile.techDomainInterests,
      techHandsOnInterests: profile.techHandsOnInterests,
      techContextInterests: profile.techContextInterests,
    },
    matrixExcerpt: buildMatrixExcerpt(matrix, profile.disciplineId),
    orientation: orientation ?? null,
  };

  const prompt = `Aşağıdaki profil, yönelim (varsa) ve matris özetini kullanarak yalnızca JSON üret.\n\n${JSON.stringify(userPayload, null, 2)}`;

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
