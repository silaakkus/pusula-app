import { normalizeEmployersList, validateEmployersTurkey } from './employersNormalize.js';
import { normalizeInternshipPrograms, validateInternshipPrograms } from './internshipsNormalize.js';

/** Etiket havuzu yedekleri (matriste employersTurkey yoksa); her biri { name, url } */
const FALLBACK_EMPLOYERS = {
  data: [
    { name: 'Trendyol', url: 'https://careers.trendyol.com/' },
    { name: 'Hepsiburada', url: 'https://kurumsal.hepsiburada.com/tr/hakkimizda/kariyer' },
    { name: 'Getir', url: 'https://careers.getir.com/' },
    { name: 'İş Bankası', url: 'https://www.isbank.com.tr/kariyer' },
    { name: 'Turkcell', url: 'https://kariyerim.turkcell.com.tr/' },
    { name: 'Insider', url: 'https://useinsider.com/careers/' },
    { name: 'Garanti BBVA Teknoloji', url: 'https://www.garantibbvatech.com.tr/kariyer' },
    { name: 'Amazon Türkiye (ilanlar)', url: 'https://www.amazon.jobs/en/search?loc_query=Turkey' },
  ],
  ux: [
    { name: 'Yemeksepeti (Delivery Hero)', url: 'https://careers.deliveryhero.com/' },
    { name: 'Getir', url: 'https://careers.getir.com/' },
    { name: 'Trendyol', url: 'https://careers.trendyol.com/' },
    { name: 'Defacto', url: 'https://kurumsal.defacto.com.tr/kariyer' },
    { name: 'ING Türkiye', url: 'https://www.ing.com.tr/tr/kariyer' },
    { name: 'Huawei Türkiye', url: 'https://career.huawei.com/' },
    { name: 'Booking.com', url: 'https://careers.booking.com/' },
    { name: 'Microsoft Türkiye', url: 'https://careers.microsoft.com/professional/tr-tr' },
  ],
  pm: [
    { name: 'Garanti BBVA Teknoloji', url: 'https://www.garantibbvatech.com.tr/kariyer' },
    { name: 'PayTR', url: 'https://www.paytr.com/' },
    { name: 'Dream Games', url: 'https://www.dreamgames.com/careers' },
    { name: 'Insider', url: 'https://useinsider.com/careers/' },
    { name: 'Trendyol', url: 'https://careers.trendyol.com/' },
    { name: 'Getir', url: 'https://careers.getir.com/' },
    { name: 'Amazon Türkiye (ilanlar)', url: 'https://www.amazon.jobs/en/search?loc_query=Turkey' },
    { name: 'N11', url: 'https://www.n11.com/kurumsal/kariyer' },
  ],
  biotech: [
    { name: 'Pfizer Türkiye', url: 'https://www.pfizer.com.tr/kariyer' },
    { name: 'Novartis Türkiye', url: 'https://www.novartis.com/tr-tr/kariyer' },
    { name: 'Roche Türkiye', url: 'https://www.roche.com.tr/kariyer' },
    { name: 'GE Healthcare', url: 'https://jobs.gecareers.com/global/en' },
    { name: 'Siemens Healthineers', url: 'https://jobs.siemens-healthineers.com/' },
    { name: 'Acıbadem Sağlık Grubu', url: 'https://www.acibadem.com.tr/acibadem-kariyer' },
    { name: 'Medipol', url: 'https://www.medipol.com.tr/kariyer' },
    { name: 'TÜBİTAK', url: 'https://tubitak.gov.tr/tr/insan-kaynaklari' },
  ],
  default: [
    { name: 'Turkcell', url: 'https://kariyerim.turkcell.com.tr/' },
    { name: 'KoçSistem', url: 'https://www.kocsistem.com.tr/kariyer' },
    { name: 'Logo Yazılım', url: 'https://www.logo.com.tr/LogoKariyer' },
    { name: 'Halkbank', url: 'https://www.halkbank.com.tr/kariyer' },
    { name: 'Emlak Katılım', url: 'https://www.emlakkatilim.com.tr/kariyer' },
    { name: 'Vakıf Katılım', url: 'https://www.vakifkatilim.com.tr/kariyer' },
    { name: 'İş Bankası', url: 'https://www.isbank.com.tr/kariyer' },
    { name: 'Türk Telekom', url: 'https://www.turktelekom.com.tr/kariyer' },
  ],
};

