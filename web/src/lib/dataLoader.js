import { validateEmployersTurkey } from './employersNormalize.js';

const MATRIX_URL = '/data/discipline_matrix.json';
const OPPS_URL = '/data/opportunities.json';

const OPP_TYPES = new Set(['program', 'community', 'course', 'scholarship']);

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function validateDayInLife(dil) {
  if (!dil || typeof dil !== 'object') return false;
  return (
    isNonEmptyString(dil.morning) &&
    isNonEmptyString(dil.afternoon) &&
    isNonEmptyString(dil.evening)
  );
}

/** Matriste eşleşme yoksa Results’ta kullanılır */
export const DEFAULT_DAY_IN_LIFE = {
  morning:
    'Sabah günlük önceliklerini ve mesajları kontrol eder, takım planına göre ilk üretken blokta derin çalışırsın.',
  afternoon:
    'Öğleden sonra paydaşlarla senkron veya tasarım/teknik toplantı yapar, çıktıları netleştirirsin.',
  evening: 'Akşam günü toparlar, notları ve ertesi günün küçük hedeflerini yazarsın.',
};

export function validateSalaryRange(sr) {
  if (!sr || typeof sr !== 'object') return false;
  return (
    isNonEmptyString(sr.junior) &&
    isNonEmptyString(sr.mid) &&
    isNonEmptyString(sr.senior) &&
    isNonEmptyString(sr.source)
  );
}

/** Matriste eşleşme yoksa Results’ta kullanılır (brüt ₺/ay, büyük şehir yöneltici) */
export const DEFAULT_SALARY_RANGE = {
  junior: '32.000 - 50.000 ₺',
  mid: '50.000 - 78.000 ₺',
  senior: '78.000 - 120.000 ₺',
  source: 'LinkedIn · Kariyer.net · Glassdoor TR · Indeed TR (2024-2025 tahmini, brüt ₺/ay)',
};

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
      if (!validateDayInLife(rm.dayInLife)) return { ok: false, error: 'dayInLife geçersiz' };
      if (!validateSalaryRange(rm.salaryRange)) return { ok: false, error: 'salaryRange geçersiz' };
      if (!validateEmployersTurkey(rm.employersTurkey)) return { ok: false, error: 'employersTurkey geçersiz' };
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

/**
 * Gemini veya eski oturum rollerinde dayInLife yoksa matristen tamamlar.
 */
export function findDayInLifeInMatrix(matrix, disciplineId, role) {
  if (!Array.isArray(matrix) || !disciplineId || !role) return null;
  const row = getDisciplineById(matrix, disciplineId);
  if (!row?.roleMatches?.length) return null;
  const id = typeof role.roleId === 'string' ? role.roleId.trim() : '';
  if (id) {
    const rm = row.roleMatches.find((x) => x.roleId === id);
    if (rm?.dayInLife && validateDayInLife(rm.dayInLife)) {
      return { morning: rm.dayInLife.morning.trim(), afternoon: rm.dayInLife.afternoon.trim(), evening: rm.dayInLife.evening.trim() };
    }
  }
  const name = typeof role.roleName === 'string' ? role.roleName.trim().toLowerCase() : '';
  if (name) {
    const rm = row.roleMatches.find((x) => (x.roleName ?? '').trim().toLowerCase() === name);
    if (rm?.dayInLife && validateDayInLife(rm.dayInLife)) {
      return { morning: rm.dayInLife.morning.trim(), afternoon: rm.dayInLife.afternoon.trim(), evening: rm.dayInLife.evening.trim() };
    }
  }
  return null;
}

export function findSalaryRangeInMatrix(matrix, disciplineId, role) {
  if (!Array.isArray(matrix) || !disciplineId || !role) return null;
  const row = getDisciplineById(matrix, disciplineId);
  if (!row?.roleMatches?.length) return null;
  const id = typeof role.roleId === 'string' ? role.roleId.trim() : '';
  if (id) {
    const rm = row.roleMatches.find((x) => x.roleId === id);
    if (rm?.salaryRange && validateSalaryRange(rm.salaryRange)) {
      return {
        junior: rm.salaryRange.junior.trim(),
        mid: rm.salaryRange.mid.trim(),
        senior: rm.salaryRange.senior.trim(),
        source: rm.salaryRange.source.trim(),
      };
    }
  }
  const name = typeof role.roleName === 'string' ? role.roleName.trim().toLowerCase() : '';
  if (name) {
    const rm = row.roleMatches.find((x) => (x.roleName ?? '').trim().toLowerCase() === name);
    if (rm?.salaryRange && validateSalaryRange(rm.salaryRange)) {
      return {
        junior: rm.salaryRange.junior.trim(),
        mid: rm.salaryRange.mid.trim(),
        senior: rm.salaryRange.senior.trim(),
        source: rm.salaryRange.source.trim(),
      };
    }
  }
  return null;
}

export function findEmployersInMatrix(matrix, disciplineId, role) {
  if (!Array.isArray(matrix) || !disciplineId || !role) return null;
  const row = getDisciplineById(matrix, disciplineId);
  if (!row?.roleMatches?.length) return null;
  const id = typeof role.roleId === 'string' ? role.roleId.trim() : '';
  if (id) {
    const rm = row.roleMatches.find((x) => x.roleId === id);
    if (rm?.employersTurkey && validateEmployersTurkey(rm.employersTurkey)) return rm.employersTurkey;
  }
  const name = typeof role.roleName === 'string' ? role.roleName.trim().toLowerCase() : '';
  if (name) {
    const rm = row.roleMatches.find((x) => (x.roleName ?? '').trim().toLowerCase() === name);
    if (rm?.employersTurkey && validateEmployersTurkey(rm.employersTurkey)) return rm.employersTurkey;
  }
  return null;
}
