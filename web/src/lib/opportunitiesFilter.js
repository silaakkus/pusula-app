import { normalizeLlmApplicationPrograms } from './internshipsNormalize.js';

/**
 * Şehir seçimine göre fırsat uyumu (all / uzaktan = herkese açık).
 */
export function opportunityMatchesCity(opp, userCityId) {
  if (!userCityId || userCityId === 'all' || userCityId === 'other') return true;
  const cities = opp.cities;
  if (!cities || !cities.length) return true;
  const lower = cities.map((x) => String(x).toLowerCase());
  if (lower.includes('all') || lower.includes('türkiye') || lower.includes('turkiye')) return true;
  if (lower.includes('remote') || lower.includes('online') || lower.includes('uzaktan')) return true;
  return lower.includes(String(userCityId).toLowerCase());
}

function tagOverlapScore(oppTags, roleTags) {
  const set = new Set(roleTags.map((t) => t.toLowerCase()));
  let n = 0;
  for (const t of oppTags) {
    if (set.has(String(t).toLowerCase())) n += 1;
  }
  return n;
}

const TAG_PRIORITY_OPPORTUNITY_IDS = {
  data: [
    'upschool-data-analysis',
    'upschool-data-science',
    'upschool-machine-learning',
    'upschool-ai-literacy',
    'upschool-future-talent',
    'patika-ai-track',
    'patika-bootcamp',
    'youthall-staj-program',
    'patika-dev',
  ],
  analytics: [
    'upschool-data-analysis',
    'upschool-future-talent',
    'upschool-machine-learning',
    'patika-ai-track',
    'academy-patika-upskill',
    'patika-bootcamp',
    'youthall-staj-program',
  ],
  'ai-ethics': ['upschool-ai-literacy', 'wtm-turkey', 'gdsc'],
  pm: [
    'upschool-birgibi',
    'upschool-mentorluk',
    'sisterslab-hepsiburada-yarinlara-soz',
    'yga-young-leaders',
    'teknolojide-kadin-dernegi',
  ],
  ux: ['upschool-frontend-development', 'sisterslab', 'sisterslab-quest', 'upschool-birgibi', 'wtm-turkey'],
  hrtech: ['upschool-birgibi', 'teknolojide-kadin-dernegi', 'sisterslab-quest'],
  fintech: [
    'academy-patika-upskill',
    'upschool-future-talent',
    'upschool-java-development',
    'upschool-data-analysis',
    'patika-bootcamp',
    'youthall-staj-program',
    'kariyer-net-staj',
  ],
  biotech: ['patika-dev', 'youthall-staj-program', 'kariyer-net-staj', 'sisterslab'],
  sustainability: ['yga-ignite', 'yga-young-leaders', 'yga-twin', 'teknolojide-kadin-dernegi'],
  gamedev: ['tr-btk-hackathon', 'gdsc-solution-challenge', 'gdsc', 'open-source-tr'],
  edtech: [
    'sisterslab',
    'sisterslab-tech4youth',
    'sisterslab-topluluk',
    'sisterslab-dijital-kizlar',
    'sisterslab-stem-kizlara-iyi-gelecek',
    'yga-young-leaders',
    'teknolojide-kadin-dernegi',
  ],
  'marketing-analytics': [
    'upschool-digital-marketing',
    'upschool-e-ticarette-guclu-kadinlar',
    'academy-patika-upskill',
    'sisterslab-hepsiburada-yarinlara-soz',
    'youthall-staj-program',
    'linkedin-jobs-early-career',
    'upschool-birgibi',
    'yga-young-leaders',
  ],
  research: [
    'gdsc-solution-challenge',
    'gdsc',
    'sisterslab-tech4youth',
    'wtm-ambassador',
    'wtm-turkey',
    'linkedin-jobs-early-career',
    'open-source-tr',
  ],
};

