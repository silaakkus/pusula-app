/**
 * employersTurkey: dizi içinde düz metin veya { name, url? } karışık olabilir.
 */

function isHttpsUrl(s) {
  return typeof s === 'string' && /^https:\/\//i.test(s.trim());
}

export function normalizeEmployerEntry(e) {
  if (typeof e === 'string' && e.trim()) return { name: e.trim(), url: null };
  if (e && typeof e === 'object' && typeof e.name === 'string' && e.name.trim()) {
    const name = e.name.trim();
    const rawUrl = e.url ?? e.careerUrl;
    const url = isHttpsUrl(rawUrl) ? String(rawUrl).trim() : null;
    return { name, url };
  }
  return null;
}

export function normalizeEmployersList(arr, max = 8) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const e of arr) {
    const n = normalizeEmployerEntry(e);
    if (n) out.push(n);
    if (out.length >= max) break;
  }
  return out;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Matris JSON doğrulaması */
export function validateEmployersTurkey(arr) {
  if (!Array.isArray(arr) || arr.length < 1) return false;
  for (const e of arr) {
    if (isNonEmptyString(e)) continue;
    if (e && typeof e === 'object' && isNonEmptyString(e.name)) {
      const u = e.url ?? e.careerUrl;
      if (u != null && String(u).trim() !== '' && !isHttpsUrl(String(u))) return false;
      continue;
    }
    return false;
  }
  return true;
}
