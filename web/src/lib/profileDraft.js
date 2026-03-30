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
  if (d.availability && d.availability !== 'medium') return true;
  if (d.workMode && d.workMode !== 'balanced') return true;
  if (d.workEnvironment && d.workEnvironment !== 'hybrid') return true;
  if (d.impactTheme && d.impactTheme !== 'social-impact') return true;
  if (Array.isArray(d.techDomainPicks) && d.techDomainPicks.length > 0) return true;
  if (Array.isArray(d.techHandsOnPicks) && d.techHandsOnPicks.length > 0) return true;
  if (Array.isArray(d.techContextPicks) && d.techContextPicks.length > 0) return true;
  if (d.techDomainSkip || d.techHandsOnSkip || d.techContextSkip) return true;
  return false;
}

const FLOW_STEP_LABELS = {
  profile: 'Profil',
  baseline: 'Ön anket',
  analyzing: 'Analiz',
  results: 'Sonuçlar',
  barrier: 'Engel',
  barrierReview: 'Engel özeti',
  postsurvey: 'Son anket',
  card: 'Kariyer kartı',
};

export function profileHeadlineFromObject(o) {
  if (!o || typeof o !== 'object') return '';
  // Kullanıcıya fakülte + bölüm göster; disiplin başlığı (ör. İİBF kümesi) özet satırında gizli kalsın.
  const parts = [o.facultyLabel, o.departmentLabel].filter((x) => typeof x === 'string' && x.trim());
  return parts.length ? parts.join(' · ') : '';
}

export function hasResumeAvailable() {
  if (loadFlowSnapshot()) return true;
  return hasProfileDraft();
}

export function getResumeSummaryText() {
  const s = loadFlowSnapshot();
  if (s?.profile) {
    const head = profileHeadlineFromObject(s.profile);
    const stepKey = s.step;
    const stepLabel = stepKey && FLOW_STEP_LABELS[stepKey] ? FLOW_STEP_LABELS[stepKey] : '';
    if (head && stepLabel) return `${head} · Kaldığın adım: ${stepLabel}`;
    if (head) return head;
    if (stepLabel) return `Kaldığın adım: ${stepLabel}`;
  }
  // Akış özeti var ama profil nesnesi boş / eksik (eski veya bozuk kayıt)
  if (s && !s.profile && s.step && FLOW_STEP_LABELS[s.step]) {
    return `Kayıtlı adım: ${FLOW_STEP_LABELS[s.step]} — “Kaldığın yerden devam et” ile ilerle`;
  }
  const d = loadProfileDraft();
  if (d) {
    const head = profileHeadlineFromObject(d);
    const draftNote =
      ' (henüz “Devam et” ile gönderilmedi — taslak)';
    if (head) return `${head}${draftNote}`;
  }
  if (hasProfileDraft()) return 'Taslak profil — “Kaldığın yerden devam et” ile profili tamamla';
  return 'Kayıtlı oturum';
}
