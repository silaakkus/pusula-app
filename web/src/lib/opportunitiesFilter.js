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

/**
 * Rol için en az `minCount` fırsat; önce etiket eşleşmesine göre sıralanır, eksikse genel programlarla tamamlanır.
 */
export function opportunitiesForRole(role, allOpportunities, minCount = 3, userCityId = 'all') {
  const roleTags = role.tags ?? [];
  const cityPool = allOpportunities.filter((o) => opportunityMatchesCity(o, userCityId));
  const pool = cityPool.length >= minCount ? cityPool : allOpportunities;

  const scored = pool
    .map((o) => ({ o, score: tagOverlapScore(o.targetTags, roleTags) }))
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

  for (const { o } of scored) {
    if (picked.length >= minCount) break;
    if (!seen.has(o.opportunityId)) {
      picked.push(o);
      seen.add(o.opportunityId);
    }
  }

  return picked.slice(0, Math.max(minCount, picked.length));
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
  for (const role of roles ?? []) {
    const forRole = roleDisplayTitle(role);
    const opps = opportunitiesForRole(role, allOpportunities, minCount, userCityId);
    for (const o of opps) {
      out.push({
        name: o.name,
        url: o.url,
        description: typeof o.forWho === 'string' ? o.forWho : '',
        forRole,
      });
    }
  }
  return out;
}
