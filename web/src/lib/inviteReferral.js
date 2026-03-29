/** Davet linki (?inviter=) ve “davet tamamlandı” bildirim bayrağı (sessionStorage). */

const INVITER_KEY = 'pusula_inviter_email';
const NOTIFY_KEY = 'pusula_davet_tamam_notify_sent';

export function isValidInviterEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

/** İlk yüklemede URL’deki inviter=... değerini okur, geçerliyse saklar ve adres çubuğundan siler. */
export function captureInviterFromUrl() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('inviter')?.trim() ?? '';
    if (!raw || !isValidInviterEmail(raw)) return;
    sessionStorage.setItem(INVITER_KEY, raw.trim());
    params.delete('inviter');
    const path = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', path);
  } catch {
    /* ignore */
  }
}

export function getStoredInviterEmail() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(INVITER_KEY) ?? '';
}

export function clearInviteReferralState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(INVITER_KEY);
  sessionStorage.removeItem(NOTIFY_KEY);
}

/** Yeni akış (Başla) ile aynı davetiye için tekrar bildirim gönderilebilsin. */
export function clearCompletionNotifyFlag() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(NOTIFY_KEY);
}

export function hasCompletionNotifySent() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(NOTIFY_KEY) === '1';
}

export function markCompletionNotifySent() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(NOTIFY_KEY, '1');
}
