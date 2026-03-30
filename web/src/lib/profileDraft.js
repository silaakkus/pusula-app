import { loadFlowSnapshot } from './pusulaFlow.js';

export const PUSULA_PROFILE_DRAFT_KEY = 'pusula_profile_draft';

/** Profil tamamlanmadan ana sayfaya dönüldüğünde sürdürülebilir taslak. */
export function saveProfileDraft(payload) {
  try {
    localStorage.setItem(PUSULA_PROFILE_DRAFT_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadProfileDraft() {
  try {
    const raw = localStorage.getItem(PUSULA_PROFILE_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return o;
  } catch {
    return null;
  }
}

export function clearProfileDraft() {
  try {
    localStorage.removeItem(PUSULA_PROFILE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Taslakta anlamlı ilerleme var mı? */
export function hasProfileDraft() {
  const d = loadProfileDraft();
  if (!d) return false;
  if (d.facultyId && String(d.facultyId).trim()) return true;
  if (d.departmentId && String(d.departmentId).trim()) return true;
  if (d.disciplineId && String(d.disciplineId).trim()) return true;
  if (Array.isArray(d.deptInterests) && d.deptInterests.length > 0) return true;
  if (Array.isArray(d.joyActivities) && d.joyActivities.length > 0) return true;
  if (d.deptInterestSkip || d.joySkip) return true;
  if (d.goalId && d.goalId !== 'explore') return true;
  if (d.cityId && d.cityId !== 'all') return true;
  if (d.learningStyle && d.learningStyle !== 'mixed') return true;
  return false;
}

export function hasResumeAvailable() {
  if (loadFlowSnapshot()) return true;
  return hasProfileDraft();
}

export function getResumeSummaryText() {
  const s = loadFlowSnapshot();
  if (s?.profile?.disciplineLabel) return s.profile.disciplineLabel;
  const d = loadProfileDraft();
  if (d?.disciplineLabel) return `${d.disciplineLabel} (taslak)`;
  if (hasProfileDraft()) return 'Taslak profil';
  return 'Kayıtlı oturum';
}
