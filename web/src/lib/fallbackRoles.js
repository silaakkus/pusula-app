const DEFAULT_EMPLOYERS = {
  data: ['Trendyol', 'Hepsiburada', 'Getir', 'İş Bankası', 'Allianz Türkiye'],
  ux: ['Huawei Türkiye', 'Vakıf Katılım', 'Yemeksepeti', 'Defacto', 'ING Türkiye'],
  pm: ['Garanti BBVA', 'Amazon Türkiye', 'PayTR', 'Insider', 'Dream Games'],
  biotech: ['Acıbadem Labmed', 'GE Healthcare Türkiye', 'Siemens Healthineers', 'Roche', 'Pfizer'],
  default: ['Turkcell', 'KoçSistem', 'Logo Yazılım', 'Halkbank', 'Emlak Katılım'],
};

function employersForTags(tags) {
  const t = (tags ?? []).map((x) => String(x).toLowerCase());
  if (t.some((x) => x.includes('data') || x.includes('analytics'))) return DEFAULT_EMPLOYERS.data;
  if (t.some((x) => x.includes('ux'))) return DEFAULT_EMPLOYERS.ux;
  if (t.some((x) => x === 'pm')) return DEFAULT_EMPLOYERS.pm;
  if (t.some((x) => x.includes('bio'))) return DEFAULT_EMPLOYERS.biotech;
  return DEFAULT_EMPLOYERS.default;
}

/**
 * API başarısız olduğunda disiplin matrisinden tam 3 rol üretir (PRD şemasına uyumlu).
 */
export function rolesFromMatrix(disciplineRow) {
  if (!disciplineRow?.roleMatches?.length) return [];
  return disciplineRow.roleMatches.slice(0, 3).map((rm) => ({
    roleId: rm.roleId,
    roleName: rm.roleName,
    whyFits: [...rm.whyFits],
    firstSteps: [...rm.firstSteps].slice(0, 3),
    starterResources: [
      'Patika.dev — ilgili öğrenme yolu',
      'Kodluyoruz veya SistersLab topluluk sayfaları',
      'UP School program duyuruları',
    ],
    tags: [...rm.tags],
    employersTurkey: employersForTags(rm.tags).slice(0, 5),
    ...(rm.dayInLife?.morning && rm.dayInLife?.afternoon && rm.dayInLife?.evening
      ? {
          dayInLife: {
            morning: String(rm.dayInLife.morning).trim(),
            afternoon: String(rm.dayInLife.afternoon).trim(),
            evening: String(rm.dayInLife.evening).trim(),
          },
        }
      : {}),
  }));
}
