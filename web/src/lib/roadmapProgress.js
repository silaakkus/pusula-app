import { unlockPusulaBadge, BADGE_IDS } from './pusulaBadges.js';

const STORAGE_KEY = 'pusula_roadmap_progress_v1';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** @returns {string[]} tamamlanan adım id'leri */
export function getCompletedStepIds(trackId) {
  const all = readAll();
  const list = all[trackId];
  return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
}

export function isStepDone(trackId, stepId) {
  return getCompletedStepIds(trackId).includes(stepId);
}

export function toggleStepDone(trackId, stepId) {
  const all = readAll();
  const cur = new Set(getCompletedStepIds(trackId));
  if (cur.has(stepId)) cur.delete(stepId);
  else cur.add(stepId);
  all[trackId] = [...cur];
  writeAll(all);
  const anyDone = Object.values(all).some((arr) => Array.isArray(arr) && arr.length > 0);
  if (anyDone) unlockPusulaBadge(BADGE_IDS.ROADMAP);
  try {
    window.dispatchEvent(new CustomEvent('pusula-roadmap-progress'));
  } catch {
    /* ignore */
  }
  return all[trackId];
}

export function progressFraction(trackId, totalSteps) {
  if (!totalSteps) return 0;
  return Math.min(1, getCompletedStepIds(trackId).length / totalSteps);
}

/** Daha önce işaretlenmiş adımlar varsa rozeti aç (tek seferlik senkron) */
export function ensureRoadmapBadgeIfProgressExists() {
  try {
    const all = readAll();
    const anyDone = Object.values(all).some((arr) => Array.isArray(arr) && arr.length > 0);
    if (anyDone) unlockPusulaBadge(BADGE_IDS.ROADMAP);
  } catch {
    /* ignore */
  }
}
