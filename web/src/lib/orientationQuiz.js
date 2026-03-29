/** Yerel skor; isteğe bağlı sunucu yanıtı ile metin zenginleştirilebilir */

const ARCHETYPES = ['frontend', 'backend', 'veri-bilimi', 'yapay-zeka', 'devops', 'urun-ux'];

const COPY = {
  frontend: {
    headline: 'Görünen tarafla ilgilenmek sana yakın görünüyor',
    subline: 'Yani ekranda gördüğün düğmeler, menüler ve sayfa düzeni.',
    body: 'Önce basit bir sayfa yapısını ve tıklanınca değişen küçük şeyleri öğrenmek iyi bir başlangıç. İleride ekipler bunu “web arayüzü” diye de anlatır.',
    nextSteps: ['Tek sayfalık basit bir örnek yap', 'Renk ve yazı tipiyle oyna', 'İnternetteki ücretsiz başlangıç derslerinden birini bitir'],
  },
  backend: {
    headline: 'Görünmeyen, sunucu tarafı sana yakın görünüyor',
    subline: 'Yani verinin saklandığı ve uygulamanın “beyninin” çalıştığı kısım.',
    body: 'Kayıt tutma, giriş yapma, diğer servislerle konuşma gibi işler burada yapılır. Bir programlama diliyle çok küçük bir örnek üzerinden ilerlemek mantıklı.',
    nextSteps: ['İnternet isteği–cevap fikrini izle bir videoda', 'Mini bir “liste kaydet” örneği ara', 'Basit veritabanı öğreticisine bak'],
  },
  'veri-bilimi': {
    headline: 'Sayılar ve tablolarla uğraşmak sana yakın görünüyor',
    subline: 'Yani Excel’e benzer ama daha büyük veri ve grafiklerle içgörü üretmek.',
    body: 'Mevcut veriyi temizleyip grafik çıkarmak, sonra “acaba burada ne anlatıyor?” demek bu alanın özü. İleri istatistik ilk gün şart değil.',
    nextSteps: ['Herkese açık küçük bir veri seti indir', 'Bir grafik çiz ve tek cümleyle özetle', 'YouTube’da “veri analizi giriş” aratıp bir video izle'],
  },
  'yapay-zeka': {
    headline: 'Akıllı sistemler ve yeni teknikler seni çekiyor gibi',
    subline: 'Sohbet botlarından basit tahmin modellerine kadar geniş bir dünya.',
    body: 'Önce “bilgisayar örneklere bakıp tahmin öğrenir” fikrini kurmak, sonra hazır araçları güvenle kullanmak iyi bir sıra. Her şeyi matematikle başlatmak zorunda değilsin.',
    nextSteps: ['Ücretsiz bir giriş dersi seç (video veya yazılı)', 'Hazır bir demo ile oyalan', 'Veri ve gizlilik konusunda kısa bir yazı oku'],
  },
  devops: {
    headline: '“Çalışır halde kalsın” kısmı sana yakın görünüyor',
    subline: 'Yani yazılımı paketlemek, sunucuya koymak ve bozulunca haber almak.',
    body: 'Sadece kod yazmaktan farklı ama çok aranan bir yan. Komut satırı ve “aynı ortamda çalışsın” gibi fikirlerle başlamak yeterli.',
    nextSteps: ['Temel komut satırı alıştırması yap', '“Docker nedir” diye 15 dk’lık özet izle', 'Küçük bir projeyi bir yere yüklemeyi dene'],
  },
  'urun-ux': {
    headline: 'Kullanıcı için doğru şeyi seçmek öne çıkıyor',
    subline: 'Yani önce kimin derdi çözülüyor, sonra nasıl gösterelim?',
    body: 'Güzel ekran çizmek önemli ama “kime fayda” sorusuna cevap olmadan yetmeyebilir. Konuşma, taslak ve sırayı netleştirme bu alanın kalbi.',
    nextSteps: ['Bir uygulamada seni rahatsız eden bir akımı not al', 'Kağıtta ekran taslakları çiz', '“Kullanıcı araştırması nedir” için kısa okuma yap'],
  },
};

