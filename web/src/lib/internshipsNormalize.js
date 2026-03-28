function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isHttpsUrl(s) {
  return typeof s === 'string' && /^https:\/\//i.test(s.trim());
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
    if (!isNonEmptyString(p.name) || !isHttpsUrl(p.url) || !isNonEmptyString(p.summary) || !isNonEmptyString(p.eligibility)) {
      continue;
    }
    out.push({
      name: p.name.trim(),
      url: String(p.url).trim(),
      summary: p.summary.trim(),
      eligibility: p.eligibility.trim(),
    });
    if (out.length >= max) break;
  }
  return out;
}
