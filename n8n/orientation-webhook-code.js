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

const COPY = {
  frontend: {
    headline: 'Sen frontend dünyasına çok yakınsın!',
    subline: 'Arayüz, kullanıcı akışı ve görsel düzen seni besliyor.',
    body: 'HTML/CSS’ten başlayıp JavaScript ve bir framework ile derinleşebilirsin. Küçük arayüz projeleri ve erişilebilirlik pratiği seni hızlı taşır.',
    nextSteps: ['MDN ile HTML/CSS pekiştir', 'JavaScript temelleri + mini DOM projesi', 'React veya Vue resmi dokümantasyonla ilk SPA'],
  },
  backend: {
    headline: 'Sen backend tarafına güçlü kayıyorsun!',
    subline: 'Sistemlerin güvenilir çalışması ve API’ler seni çekiyor.',
    body: 'HTTP/REST, bir dil seçimi ve veritabanı ile servis yazmayı öğren; kimlik doğrulama ve dağıtım adımlarını sıraya koy.',
    nextSteps: ['HTTP + REST pratiği', 'FastAPI veya Express ile CRUD', 'SQL ve migration alıştırmaları'],
  },
  'veri-bilimi': {
    headline: 'Veri bilimi sana çok uyuyor!',
    subline: 'Tablolar, grafikler ve ölçülebilir içgörü seni heyecanlandırıyor.',
    body: 'Python, pandas ve SQL ile başla; istatistik sezgisi ve basit modellerle hikâye anlatmayı birleştir.',
    nextSteps: ['pandas ile açık veri seti', 'SQL JOIN ve GROUP BY', 'scikit-learn ile ilk model'],
  },
  'yapay-zeka': {
    headline: 'Yapay zeka ve ML yoluna yakınsın!',
    subline: 'Deneme, model ve yeni teknikler senin için merak kaynağı.',
    body: 'Klasik ML temelleri → derin öğrenmeye geçiş → LLM/API güvenliği ve etik konularına zaman ayır.',
    nextSteps: ['scikit-learn ile denetimli öğrenme', 'PyTorch veya TensorFlow giriş', 'LLM API’leri + prompt güvenliği farkındalığı'],
  },
  devops: {
    headline: 'DevOps ve altyapı tarafı sana yakın!',
    subline: 'Otomasyon, konteyner ve güvenilir yayın seni motive ediyor.',
    body: 'Linux/shell, Docker, CI/CD ve bulut temelleriyle pipeline kurmayı hedefle.',
    nextSteps: ['Shell ve temel Linux', 'Dockerfile + compose', 'GitHub Actions ile CI'],
  },
  'urun-ux': {
    headline: 'Ürün ve UX düşüncesi öne çıkıyor!',
    subline: 'Kullanıcı problemi, keşif ve net teslim senin güçlü yanın.',
    body: 'Araştırma, prototip ve önceliklendirme çerçevelerini öğren; ölçümle iterasyon kültürünü benimse.',
    nextSteps: ['5 kullanıcıyla görüşme taslağı', 'Düşük sadakat prototip', 'Basit ürün metrikleri'],
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

// Burada answers ile ekstra mantık yazabilirsin
const nAnswers = Array.isArray(raw.answers) ? raw.answers.length : 0;

return [
  {
    json: {
      archetype,
      headline: template.headline,
      subline: template.subline,
      body: `${template.body}\n\n(n8n ile işlendi — ${nAnswers} cevap.)`,
      nextSteps: template.nextSteps,
    },
  },
];
