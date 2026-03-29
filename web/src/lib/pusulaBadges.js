const KEY = 'pusula_badges';

export const BADGE_IDS = {
  PROFILE: 'rozet_profil',
  ROLES: 'rozet_roller',
  BARRIER: 'rozet_engel',
  CARD: 'rozet_kart',
};

export const BADGE_META = [
  { id: BADGE_IDS.PROFILE, label: 'Profil', desc: 'Profilini tamamladın' },
  { id: BADGE_IDS.ROLES, label: 'Rota', desc: 'Rol önerilerini gördün' },
  { id: BADGE_IDS.BARRIER, label: 'Engel', desc: 'Engel kırıcıyı kullandın' },
  { id: BADGE_IDS.CARD, label: 'Kart', desc: 'Kariyer kartını indirdin' },
];

export function unlockPusulaBadge(id) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const set = new Set(Array.isArray(arr) ? arr : []);
    if (set.has(id)) return;
    set.add(id);
    localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent('pusula-badges-updated'));
  } catch {
    /* ignore */
  }
}

export function getPusulaBadges() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
