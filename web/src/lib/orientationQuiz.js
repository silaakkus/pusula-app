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

/** @type {{ id: string, text: string, emoji?: string, options: { id: string, text: string, emoji?: string, help?: string, scores: Record<string, number> }[] }[]} */
export const ORIENTATION_QUESTIONS = [
  {
    id: 'q1',
    emoji: '🧭',
    text: 'Hayal et: kendi başına küçük bir dijital proje yapacaksın. Boş zamanında hangi tür uğraş seni en çok “biraz daha yapsam” dedirtir? Burada doğru cevap yok; sadece hangi işin sana daha yakın hissettirdiğini merak ediyoruz.',
    options: [
      {
        id: 'q1a',
        emoji: '🎨',
        text: 'Görsel düzen ve sayfa akışı',
        help: 'Renkler, boşluklar, menüler ve “tıklayınca ne olacak?” akışı seni oyalar. Sanki bir vitrin veya telefon ekranı tasarlıyormuşsun gibi düşün; kullanıcının kafasının karışmamasına özen göstermek hoşuna gider.',
        scores: { frontend: 3, 'urun-ux': 2 },
      },
      {
        id: 'q1b',
        emoji: '⚙️',
        text: 'Arka planda çalışan sistemler ve güvenilirlik',
        help: 'Ekranın arkasında kayıtların saklandığı, “şu anda sunucuya ne oldu?” gibi soruların cevaplandığı taraf. Bir şey bozulunca “neden?” diye kök nedene inmek veya sistemin ayakta kalması seni motive edebilir.',
        scores: { backend: 3, devops: 1 },
      },
      {
        id: 'q1c',
        emoji: '📊',
        text: 'Veri tabloları ve grafikler',
        help: 'Excel’de satır satır gezmek gibi ama asıl hedef “burada ne oluyor?” demek. Sayıları temizleyip grafiğe dökmek, sonra tek paragrafla özetlemek sana tatmin verebilir; detay kurcalamayı seversin.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q1d',
        emoji: '🤖',
        text: 'Yeni teknikleri okumak veya denemek',
        help: 'Sohbet botları, öneri sistemleri, “bilgisayar bakıp öğrensin” fikri… Haberleri veya kısa denemeleri izlemek, “bir de ben denesem” demek sana yakın gelir. Matematik şart değil; merak yeter.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q2',
    emoji: '🎯',
    text: 'Yakın zamanda düzenli öğrenmeye başlayacak olsan, ilk ciddi hedefin hangisine daha yakın durur? Tümü değerli; burada “şu an en çok hangisi”yi seçmen yeterli.',
    options: [
      {
        id: 'q2a',
        emoji: '🖥️',
        text: 'Web sitesinin veya uygulamanın görünen kısmı',
        help: 'İnsanların gerçekten tıkladığı ekranları yapmak: düğmeler, listeler, formlar. Bir sayfanın hem güzel hem anlaşılır görünmesi hedefin olur; sonra parçaların hareket etmesini öğrenmek istersin.',
        scores: { frontend: 3 },
      },
      {
        id: 'q2b',
        emoji: '🗄️',
        text: 'Sunucu tarafı ve kayıtların saklanması',
        help: 'Kullanıcının görmediği tarafta “bu bilgiyi nerede saklıyoruz?”, “giriş yapılınca ne kontrol ediliyor?” gibi işler. Küçük bir servis yazıp veritabanına kayıt atmak senin için anlamlı bir ilk hedef olur.',
        scores: { backend: 3 },
      },
      {
        id: 'q2c',
        emoji: '📈',
        text: 'Tablolarla çalışmak ve özetler çıkarmak',
        help: 'Herkese açık bir veri seti indirip filtrelemek, basit istatistiklerle oynamak, sonucu grafikle göstermek istersin. İş dünyasında “içgörü” dedikleri şeyin pratik haline yaklaşırsın.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q2d',
        emoji: '✨',
        text: 'Akıllı özellik veya yapay zekâ uygulaması',
        help: 'Tahmin, özet metin, sohbet, görüntü tanıma gibi akıllı görünen parçalar. Hazır bir aracı derinlemesine denemek veya çok küçük bir model eğitmek gibi somut bir hedef kurmak isterdin.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q3',
    emoji: '📚',
    text: 'Boş bir akşamında vakit geçireceksin. Hangi konuda içerik (video, yazı) seçsen içine daha çok dalarsın?',
    options: [
      {
        id: 'q3a',
        emoji: '🎨',
        text: 'Tasarım ve kullanım kolaylığı',
        help: 'Renk, erişilebilirlik, küçük animasyonlar… “Kullanıcı bunu nasıl daha az düşünerek yapar?” sorusu seni çeker. Güzel görünüm ile az yorucu akış bir arada ilgini çeker.',
        scores: { frontend: 2, 'urun-ux': 2 },
      },
      {
        id: 'q3b',
        emoji: '🏗️',
        text: 'Çok kişi kullanınca sistemin ayakta kalması',
        help: 'Büyüyen trafik, yavaşlamayan servis, loglara bakıp ne olduğunu anlama. Terimleri yeni duyuyor olabilirsin; “herkes girince de çalışsın” fikri sana çekici gelir.',
        scores: { backend: 2, devops: 2 },
      },
      {
        id: 'q3c',
        emoji: '🔢',
        text: 'İstatistik ve “hangisi daha iyi” deneyleri',
        help: 'A seçeneği mi B mi daha çok tuttu? Grafik neden düştü? Deney ve ölçüm sonuçlarını okumak hoşuna gider; araçların adını bilmek şart değil.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q3d',
        emoji: '🧪',
        text: 'Yeni yapay zekâ haberleri ve deneyler',
        help: 'Yeni modeller, “şunu denediler oldu” videoları, akademik özetler… Her satırı anlamasan bile “bir sonraki adım ne?” merakı seni içeri alır.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q4',
    emoji: '💼',
    text: 'Bir takımda çalıştığını düşün. Aynı maaş ve süre olsa, günlük işin daha çok hangisine benzerdi?',
    options: [
      {
        id: 'q4a',
        emoji: '🖌️',
        text: 'Ekranları ve parçaları iyileştirmek',
        help: 'Tasarımcıyla konuşup bileşenleri güncellemek, tutarlılık sağlamak, küçük kusurları düzeltmek. “Ekran şöyle olsa daha iyi olmaz mı?” diyerek geçirdiğin günler.',
        scores: { frontend: 3 },
      },
      {
        id: 'q4b',
        emoji: '🔗',
        text: 'Uygulamanın ana işlerini ve bağlantılarını yazmak',
        help: 'Ödeme sistemine bağlanmak, kayıt açılınca e-posta göndermek, başka bir servisle konuşmak… İş kuralları senin masanda netleşir.',
        scores: { backend: 3 },
      },
      {
        id: 'q4c',
        emoji: '📉',
        text: 'Özet panolar ve rakamlar',
        help: 'Haftalık rakamları toplayıp yönetime tek sayfalık özet; hangi özellik kullanılmış, nerelerde düşüş var. Hem veri hem sunum senin işin olur.',
        scores: { 'veri-bilimi': 2, 'urun-ux': 1 },
      },
      {
        id: 'q4d',
        emoji: '🔬',
        text: 'Deneysel küçük örnek veya model',
        help: '“Şu yeni yöntemi denesek ne olur?” deyip prototip hazırlamak. Başarısızlık bile öğretici; deneme-yanılma senin ritmin.',
        scores: { 'yapay-zeka': 3 },
      },
    ],
  },
  {
    id: 'q5',
    emoji: '💬',
    text: 'Aşağıdaki cümlelerden biri toplantıda söyleniyor. İçinden “en çok ben derdim” dediğin hangisi?',
    options: [
      {
        id: 'q5a',
        emoji: '🧩',
        text: '“Kullanımı kolaylaştıralım.”',
        help: 'Form çok uzun, menü kafa karıştırıcı gibi geri bildirimlerde ilk aklına gelen “önce insan rahat etsin” olur. Hem düzen hem ürün düşüncesine kayarsın.',
        scores: { 'urun-ux': 3, frontend: 1 },
      },
      {
        id: 'q5b',
        emoji: '🛡️',
        text: '“Sistem ayakta kalsın, ölçebilelim.”',
        help: 'Çökme olmasın, gecikme görünür olsun, sorun olunca ne olduğunu anlayabilelim dersin. Güven ve izlenebilirlik önceliğin.',
        scores: { backend: 2, devops: 2 },
      },
      {
        id: 'q5c',
        emoji: '📰',
        text: '“Veriden net bir hikâye çıkaralım.”',
        help: 'Ham tabloyu yönetime anlatılabilir hale getirmek: bir grafik, üç madde, net bir öneri. “Ne işe yarayacak?” sorusuna cevap ararsın.',
        scores: { 'veri-bilimi': 3 },
      },
      {
        id: 'q5d',
        emoji: '🚀',
        text: '“Bunu yeni bir yöntemle deneyelim.”',
        help: 'Risk alıp küçük pilot yapmak, henüz herkesin kullanmadığı bir araçla deneme. Yenilikçi tarafta durmayı seversin.',
        scores: { 'yapay-zeka': 2, devops: 1 },
      },
    ],
  },
  {
    id: 'q6',
    emoji: '🧘',
    text: 'Zor bir gün: her şey üst üste geldi. Aşağıdaki görevlerden hangisine dönsem “en azından bunu kontrol edebilirim” diye içim rahatlar?',
    options: [
      {
        id: 'q6a',
        emoji: '✏️',
        text: 'Görünümü düzgünleştirmek (boşluk, hizalama)',
        help: 'Somut ve görünür ilerleme: boşlukları eşitlemek, listeleri hizalamak. Sonuç hemen göz önünde olduğu için zihnini sakinleştirir.',
        scores: { frontend: 2 },
      },
      {
        id: 'q6b',
        emoji: '🔍',
        text: 'Neden bozulduğunu araştırmak',
        help: 'Kayıt satırlarına bakmak, hatayı adım adım daraltmak. Bulmaca çözmek gibi; cevap gelince rahatlarsın.',
        scores: { backend: 2 },
      },
      {
        id: 'q6c',
        emoji: '🔎',
        text: 'Grafik çizmek ve veride tuhaf noktalar aramak',
        help: 'Aykırı değer mi var, trend mi kırılmış diye keşif. Veriye baktığında “aha” demek seni rahatlatır.',
        scores: { 'veri-bilimi': 2 },
      },
      {
        id: 'q6d',
        emoji: '🚢',
        text: 'Yayına alma ve sunucu tarafını düzeltmek',
        help: 'Yeni sürümü güvenle çıkarmak veya çalışma ortamının doğru ayarlandığından emin olmak. “Canlıda çalışıyor mu?” sorusunu kapattığında nefes alırsın.',
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