function preferredOpportunityIdsForRole(roleTags) {
  const ids = [];
  for (const tag of roleTags) {
    const list = TAG_PRIORITY_OPPORTUNITY_IDS[String(tag).toLowerCase()] ?? [];
    for (const id of list) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

/**
 * Rol için en az `minCount` fırsat; önce etiket eşleşmesine göre sıralanır, eksikse genel programlarla tamamlanır.
 */
export function opportunitiesForRole(role, allOpportunities, minCount = 3, userCityId = 'all') {
  const roleTags = role.tags ?? [];
  const cityPool = allOpportunities.filter((o) => opportunityMatchesCity(o, userCityId));
  const pool = cityPool.length >= minCount ? cityPool : allOpportunities;
  const preferredIds = preferredOpportunityIdsForRole(roleTags);

  const scored = pool
    .map((o) => {
      const overlap = tagOverlapScore(o.targetTags, roleTags);
      const boost = preferredIds.includes(o.opportunityId) ? 2 : 0;
      return { o, score: overlap + boost, overlap };
    })
    .sort((a, b) => b.score - a.score);

  const picked = [];
  const seen = new Set();

  for (const { o, score } of scored) {
    if (picked.length >= minCount) break;
    if (seen.has(o.opportunityId)) continue;
    if (score > 0 || picked.length === 0) {
      picked.push(o);
      seen.add(o.opportunityId);
    }
  }

  for (const pid of preferredIds) {
    if (picked.length >= minCount + 1) break;
    const row = pool.find((o) => o.opportunityId === pid);
    if (!row || seen.has(row.opportunityId)) continue;
    picked.push(row);
    seen.add(row.opportunityId);
  }

  for (const { o, overlap } of scored) {
    if (picked.length >= minCount) break;
    if (!seen.has(o.opportunityId) && (overlap > 0 || picked.length < 2)) {
      picked.push(o);
      seen.add(o.opportunityId);
    }
  }

  return picked.slice(0, Math.max(minCount, 5));
}

/**
 * LLM’den gelen başvuru programlarını opportunities.json satırı şekline çevirir (UI + webhook).
 */
export function llmApplicationProgramsToOpportunityRows(role, roleIndex = 0) {
  const programs = normalizeLlmApplicationPrograms(role?.llmApplicationPrograms ?? [], 5);
  return programs.map((p, i) => {
    const forWho =
      p.summary && p.summary !== p.forWho ? `${p.forWho} · ${p.summary}` : p.forWho;
    return {
      opportunityId: `llm-app-r${roleIndex}-${i}`,
      name: p.name,
      url: p.url,
      type: 'program',
      forWho,
      fromLlm: true,
    };
  });
}

/**
 * Yerel JSON fırsatları + Groq applicationPrograms.
 * URL’si yerel satırla çakışsa da Groq satırları eklenir (etiketle ayırt edilir).
 */
export function opportunitiesForRoleWithLlm(role, allOpportunities, minCount = 3, userCityId = 'all', roleIndex = 0) {
  const local = opportunitiesForRole(role, allOpportunities, minCount, userCityId);
  const llmRows = llmApplicationProgramsToOpportunityRows(role, roleIndex);
  return [...local, ...llmRows];
}

export function hasProgramOrCommunity(opportunities) {
  return opportunities.some((o) => o.type === 'program' || o.type === 'community');
}

function roleDisplayTitle(role) {
  if (typeof role?.roleName === 'string' && role.roleName.trim()) return role.roleName.trim();
  if (typeof role?.title === 'string' && role.title.trim()) return role.title.trim();
  return '';
}

/**
 * Ekranda rol başına gösterilen fırsatlarla aynı mantık; webhook / e-posta payload’ı için düz nesneler.
 * Her satır: name, url, description (forWho), forRole (rol başlığı).
 */
export function buildWebhookOpportunities(roles, allOpportunities, minCount = 3, userCityId = 'all') {
  const out = [];
  (roles ?? []).forEach((role, roleIndex) => {
    const forRole = roleDisplayTitle(role);
    const opps = opportunitiesForRoleWithLlm(role, allOpportunities, minCount, userCityId, roleIndex);
    for (const o of opps) {
      out.push({
        name: o.name,
        url: o.url,
        description: typeof o.forWho === 'string' ? o.forWho : '',
        forRole,
        source: o.fromLlm ? 'llm' : 'dataset',
      });
    }
  });
  return out;
}
