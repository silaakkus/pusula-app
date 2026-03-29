/** Yerel skor; isteğe bağlı sunucu yanıtı ile metin zenginleştirilebilir */

const ARCHETYPES = ['frontend', 'backend', 'veri-bilimi', 'yapay-zeka', 'devops', 'urun-ux'];

/** Eski webhook / test metinlerinde kalan teknik sonekleri gizle */
export function sanitizeOrientationBody(text) {
  if (typeof text !== 'string') return '';
  let t = text.replace(/\r\n/g, '\n');
  t = t.replace(/\([^)]*n8n[^)]*\)/gi, '');
  t = t.replace(/\([^)]*işlendi[^)]*cevap[^)]*\)/gi, '');
  t = t.replace(/\bn8n\b[^.!?]*[.!?]?/gi, '');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

const COPY = {
  frontend: {
    headline: '🖥️ Ekranı düşünmek sana yakın görünüyor',
    subline:
      'Yani insanların tıkladığı menüler, formlar ve sayfa düzeni: “bu ekranda kullanıcı neyi nasıl anlar?” sorusu seni meşgul edebilir.',
    body: `Web sitesi veya uygulama dediğimiz şey, aslında kutular ve yazılardan oluşur; renk ve boşluklarla okunurluk kazanır. İlk adımlar genelde “sayfayı iskeletle kurmak” ve “tıklanınca bir şey olması” üzerinedir. Ekiplerde buna frontend veya web arayüzü denir; sen acemiysen sadece küçük bir örneği kopyalayıp oynamak bile büyük ilerlemedir.

Bu özet, testte verdiğin yanıtlardan çıkan bir yön önerisidir; tek gerçek meslek tanımı değil. Merakın görünen tarafa kayıyorsa doğru yoldasın: pratikle her şey daha netleşir.`,
    nextSteps: [
      '🧱 Tek sayfalık hayali bir “hakkımda” veya liste sayfası çiz — Kağıtta veya ücretsiz bir sürümle site kurucuda; amaç yapıyı düşünmek.',
      '🎨 Renk ve yazı tipiyle oyna — Aynı metni iki farklı renk kombinasyonunda dene; hangisini okuması daha kolay?',
      '📺 MDN veya benzeri siteden “HTML giriş” videosu izle — “Bu sitedeki adım adım eğitime 30 dk ayır” yeterli; hepsini ezberleme.',
      '✅ İlk mini hedef — Tarayıcıda kendi bilgisayarında çalışan çok basit bir statik sayfa bırak (kaydet, dosyayı aç, gör).',
    ],
  },
  backend: {
    headline: '⚙️ Arka plan ve veri tarafı sana yakın görünüyor',
    subline:
      'Yani ekranın arkasında kayıtların durduğu, girişin kontrol edildiği ve diğer servislerle konuşulduğu katman.',
    body: `Kullanıcı “kaydet” dediğinde aslında bir yere istek gider, sunucu bir şeyler kontrol eder, veritabanına yazar ve cevap döner. Bu tarafı sevenler genelde “mantık nerede işliyor?”, “bu bilgi tutarlı mı?” diye sorar. Kod yazmak şart değil; önce internetin “istek–cevap” dilini ve küçük bir veri örneğini anlamak bile yol gösterir.

Üniversite bölümün ne olursa olsun; sistematik düşünmek ve hatayı adım adım daraltmak bu alanda güç katar. Bu metin yalnızca bir pusula — gerçek kariyerde frontend ve veri ile sınırınız sıkça geçersin.`,
    nextSteps: [
      '🎬 “HTTP / istek cevap” diye 15–20 dakikalık Türkçe veya İngilizce bir özet izle — Teknik terimleri not almana gerek yok, fikri yakala.',
      '📝 “Mini liste kaydı” örneği ara — Form doldurup listede görünmesi gibi basit bir öğretici; dil önemli değil, mantık önemli.',
      '🗃️ Veritabanı nedir? diye çizgi film tadında bir anlatım bul — Tablo, satır, benzersiz kimlik kavramları yeter.',
      '🔒 Güvenlik farkındalığı — “Şifreler düz yazı saklanmaz” cümlesinin nedenini tek paragrafla oku; uzun ders şart değil.',
    ],
  },
  'veri-bilimi': {
    headline: '📊 Sayılardan hikâye çıkarmak sana yakın görünüyor',
    subline: 'Yani tablolar, grafikler ve “bu veri ne anlatıyor?” sorusuyla uğraşmak.',
    body: `Çoğu kurumun kararı artık tablolara dayanıyor. Senin alanın, ham veriyi düzenleyip anlaşılır hale getirmek, sonra da tek bir cümle veya grafikle yönetime anlatmak olabilir. Excel benzetmesiyle başlayabilirsin; fark genelde veri boyutu ve sunum kalitesidir. İleri istatistik ilk hafta şart değil; merak ve düzenli not tutmak yeterli başlangıçtır.

Yanlış yorum riskini azaltmak için her zaman kaynağa ve tanımlara dönmek gerekir — bu alanın doğal disiplinidir.`,
    nextSteps: [
      '⬇️ Herkese açık küçük bir veri seti indir — İlk turda 100–500 satır yeter; “temiz ve açıklamalı” olsun.',
      '📈 Tek grafik, tek cümle — Bir sütunu görselleştir ve “Bu grafik şunu söylüyor: …” diye yaz.',
      '🎥 “Veri analizi giriş” araması yap — Beğendiğin bir kanaldan 25 dk’lık bir videoyu baştan sona izle.',
      '📚 Khan Academy istatistik girişine göz at — Her bölümü bitirmek zorunda değilsin; dağılım ve ortalama fikrini kapman yeter.',
    ],
  },
  'yapay-zeka': {
    headline: '🤖 Akıllı sistemler ve yenilikler sana yakın görünüyor',
    subline: 'Sohbet araçları, öneriler, görüntü veya metin üreten modeller gibi konular ilgini çekebilir.',
    body: `Yapay zekâ medyada büyütülse de temel fikir şu: bilgisayar, bol örnekle desen arar ve yeni veride tahmin veya üretim yapar. Matematik merakın olmasa da görsel derslerle “öğrenme” ve “veri” kavramlarını kavrayabilirsin. Hazır bir aracı kullanmak ile kendi uygulamanı ona bağlamak farklı işler; ikisi de değerli ama süre ve gizlilik beklentileri değişir.

Etik ve güven: Yanlış cevap, önyargı ve kişisel veri konularında kısa okumalar yapmak, bu alana girecek herkes için artık standart bir bilinçdir.`,
    nextSteps: [
      '🎯 Bir ücretsiz “AI 101” veya “ML giriş” videosu seç — 45 dk üstü bir maraton seçme; kısa ve öz olsun.',
      '🧪 Hazır bir demoda 10 soru sor — Ne zaman güvenilir, ne zaman uydurur; not al.',
      '🔐 “Prompt güvenliği” veya “LLM gizliliği” diye 1 makale oku — Uzman olmana gerek yok, anahtar kelimeleri duyman yeter.',
      '🧩 Fast.ai veya benzeri sitede “ilk ders” sayfasını aç — Tümünü bitirme; sadece yol haritasına bak.',
    ],
  },
  devops: {
    headline: '🚀 Yayın, altyapı ve “çalışır kalsın” kısmı sana yakın görünüyor',
    subline:
      'Yani yazılımın canlı ortamda ayakta kalması, güncellenmesi ve takımın aynı ortamdan konuşması seni cezbedebilir.',
    body: `Kod yazıldıktan sonra hayatı bitmez: bir sunucuda veya bulutta çalışır, sürümler çıkar, bazen bozulur. DevOps diye anılan yer, bu güvenilirliği ve tekrarlanabilirliği artırmakla ilgilidir. “Benim bilgisayarımda çalışıyordu” lafını az duymak için paketleme ve otomasyon kullanılır. Komut satırı (terminal) bu yüzden sık geçer; korkutucu görünür ama küçük adımlarla alışılabilir.

Bu alan bazen gece müdahalesi ve stres getirir; ama sistemin sürdürülebilir olması için kritiktir. Test sadece bir yön önerisi — kendi temponda, kendi merakınla derinleş.`,
    nextSteps: [
      '⌨️ Terminale ısın — Klasör gezme, dosya listeleme; 20 dk’lık “Windows PowerShell veya macOS Terminal giriş” videosu.',
      '📦 “Docker nedir?” özeti izle — Amaç kutulama fikrini sezmek; ilk günden kurman şart değil.',
      '📌 GitHub’da küçük bir README yayını — Public repo + 5 maddelik “nasıl çalıştırılır” yazmak, yayın zihniyeti için iyi alıştırma.',
      '🔔 “Log / kayıt” ne işe yarar oku — Bir sayfalık blog yazısı yeter; hata ayıklama hayatını kolaylaştırır.',
    ],
  },
  'urun-ux': {
    headline: '🧭 Kullanıcı ve ürün düşüncesi öne çıkıyor',
    subline: 'Önce “kimin sorunu çözülüyor?”, sonra “ekranda sırayı nasıl kuruyoruz?” sorusu.',
    body: `Güzel piksel çizmek tek başına yeterli olmayabilir; doğru problemi seçmek ve küçük adımlarla doğrulamak gerekir. Kullanıcı araştırması, görüşme, basit taslak ve önceliklendirme bu yüzden önemlidir. “Kullanımı kolay” lafları çoğu zaman keşfedilmemiş sürtüşmeden gelir; sen bu sürtüşmeyi görmekten hoşlanıyorsan ürün/UX dünyası yakın olabilir.

Tasarımcı, analist veya mühendis olarak da bu beceriler harmanlanır; bu özet sadece yön verir.`,
    nextSteps: [
      '📝 Sevdiğin bir uygulamada seni çıldırtan 3 adım yaz — Sonra “bunu nasıl sadeleştirirdim?” diye tek cümle ekle.',
      '✏️ Kağıtta bir akış çiz — Kayıt ol → e-posta doğrula gibi kutucuklar yeter; Figma şart değil.',
      '👥 “Kullanıcı görüşmesi nedir?” diye 10 dk’lık okuma — Amaç yöntemi tanımak, uzman olmak değil.',
      '📌 “Önce hangi küçük parça?” sorusu — Roadmap gibi düşün; tek haftalık deney belirle.',
    ],
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
  const body = sanitizeOrientationBody(typeof data.body === 'string' ? data.body.trim() : '');
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
    if (res.ok && parsed) {
      parsed.body = sanitizeOrientationBody(parsed.body ?? '');
      return parsed;
    }
  } catch {
    /* Uzak adres yok veya ağ hatası — yerel sonuç */
  }
  return local;
}
