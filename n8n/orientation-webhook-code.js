/**
 * n8n Code node — Yönelim testi (yonerge_testi) → Respond to Webhook
 *
 * Akış: Webhook → bu Code → Respond to Webhook ("First Incoming Item")
 * Webhook node: Respond = "Using 'Respond to Webhook' Node"
 *
 * Girdi: Pusula POST gövdesi { event, answers, localGuess, localScores }
 */

const item = $input.first().json;
const raw = item.body && typeof item.body === 'object' && !Array.isArray(item.body) ? item.body : item;

const VALID_ARCH = new Set([
  'frontend',
  'backend',
  'veri-bilimi',
  'yapay-zeka',
  'devops',
  'urun-ux',
]);

// `web/src/lib/orientationQuiz.js` içindeki COPY ile senkron tutun
const COPY = {
  frontend: {
    headline: '🖥️ Ekranı düşünmek sana yakın görünüyor',
    subline:
      'Yani insanların tıkladığı menüler, formlar ve sayfa düzeni: “bu ekranda kullanıcı neyi nasıl anlar?” sorusu seni meşgul edebilir.',
    body: `Web sitesi veya uygulama dediğimiz şey, aslında kutular ve yazılardan oluşur; renk ve boşluklarla okunurluk kazanır. İlk adımlar genelde “sayfayı iskeletle kurmak” ve “tıklanınca bir şey olması” üzerinedir. Ekiplerde buna frontend veya web arayüzü denir; sen acemiysen sadece küçük bir örneği kopyalayıp oynamak bile büyük ilerlemedir.\n\nBu özet, testte verdiğin yanıtlardan çıkan bir yön önerisidir; tek gerçek meslek tanımı değil. Merakın görünen tarafa kayıyorsa doğru yoldasın: pratikle her şey daha netleşir.`,
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
    body: `Kullanıcı “kaydet” dediğinde aslında bir yere istek gider, sunucu bir şeyler kontrol eder, veritabanına yazar ve cevap döner. Bu tarafı sevenler genelde “mantık nerede işliyor?”, “bu bilgi tutarlı mı?” diye sorar. Kod yazmak şart değil; önce internetin “istek–cevap” dilini ve küçük bir veri örneğini anlamak bile yol gösterir.\n\nÜniversite bölümün ne olursa olsun; sistematik düşünmek ve hatayı adım adım daraltmak bu alanda güç katar. Bu metin yalnızca bir pusula — gerçek kariyerde frontend ve veri ile sınırınız sıkça geçersin.`,
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
    body: `Çoğu kurumun kararı artık tablolara dayanıyor. Senin alanın, ham veriyi düzenleyip anlaşılır hale getirmek, sonra da tek bir cümle veya grafikle yönetime anlatmak olabilir. Excel benzetmesiyle başlayabilirsin; fark genelde veri boyutu ve sunum kalitesidir. İleri istatistik ilk hafta şart değil; merak ve düzenli not tutmak yeterli başlangıçtır.\n\nYanlış yorum riskini azaltmak için her zaman kaynağa ve tanımlara dönmek gerekir — bu alanın doğal disiplinidir.`,
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
    body: `Yapay zekâ medyada büyütülse de temel fikir şu: bilgisayar, bol örnekle desen arar ve yeni veride tahmin veya üretim yapar. Matematik merakın olmasa da görsel derslerle “öğrenme” ve “veri” kavramlarını kavrayabilirsin. Hazır bir aracı kullanmak ile kendi uygulamanı ona bağlamak farklı işler; ikisi de değerli ama süre ve gizlilik beklentileri değişir.\n\nEtik ve güven: Yanlış cevap, önyargı ve kişisel veri konularında kısa okumalar yapmak, bu alana girecek herkes için artık standart bir bilinçdir.`,
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
    body: `Kod yazıldıktan sonra hayatı bitmez: bir sunucuda veya bulutta çalışır, sürümler çıkar, bazen bozulur. DevOps diye anılan yer, bu güvenilirliği ve tekrarlanabilirliği artırmakla ilgilidir. “Benim bilgisayarımda çalışıyordu” lafını az duymak için paketleme ve otomasyon kullanılır. Komut satırı (terminal) bu yüzden sık geçer; korkutucu görünür ama küçük adımlarla alışılabilir.\n\nBu alan bazen gece müdahalesi ve stres getirir; ama sistemin sürdürülebilir olması için kritiktir. Test sadece bir yön önerisi — kendi temponda, kendi merakınla derinleş.`,
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
    body: `Güzel piksel çizmek tek başına yeterli olmayabilir; doğru problemi seçmek ve küçük adımlarla doğrulamak gerekir. Kullanıcı araştırması, görüşme, basit taslak ve önceliklendirme bu yüzden önemlidir. “Kullanımı kolay” lafları çoğu zaman keşfedilmemiş sürtüşmeden gelir; sen bu sürtüşmeyi görmekten hoşlanıyorsan ürün/UX dünyası yakın olabilir.\n\nTasarımcı, analist veya mühendis olarak da bu beceriler harmanlanır; bu özet sadece yön verir.`,
    nextSteps: [
      '📝 Sevdiğin bir uygulamada seni çıldırtan 3 adım yaz — Sonra “bunu nasıl sadeleştirirdim?” diye tek cümle ekle.',
      '✏️ Kağıtta bir akış çiz — Kayıt ol → e-posta doğrula gibi kutucuklar yeter; Figma şart değil.',
      '👥 “Kullanıcı görüşmesi nedir?” diye 10 dk’lık okuma — Amaç yöntemi tanımak, uzman olmak değil.',
      '📌 “Önce hangi küçük parça?” sorusu — Roadmap gibi düşün; tek haftalık deney belirle.',
    ],
  },
};

function pickArchetype(body) {
  const g = typeof body.localGuess === 'string' ? body.localGuess.trim() : '';
  if (g && VALID_ARCH.has(g)) return g;
  if (body.localScores && typeof body.localScores === 'object') {
    let best = 'frontend';
    let max = -1;
    for (const k of VALID_ARCH) {
      const n = Number(body.localScores[k]);
      if (Number.isFinite(n) && n > max) {
        max = n;
        best = k;
      }
    }
    return best;
  }
  return 'frontend';
}

const archetype = pickArchetype(raw);
const template = COPY[archetype] ?? COPY.frontend;

return [
  {
    json: {
      archetype,
      headline: template.headline,
      subline: template.subline,
      body: template.body,
      nextSteps: template.nextSteps,
    },
  },
];
