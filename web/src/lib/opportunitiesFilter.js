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
export function opportunitiesForRole(role, allOpportunities, minCount = 3) {
  const roleTags = role.tags ?? [];
  const scored = allOpportunities
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
