function makeDept(id, name, disciplineId, focusInterests, joyActivities) {
  return { id, name, disciplineId, focusInterests, joyActivities };
}

const PROFILE = {
  quant: {
    disciplineId: 'quant-analytics',
    focus: ['Veri analizi', 'Modelleme', 'Algoritmik düşünme', 'Sayısal problem çözme', 'Karar destek sistemleri'],
    joy: ['Veriyle örüntü bulmak', 'Model performansı kıyaslamak', 'Karmaşık problemi parçalamak', 'Rapor hazırlamak'],
  },
  social: {
    disciplineId: 'human-social',
    focus: ['Kullanıcı araştırması', 'Davranış analizi', 'Toplumsal etki', 'İletişim ve içerik tasarımı', 'Etik değerlendirme'],
    joy: ['İnsanla görüşme yapmak', 'Nitel veri yorumlamak', 'Empati haritası çıkarmak', 'Anlatı oluşturmak'],
  },
  life: {
    disciplineId: 'life-sciences',
    focus: ['Sağlık verisi', 'Laboratuvar çıktıları', 'Biyoenformatik', 'Bilimsel araştırma', 'Klinik süreçler'],
    joy: ['Deney sonucu yorumlamak', 'Bilimsel makale incelemek', 'Veriyle hipotez test etmek', 'Araştırma planlamak'],
  },
  business: {
    disciplineId: 'business-econ',
    focus: ['Ürün ve süreç yönetimi', 'Pazar analitiği', 'Finansal analiz', 'Operasyon optimizasyonu', 'Dijital strateji'],
    joy: ['İş problemi tanımlamak', 'Önceliklendirme yapmak', 'Süreç akışı çıkarmak', 'Veriyle karar savunmak'],
  },
  educationArts: {
    disciplineId: 'education-arts',
    focus: ['Eğitim teknolojileri', 'İçerik üretimi', 'Tasarım ve yaratıcılık', 'Oyunlaştırma', 'Topluluk etkileşimi'],
    joy: ['Karmaşık konuyu sade anlatmak', 'Görsel/dijital içerik hazırlamak', 'Yaratıcı fikir geliştirmek', 'Öğrenme deneyimi tasarlamak'],
  },
  mixed: {
    disciplineId: 'business-econ',
    focus: ['Dijital dönüşüm', 'Süreç ve kalite', 'Kurumsal operasyon', 'Kullanıcı odaklı hizmet tasarımı'],
    joy: ['Plan yapıp takip etmek', 'Ekiplerle koordinasyon kurmak', 'Sistematik ilerlemek', 'Süreci iyileştirmek'],
  },
};

function withProfile(id, name, key) {
  const p = PROFILE[key];
  return makeDept(id, name, p.disciplineId, p.focus, p.joy);
}

