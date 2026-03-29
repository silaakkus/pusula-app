function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isHttpsUrl(s) {
  return typeof s === 'string' && /^https:\/\//i.test(s.trim());
}

/** Groq sık `http://` döndürür; sıkı https kontrolü tüm AI stajlarını siler. */
export function normalizeToHttpsUrl(raw) {
  const s = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
  if (!s) return '';
  if (/^https:\/\//i.test(s)) return s;
  if (/^http:\/\//i.test(s)) return `https://${s.slice(7)}`;
  return '';
}

const BLOCKED_LLM_HOSTNAMES = new Set([
  'localhost',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'invalid',
  'fake',
]);

/**
 * Bariz sahte / test URL’lerini ele; geri kalanı modele bırak (tarayıcıda doğrulama yok).
 */
export function isRejectableLlmUrl(urlStr) {
  const s = normalizeToHttpsUrl(urlStr);
  if (!s) return true;
  if (/^(javascript|data|vbscript):/i.test(s)) return true;
  try {
    const u = new URL(s);
    if (u.username || u.password) return true;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (!host.includes('.') || host.length < 4) return true;
    if (BLOCKED_LLM_HOSTNAMES.has(host)) return true;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    return false;
  } catch {
    return true;
  }
}

export function validateInternshipPrograms(arr) {
  if (!Array.isArray(arr) || arr.length < 1) return false;
  for (const p of arr) {
    if (!p || typeof p !== 'object') return false;
    if (!isNonEmptyString(p.name) || !isNonEmptyString(p.summary) || !isNonEmptyString(p.eligibility)) return false;
    if (!isHttpsUrl(p.url)) return false;
  }
  return true;
}

export function normalizeInternshipPrograms(arr, max = 6) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const p of arr) {
    if (!p || typeof p !== 'object') continue;
    const url = normalizeToHttpsUrl(p.url);
    if (!isNonEmptyString(p.name) || !url || !isNonEmptyString(p.summary) || !isNonEmptyString(p.eligibility)) {
      continue;
    }
    out.push({
      name: p.name.trim(),
      url,
      summary: p.summary.trim(),
      eligibility: p.eligibility.trim(),
    });
    if (out.length >= max) break;
  }
  return out;
}

const LLM_INTERN_SUMMARY_FALLBACK =
  'Resmi başvuru sayfasındaki güncel metni kontrol et; pencereler yıla göre değişebilir.';
const LLM_INTERN_ELIGIBILITY_FALLBACK =
  'Kurumun ilanındaki şartlara göre değişir; sayfayı inceleyerek doğrula.';

function firstNonEmptyString(...vals) {
  for (const v of vals) {
    if (isNonEmptyString(v)) return v.trim();
  }
  return '';
}

/**
 * Groq/Gemini sık sık yalnızca name+url döndürür; summary/eligibility eksik kalınca matriste düşülürdü.
 * name + https url zorunlu; diğer alanlar doldurulur veya kısa varsayılan.
 */
export function normalizeInternshipProgramsWithLlmFallback(arr, max = 6) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const p of arr) {
    if (!p || typeof p !== 'object') continue;
    const url = normalizeToHttpsUrl(p.url);
    if (!isNonEmptyString(p.name) || !url || isRejectableLlmUrl(url)) continue;

    const strict = normalizeInternshipPrograms([{ ...p, url }], 1);
    if (strict.length) {
      out.push(strict[0]);
    } else {
      const summary = firstNonEmptyString(
        p.summary,
        p.description,
        p.desc,
        p.detail,
        p.about,
      );
      const eligibility = firstNonEmptyString(
        p.eligibility,
        p.who,
        p.forWho,
        p.requirements,
        p.kimler,
      );
      out.push({
        name: p.name.trim(),
        url,
        summary: summary || LLM_INTERN_SUMMARY_FALLBACK,
        eligibility: eligibility || LLM_INTERN_ELIGIBILITY_FALLBACK,
      });
    }
    if (out.length >= max) break;
  }
  return out;
}

/**
 * LLM’den gelen başvurulabilir program / bootcamp / burs sayfaları (staj alanından ayrı).
 * forWho veya summary’den en az biri dolu olmalı.
 */
export function normalizeLlmApplicationPrograms(arr, max = 5) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const p of arr) {
    if (!p || typeof p !== 'object') continue;
    const url = normalizeToHttpsUrl(p.url);
    if (!isNonEmptyString(p.name) || !url || isRejectableLlmUrl(url)) continue;
    const forWhoRaw = isNonEmptyString(p.forWho) ? p.forWho.trim() : '';
    const summaryRaw = isNonEmptyString(p.summary) ? p.summary.trim() : '';
    const forWho = forWhoRaw || summaryRaw;
    if (!forWho) continue;
    out.push({
      name: p.name.trim(),
      url,
      forWho,
      summary: summaryRaw && summaryRaw !== forWho ? summaryRaw : '',
    });
    if (out.length >= max) break;
  }
  return out;
}