function employersForTags(tags) {
  const t = (tags ?? []).map((x) => String(x).toLowerCase());
  if (t.some((x) => x.includes('data') || x.includes('analytics'))) return FALLBACK_EMPLOYERS.data;
  if (t.some((x) => x.includes('ux'))) return FALLBACK_EMPLOYERS.ux;
  if (t.some((x) => x === 'pm')) return FALLBACK_EMPLOYERS.pm;
  if (t.some((x) => x.includes('bio'))) return FALLBACK_EMPLOYERS.biotech;
  return FALLBACK_EMPLOYERS.default;
}

/** Matriste internshipPrograms bozuksa yedek (rol bazlı veri tercih edilir) */
const FALLBACK_INTERNSHIPS = [
  {
    name: 'Trendyol Talent Program',
    url: 'https://careers.trendyol.com/talent-program',
    summary:
      'E-ticaret ve teknoloji ekiplerinde dönemsel staj/rotasyon; başvuru tarihleri her yıl sitede güncellenir.',
    eligibility: 'Genelde lisans 3–4. sınıf veya yeni mezun; güncel şartlar için resmi ilanı oku.',
  },
  {
    name: 'Microsoft — öğrenci programları',
    url: 'https://careers.microsoft.com/students/tr-tr',
    summary: 'Staj ve yeni mezun rolleri için Microsoft başvuru girişi.',
    eligibility: 'Kayıtlı öğrenci veya yakın mezuniyet; teknik mülakat ve İngilizce sık istenir.',
  },
  {
    name: 'Amazon Student Programs',
    url: 'https://www.amazon.jobs/en/business_categories/student-programs',
    summary: 'Öğrenci ve yeni mezun programları; Türkiye lokasyonlu ilanlar filtrelenebilir.',
    eligibility: 'Lisans/yüksek lisans öğrencisi veya yeni mezun; pozisyona göre teknik şartlar değişir.',
  },
  {
    name: 'İş Bankası kariyer',
    url: 'https://www.isbank.com.tr/kariyer',
    summary: 'Bankacılık ve destek birimlerinde yıl içinde açılan staj duyuruları.',
    eligibility: 'Üniversite öğrencisi; sınıf ve bölüm koşulları ilan metninde yazar.',
  },
  {
    name: 'TÜBİTAK — insan kaynakları',
    url: 'https://tubitak.gov.tr/tr/insan-kaynaklari',
    summary: 'Kamu ARGE kurumlarında proje personeli ve bursiyer ilanları.',
    eligibility: 'Program duyurusuna göre lisans/yüksek lisans; çoğu tam zamanlı veya bursiyer kapsamındadır.',
  },
];

/**
 * API başarısız olduğunda disiplin matrisinden tam 3 rol üretir (PRD şemasına uyumlu).
 */
export function rolesFromMatrix(disciplineRow) {
  if (!disciplineRow?.roleMatches?.length) return [];
  return disciplineRow.roleMatches.slice(0, 3).map((rm) => {
    const rawEmployers =
      Array.isArray(rm.employersTurkey) && validateEmployersTurkey(rm.employersTurkey)
        ? rm.employersTurkey
        : employersForTags(rm.tags);
    const rawInternships =
      Array.isArray(rm.internshipPrograms) && validateInternshipPrograms(rm.internshipPrograms)
        ? rm.internshipPrograms
        : FALLBACK_INTERNSHIPS;
    return {
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
      employersTurkey: normalizeEmployersList(rawEmployers, 8),
      internshipPrograms: normalizeInternshipPrograms(rawInternships, 6),
      ...(rm.dayInLife?.morning && rm.dayInLife?.afternoon && rm.dayInLife?.evening
        ? {
            dayInLife: {
              morning: String(rm.dayInLife.morning).trim(),
              afternoon: String(rm.dayInLife.afternoon).trim(),
              evening: String(rm.dayInLife.evening).trim(),
            },
          }
        : {}),
      ...(rm.salaryRange?.junior && rm.salaryRange?.mid && rm.salaryRange?.senior && rm.salaryRange?.source
        ? {
            salaryRange: {
              junior: String(rm.salaryRange.junior).trim(),
              mid: String(rm.salaryRange.mid).trim(),
              senior: String(rm.salaryRange.senior).trim(),
              source: String(rm.salaryRange.source).trim(),
            },
          }
        : {}),
    };
  });
}