export const HACETTEPE_FACULTIES = [
  {
    id: 'bilgisayar-ve-bilisim-bilimleri',
    name: 'Bilgisayar ve Bilişim Bilimleri Fakültesi',
    departments: [
      withProfile('bilgisayar-bilimleri', 'Bilgisayar Bilimleri', 'quant'),
      withProfile('yapay-zeka-ve-veri', 'Yapay Zeka ve Veri Mühendisliği', 'quant'),
      withProfile('bilisim-sistemleri-teknolojileri', 'Bilişim Sistemleri Teknolojileri', 'business'),
    ],
  },
  {
    id: 'dis-hekimligi',
    name: 'Diş Hekimliği Fakültesi',
    departments: [withProfile('dis-hekimligi', 'Diş Hekimliği', 'life')],
  },
  {
    id: 'eczacilik',
    name: 'Eczacılık Fakültesi',
    departments: [withProfile('eczacilik', 'Eczacılık', 'life')],
  },
  {
    id: 'edebiyat',
    name: 'Edebiyat Fakültesi',
    departments: [
      withProfile('antropoloji', 'Antropoloji', 'social'),
      withProfile('arkeoloji', 'Arkeoloji', 'social'),
      withProfile('cagdas-turk-lehceleri', 'Çağdaş Türk Lehçeleri ve Edebiyatları', 'social'),
      withProfile('felsefe', 'Felsefe', 'social'),
      withProfile('ingiliz-dili-ve-edebiyati', 'İngiliz Dili ve Edebiyatı', 'social'),
      withProfile('psikoloji', 'Psikoloji', 'social'),
      withProfile('sanat-tarihi', 'Sanat Tarihi', 'educationArts'),
      withProfile('sosyoloji', 'Sosyoloji', 'social'),
      withProfile('tarih', 'Tarih', 'social'),
      withProfile('turk-dili-ve-edebiyati', 'Türk Dili ve Edebiyatı', 'social'),
    ],
  },
  {
    id: 'egitim',
    name: 'Eğitim Fakültesi',
    departments: [
      withProfile('bilgisayar-ve-ogretim-teknolojileri', 'Bilgisayar ve Öğretim Teknolojileri Eğitimi', 'educationArts'),
      withProfile('egitim-bilimleri', 'Eğitim Bilimleri', 'educationArts'),
      withProfile('ilkogretim-matematik', 'İlköğretim Matematik Öğretmenliği', 'quant'),
      withProfile('ingilizce-ogretmenligi', 'İngilizce Öğretmenliği', 'educationArts'),
      withProfile('okul-oncesi-ogretmenligi', 'Okul Öncesi Öğretmenliği', 'educationArts'),
      withProfile('rehberlik-ve-psikolojik-danismanlik', 'Rehberlik ve Psikolojik Danışmanlık', 'social'),
      withProfile('sinif-ogretmenligi', 'Sınıf Öğretmenliği', 'educationArts'),
      withProfile('turkce-ogretmenligi', 'Türkçe Öğretmenliği', 'educationArts'),
    ],
  },
  {
    id: 'fen',
    name: 'Fen Fakültesi',
    departments: [
      withProfile('aktuerya-bilimleri', 'Aktüerya Bilimleri', 'quant'),
      withProfile('biyoloji', 'Biyoloji', 'life'),
      withProfile('fizik', 'Fizik', 'quant'),
      withProfile('istatistik', 'İstatistik', 'quant'),
      withProfile('kimya', 'Kimya', 'life'),
      withProfile('matematik', 'Matematik', 'quant'),
    ],
  },
  {
    id: 'fizik-tedavi-ve-rehabilitasyon',
    name: 'Fizik Tedavi ve Rehabilitasyon Fakültesi',
    departments: [withProfile('fizyoterapi-ve-rehabilitasyon', 'Fizyoterapi ve Rehabilitasyon', 'life')],
  },
  {
    id: 'guzel-sanatlar',
    name: 'Güzel Sanatlar Fakültesi',
    departments: [
      withProfile('grafik', 'Grafik', 'educationArts'),
      withProfile('heykel', 'Heykel', 'educationArts'),
      withProfile('ic-mimarlik-ve-cevre-tasarimi', 'İç Mimarlık ve Çevre Tasarımı', 'educationArts'),
      withProfile('resim', 'Resim', 'educationArts'),
      withProfile('seramik', 'Seramik', 'educationArts'),
    ],
  },
  {
    id: 'hemsirelik',
    name: 'Hemşirelik Fakültesi',
    departments: [withProfile('hemsirelik', 'Hemşirelik', 'life')],
  },
  {
    id: 'hukuk',
    name: 'Hukuk Fakültesi',
    departments: [withProfile('hukuk', 'Hukuk', 'social')],
  },
  {
    id: 'iktisadi-ve-idari-bilimler',
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    departments: [
      withProfile('aile-ve-tuketici-bilimleri', 'Aile ve Tüketici Bilimleri', 'business'),
      withProfile('iktisat', 'İktisat', 'business'),
      withProfile('isletme', 'İşletme', 'business'),
      withProfile('maliye', 'Maliye', 'business'),
      withProfile('saglik-yonetimi', 'Sağlık Yönetimi', 'business'),
      withProfile('siyaset-bilimi-ve-kamu-yonetimi', 'Siyaset Bilimi ve Kamu Yönetimi', 'social'),
      withProfile('uluslararasi-iliskiler', 'Uluslararası İlişkiler', 'social'),
    ],
  },
  {
    id: 'iletisim',
    name: 'İletişim Fakültesi',
    departments: [
      withProfile('halkla-iliskiler-ve-tanitim', 'Halkla İlişkiler ve Tanıtım', 'social'),
      withProfile('iletisim-bilimleri', 'İletişim Bilimleri', 'social'),
      withProfile('radyo-tv-ve-sinema', 'Radyo, Televizyon ve Sinema', 'educationArts'),
    ],
  },
  {
    id: 'mimarlik',
    name: 'Mimarlık Fakültesi',
    departments: [
      withProfile('ic-mimarlik-ve-cevre-tasarimi', 'İç Mimarlık ve Çevre Tasarımı', 'educationArts'),
      withProfile('mimarlik', 'Mimarlık', 'educationArts'),
      withProfile('sehir-ve-bolge-planlama', 'Şehir ve Bölge Planlama', 'business'),
    ],
  },
  {
    id: 'muhendislik',
    name: 'Mühendislik Fakültesi',
    departments: [
      withProfile('bilgisayar-muhendisligi', 'Bilgisayar Mühendisliği', 'quant'),
      withProfile('cevre-muhendisligi', 'Çevre Mühendisliği', 'life'),
      withProfile('elektrik-elektronik-muhendisligi', 'Elektrik-Elektronik Mühendisliği', 'quant'),
      withProfile('endustri-muhendisligi', 'Endüstri Mühendisliği', 'business'),
      withProfile('fizik-muhendisligi', 'Fizik Mühendisliği', 'quant'),
      withProfile('gida-muhendisligi', 'Gıda Mühendisliği', 'life'),
      withProfile('insaat-muhendisligi', 'İnşaat Mühendisliği', 'quant'),
      withProfile('jeoloji-muhendisligi', 'Jeoloji Mühendisliği', 'life'),
      withProfile('kimya-muhendisligi', 'Kimya Mühendisliği', 'life'),
      withProfile('maden-muhendisligi', 'Maden Mühendisliği', 'quant'),
      withProfile('makine-muhendisligi', 'Makine Mühendisliği', 'quant'),
    ],
  },
  {
    id: 'saglik-bilimleri',
    name: 'Sağlık Bilimleri Fakültesi',
    departments: [
      withProfile('beslenme-ve-diyetetik', 'Beslenme ve Diyetetik', 'life'),
      withProfile('cocuk-gelisimi', 'Çocuk Gelişimi', 'social'),
      withProfile('dil-ve-konusma-terapisi', 'Dil ve Konuşma Terapisi', 'life'),
      withProfile('ergoterapi', 'Ergoterapi', 'life'),
      withProfile('odyoloji', 'Odyoloji', 'life'),
      withProfile('saglik-yonetimi', 'Sağlık Yönetimi', 'business'),
      withProfile('sosyal-hizmet', 'Sosyal Hizmet', 'social'),
    ],
  },
  {
    id: 'spor-bilimleri',
    name: 'Spor Bilimleri Fakültesi',
    departments: [
      withProfile('antrenorluk-egitimi', 'Antrenörlük Eğitimi', 'educationArts'),
      withProfile('rekreasyon', 'Rekreasyon', 'educationArts'),
      withProfile('spor-yoneticiligi', 'Spor Yöneticiliği', 'business'),
    ],
  },
  {
    id: 'tip',
    name: 'Tıp Fakültesi',
    departments: [withProfile('tip', 'Tıp', 'life')],
  },
];

export function getFacultyById(facultyId) {
  return HACETTEPE_FACULTIES.find((f) => f.id === facultyId) ?? null;
}

export function getDepartmentById(facultyId, departmentId) {
  const faculty = getFacultyById(facultyId);
  if (!faculty) return null;
  return faculty.departments.find((d) => d.id === departmentId) ?? null;
}
