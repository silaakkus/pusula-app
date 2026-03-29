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

function roleTitlesForInviterNotify(roles) {
  return (roles ?? [])
    .map((r) => {
      if (typeof r?.roleName === 'string' && r.roleName.trim()) return r.roleName.trim();
      if (typeof r?.title === 'string' && r.title.trim()) return r.title.trim();
      return '';
    })
    .filter(Boolean);
}

let inviterCompletionInFlight = null;

/**
 * Davet eden kişiye n8n üzerinden “arkadaş sonuçları gördü” bildirimi (bir oturumda en fazla bir kez).
 * Arkadaşın sonuçları kendi e-postasına göndermesi gerekmez.
 */
export async function postInviterCompletionOnce({ profile, roles }) {
  if (typeof window === 'undefined') return { ok: false, reason: 'no_window' };
  const inviter = getStoredInviterEmail();
  if (!inviter || !isValidInviterEmail(inviter)) return { ok: false, reason: 'no_inviter' };
  if (hasCompletionNotifySent()) return { ok: true, reason: 'already_sent' };

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (!webhookUrl || !String(webhookUrl).trim()) return { ok: false, reason: 'no_webhook' };
  if (!Array.isArray(roles) || roles.length === 0) return { ok: false, reason: 'no_roles' };

  const roleTitles = roleTitlesForInviterNotify(roles);

  if (inviterCompletionInFlight) return inviterCompletionInFlight;

  inviterCompletionInFlight = (async () => {
    try {
      const payload = {
        event: 'davet_tamamlandi',
        inviterEmail: inviter.trim(),
        inviteeDiscipline: profile?.disciplineLabel ?? '',
        inviteeCity: profile?.cityLabel ?? profile?.cityId ?? '',
        roles: roleTitles,
        timestamp: new Date().toISOString(),
      };
      const res = await fetch(String(webhookUrl).trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) markCompletionNotifySent();
      return { ok: res.ok };
    } catch {
      return { ok: false, reason: 'network' };
    } finally {
      inviterCompletionInFlight = null;
    }
  })();

  return inviterCompletionInFlight;
}
