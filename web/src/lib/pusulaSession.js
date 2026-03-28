export const PUSULA_SESSION_KEY = 'pusula_session';

/**
 * @param {{ answers: object, roles: object[] }} payload
 */
export function savePusulaSession({ answers, roles }) {
  const value = {
    answers,
    roles,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(PUSULA_SESSION_KEY, JSON.stringify(value));
  } catch {
    // kota / gizli mod vb.
  }
}

export function loadPusulaSession() {
  try {
    const raw = localStorage.getItem(PUSULA_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}