/** @type {{ id: string, text: string, options: { id: string, text: string, help?: string, scores: Record<string, number> }[] }[]} */
export const ORIENTATION_QUESTIONS = [
  {
    id: 'q1',
    text: 'Boş zamanında hangi tür şeylerle uğraşmak sana daha çekici gelir?',
    options: [
      {
        id: 'q1a',
        text: 'Görsel düzen ve sayfa akışı',
        help: 'Ekranda nelerin nerede duracağını, tıklanınca ne olacağını düşünmek.',
        scores: { frontend: 3, 'urun-ux': 2 },
      },
      {
        id: 'q1b',
        text: 'Arka planda çalışan sistemler ve güvenilirlik',
        help: 'Kullanıcının görmediği tarafta verinin saklanması ve uygulamanın düzgün cevap vermesi.',
        scores: { backend: 3, devops: 1 },
      },
      {
        id: 'q1c',
        text: 'Veri tabloları ve grafikler',
        help: 'Sayılardan ve listelerden anlam çıkarmak, tabloyu grafikle anlatmak.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q1d',
        text: 'Yeni teknikleri okumak veya denemek',
        help: 'Bilgisayara öğretme, sohbet benzeri araçlar gibi yeniliklere merak duymak.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q2',
    text: 'İlk ciddi öğrenme hedefin hangisine daha yakın?',
    options: [
      {
        id: 'q2a',
        text: 'Web sitesinin veya uygulunun görünen kısmı',
        help: 'Butonlar, menüler, sayfa düzeni; insanın ekranda tıkladığı yerler.',
        scores: { frontend: 3 },
      },
      {
        id: 'q2b',
        text: 'Sunucu tarafı ve kayıtların saklanması',
        help: 'Görmediğin tarafta çalışan kod ve “deftere yazılı” bilgiler.',
        scores: { backend: 3 },
      },
      {
        id: 'q2c',
        text: 'Tablolarla çalışmak ve özetler çıkarmak',
        help: 'Excel’e benzer düşün; daha büyük veriyle listelemek ve grafik yapmak.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q2d',
        text: 'Akıllı özellik veya yapay zekâ uygulaması',
        help: 'Tahmin, öneri veya sohbet gibi “akıllı” davranan kısımlar.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q3',
    text: 'Hangi konuda okumak veya izlemek seni daha çok içine çeker?',
    options: [
      {
        id: 'q3a',
        text: 'Tasarım ve kullanım kolaylığı',
        help: 'Renk, hareket, kullanıcının işini rahatlatmak.',
        scores: { frontend: 2, 'urun-ux': 2 },
      },
      {
        id: 'q3b',
        text: 'Çok kişi kullanınca sistemin ayakta kalması',
        help: 'Büyüyen bir uygulamanın çökmeden, izlenebilir şekilde çalışması.',
        scores: { backend: 2, devops: 2 },
      },
      {
        id: 'q3c',
        text: 'İstatistik ve “hangisi daha iyi” deneyleri',
        help: 'A mı B mi daha iyi gibi ölçülebilir sonuçlar.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q3d',
        text: 'Yeni yapay zekâ haberleri ve deneyler',
        help: 'Yeni teknikler, denemeler ve uzun yazılar (makaleler).',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q4',
    text: 'Takımda hayalindeki günlük iş daha çok hangisi?',
    options: [
      {
        id: 'q4a',
        text: 'Ekranları ve parçaları iyileştirmek',
        help: 'Kullanıcının gördüğü arayüzü düzenlemek ve güzelleştirmek.',
        scores: { frontend: 3 },
      },
      {
        id: 'q4b',
        text: 'Uygulamanın ana işlerini ve bağlantılarını yazmak',
        help: 'Arka planda çalışan mantık ve diğer sistemlerle konuşma.',
        scores: { backend: 3 },
      },
      {
        id: 'q4c',
        text: 'Özet panolar ve rakamlar',
        help: 'Ekibe veya yöneticilere grafik ve özetlerle durum göstermek.',
        scores: { 'veri-bilimi': 2, 'urun-ux': 1 },
      },
      {
        id: 'q4d',
        text: 'Deneysel küçük örnek veya model',
        help: 'Yeni bir yöntemi denemek; küçük bir “akıllı” deneme yapmak.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q5',
    text: 'Hangi cümle sana daha çok hitap ediyor?',
    options: [
      {
        id: 'q5a',
        text: '“Kullanımı kolaylaştıralım.”',
        help: 'İnsanların uygulamayı daha az kafası karışarak kullanması.',
        scores: { 'urun-ux': 3, frontend: 1 },
      },
      {
        id: 'q5b',
        text: '“Sistem ayakta kalsın, ölçebilelim.”',
        help: 'Çökmeden çalışsın; sorun olduğunda ne olduğunu görebilelim.',
        scores: { backend: 2, devops: 2 },
      },
      {
        id: 'q5c',
        text: '“Veriden net bir hikâye çıkaralım.”',
        help: 'Rakamları anlamlı bir özet ve grafikle anlatmak.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q5d',
        text: '“Bunu yeni bir yöntemle deneyelim.”',
        help: 'Henüz herkesin yapmadığı bir teknikle küçük deneme yapmak.',
        scores: { 'yapay-zeka': 2, devops: 1 },
      },
    ],
  },
  {
    id: 'q6',
    text: 'Stres anında hangi görev sana daha “rahatlatıcı” gelir?',
    options: [
      {
        id: 'q6a',
        text: 'Görünümü düzgünleştirmek (boşluk, hizalama)',
        help: 'Çizgiler ve düzen; her şeyin uyumlu görünmesi.',
        scores: { frontend: 2 },
      },
      {
        id: 'q6b',
        text: 'Neden bozulduğunu araştırmak',
        help: 'Arka planda bir hata varsa izini sürmek ve düzeltmek.',
        scores: { backend: 2 },
      },
      {
        id: 'q6c',
        text: 'Grafik çizmek ve veride tuhaf noktalar aramak',
        help: 'Tabloda dikkat çeken uç değerleri ve örüntüleri bulmak.',
        scores: { 'veri-bilimi': 2 },
      },
      {
        id: 'q6d',
        text: 'Yayına alma ve sunucu tarafını düzeltmek',
        help: 'Programın canlı ortamda düzgün çalışmasını sağlamak.',
        scores: { devops: 3 },
      },
    ],
  },
];

function emptyScores() {
  return Object.fromEntries(ARCHETYPES.map((k) => [k, 0]));
}

export function computeOrientationLocal(answers) {
  /** @type {{ questionId: string, optionId: string }[]} */
  const list = Array.isArray(answers) ? answers : [];
  const totals = emptyScores();
  for (const a of list) {
    const q = ORIENTATION_QUESTIONS.find((x) => x.id === a.questionId);
    const opt = q?.options?.find((o) => o.id === a.optionId);
    if (!opt?.scores) continue;
    for (const [k, v] of Object.entries(opt.scores)) {
      if (typeof totals[k] === 'number' && typeof v === 'number') totals[k] += v;
    }
  }
  let best = ARCHETYPES[0];
  let max = -1;
  for (const k of ARCHETYPES) {
    if (totals[k] > max) {
      max = totals[k];
      best = k;
    }
  }
  const c = COPY[best] ?? COPY.frontend;
  return {
    archetype: best,
    headline: c.headline,
    subline: c.subline,
    body: c.body,
    nextSteps: [...c.nextSteps],
    scores: totals,
    source: 'local',
  };
}

function normalizeRemote(data) {
  if (!data || typeof data !== 'object') return null;
  const archetype = typeof data.archetype === 'string' ? data.archetype : '';
  const headline = typeof data.headline === 'string' ? data.headline.trim() : '';
  if (!headline) return null;
  const subline = typeof data.subline === 'string' ? data.subline.trim() : '';
  const body = typeof data.body === 'string' ? data.body.trim() : '';
  const nextSteps = Array.isArray(data.nextSteps)
    ? data.nextSteps.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];
  return {
    archetype: ARCHETYPES.includes(archetype) ? archetype : 'frontend',
    headline,
    subline,
    body,
    nextSteps,
    scores: null,
    source: 'remote',
  };
}

/**
 * @param {{ questionId: string, optionId: string }[]} answers
 */
export async function resolveOrientationResult(answers) {
  const local = computeOrientationLocal(answers);
  const url = import.meta.env.VITE_N8N_ORIENTATION_WEBHOOK_URL?.trim();
  if (!url) return local;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'yonerge_testi',
        answers,
        localGuess: local.archetype,
        localScores: local.scores,
      }),
    });
    const raw = await res.text();
    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    const parsed = normalizeRemote(json);
    if (res.ok && parsed) return parsed;
  } catch {
    /* Uzak adres yok veya ağ hatası — yerel sonuç */
  }
  return local;
}
