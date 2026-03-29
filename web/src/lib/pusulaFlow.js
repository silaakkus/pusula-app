export const PUSULA_FLOW_KEY = 'pusula_flow';

const ALLOWED_STEPS = new Set([
  'profile',
  'baseline',
  'analyzing',
  'results',
  'barrier',
  'barrierReview',
  'postsurvey',
  'card',
]);

export function saveFlowSnapshot(snapshot) {
  try {
    localStorage.setItem(PUSULA_FLOW_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadFlowSnapshot() {
  try {
    const raw = localStorage.getItem(PUSULA_FLOW_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || !isNonEmptyString(o.step)) return null;
    if (!ALLOWED_STEPS.has(o.step)) return null;
    return o;
  } catch {
    return null;
  }
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function clearFlowSnapshot() {
  try {
    localStorage.removeItem(PUSULA_FLOW_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSavedFlow() {
  return loadFlowSnapshot() != null;
}

export function getSavedFlowSummary() {
  const s = loadFlowSnapshot();
  if (!s?.profile?.disciplineLabel) return 'Kayıtlı oturum';
  return s.profile.disciplineLabel;
}
