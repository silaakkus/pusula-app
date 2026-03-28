const MATRIX_URL = '/data/discipline_matrix.json';
const OPPS_URL = '/data/opportunities.json';

const OPP_TYPES = new Set(['program', 'community', 'course', 'scholarship']);

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateStringArray(arr, minLen = 0) {
  if (!Array.isArray(arr)) return false;
  if (arr.length < minLen) return false;
  return arr.every((x) => isNonEmptyString(x));
}

export function validateDisciplineMatrix(raw) {
  if (!Array.isArray(raw)) return { ok: false, error: 'Matris dizi değil' };
  for (const row of raw) {
    if (!isNonEmptyString(row?.disciplineId) || !isNonEmptyString(row?.disciplineName)) {
      return { ok: false, error: 'Geçersiz disiplin kaydı' };
    }
    if (!Array.isArray(row.roleMatches) || row.roleMatches.length === 0) {
      return { ok: false, error: 'roleMatches eksik' };
    }
    for (const rm of row.roleMatches) {
      if (!isNonEmptyString(rm?.roleId) || !isNonEmptyString(rm?.roleName)) return { ok: false, error: 'Rol kimliği eksik' };
      if (!validateStringArray(rm.whyFits, 1)) return { ok: false, error: 'whyFits geçersiz' };
      if (!validateStringArray(rm.firstSteps, 1)) return { ok: false, error: 'firstSteps geçersiz' };
      if (!validateStringArray(rm.tags, 1)) return { ok: false, error: 'tags geçersiz' };
    }
  }
  return { ok: true, data: raw };
}

export function validateOpportunities(raw) {
  if (!Array.isArray(raw)) return { ok: false, error: 'Fırsat listesi dizi değil' };
  for (const o of raw) {
    if (!isNonEmptyString(o?.opportunityId) || !isNonEmptyString(o?.name)) {
      return { ok: false, error: 'Fırsat kimliği veya adı eksik' };
    }
    if (!OPP_TYPES.has(o?.type)) return { ok: false, error: `Geçersiz type: ${o?.type}` };
    if (!validateStringArray(o.targetTags, 1)) return { ok: false, error: 'targetTags geçersiz' };
    if (!isNonEmptyString(o?.forWho) || !isNonEmptyString(o?.url)) {
      return { ok: false, error: 'forWho veya url eksik' };
    }
    if (o.cities != null) {
      if (!Array.isArray(o.cities) || !validateStringArray(o.cities, 1)) {
        return { ok: false, error: 'cities geçersiz' };
      }
    }
  }
  return { ok: true, data: raw };
}

export async function loadDisciplineMatrix() {
  const res = await fetch(MATRIX_URL);
  if (!res.ok) throw new Error(`Matris yüklenemedi (${res.status})`);
  const raw = await res.json();
  const v = validateDisciplineMatrix(raw);
  if (!v.ok) throw new Error(v.error);
  return v.data;
}

export async function loadOpportunities() {
  const res = await fetch(OPPS_URL);
  if (!res.ok) throw new Error(`Fırsatlar yüklenemedi (${res.status})`);
  const raw = await res.json();
  const v = validateOpportunities(raw);
  if (!v.ok) throw new Error(v.error);
  return v.data;
}

export async function loadPusulaData() {
  const [matrix, opportunities] = await Promise.all([loadDisciplineMatrix(), loadOpportunities()]);
  return { matrix, opportunities };
}

export function getDisciplineById(matrix, disciplineId) {
  return matrix.find((d) => d.disciplineId === disciplineId) ?? null;
}
