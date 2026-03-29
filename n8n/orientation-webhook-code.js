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

// Uygulamadaki `web/src/lib/orientationQuiz.js` ile aynı metinler (son kullanıcı dili)
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
