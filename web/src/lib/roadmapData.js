let cache = null;

export async function loadRoadmapsData() {
  if (cache) return cache;
  const res = await fetch('/data/roadmaps.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Öğrenme yolları yüklenemedi');
  const data = await res.json();
  if (!Array.isArray(data?.tracks)) throw new Error('Geçersiz roadmaps verisi');
  cache = data;
  return cache;
}

export function getTrackById(data, trackId) {
  return data?.tracks?.find((t) => t.id === trackId) ?? null;
}
