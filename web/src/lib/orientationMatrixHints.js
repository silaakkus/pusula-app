import { loadDisciplineMatrix } from './dataLoader.js';

/**
 * Yönelim arketipi → Pusula disiplin matrisindeki roleId öncelik sırası.
 * Her roleId için matriste ilk bulunan disiplin satırı kullanılır (öğrenci henüz profil seçmemiş olsa da).
 */
const ARCHETYPE_PRIORITY_ROLE_IDS = {
  frontend: ['ui-design', 'creative-tech', 'edtech', 'game-community'],
  backend: ['ops-automation', 'business-analyst', 'risk-analytics', 'data-analyst'],
  'veri-bilimi': ['data-analyst', 'data-storytelling', 'risk-analytics', 'business-analyst', 'people-analytics'],
  'yapay-zeka': ['ml-associate', 'ai-ethics', 'bioinformatics'],
  devops: ['ops-automation', 'sustainability-tech', 'growth-marketing'],
  'urun-ux': ['ux-researcher', 'product-manager', 'content-strategist', 'ui-design', 'health-product'],
};

const MAX_ROLES = 3;

/**
 * @param {string} archetype
 * @returns {Promise<{ disciplineName: string, roleName: string, roleId: string, firstSteps: string[], whyFits: string[] }[]>}
 */
export async function fetchOrientationMatrixHints(archetype) {
  const key = typeof archetype === 'string' ? archetype.trim() : '';
  const priority =
    ARCHETYPE_PRIORITY_ROLE_IDS[key] ?? ARCHETYPE_PRIORITY_ROLE_IDS.frontend;

  const matrix = await loadDisciplineMatrix();
  const out = [];
  const seen = new Set();

  for (const rid of priority) {
    if (out.length >= MAX_ROLES) break;
    if (seen.has(rid)) continue;

    for (const row of matrix) {
      const rm = row.roleMatches?.find((x) => x.roleId === rid);
      if (rm) {
        seen.add(rid);
        out.push({
          disciplineName: row.disciplineName,
          roleName: rm.roleName,
          roleId: rm.roleId,
          firstSteps: Array.isArray(rm.firstSteps) ? rm.firstSteps.slice(0, 2) : [],
          whyFits: Array.isArray(rm.whyFits) ? rm.whyFits.slice(0, 1) : [],
        });
        break;
      }
    }
  }

  return out;
}
