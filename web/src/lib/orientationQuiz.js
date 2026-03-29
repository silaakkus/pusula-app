/** Yerel skor + isteğe bağlı n8n “Respond to Webhook” yanıtı */

const ARCHETYPES = ['frontend', 'backend', 'veri-bilimi', 'yapay-zeka', 'devops', 'urun-ux'];

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

/** @type {{ id: string, text: string, options: { id: string, text: string, scores: Record<string, number> }[] }[]} */
export const ORIENTATION_QUESTIONS = [
  {
    id: 'q1',
    text: 'Boş zamanında hangi tür problem çözmek daha çekici?',
    options: [
      { id: 'q1a', text: 'Görsel düzen ve kullanıcı akışı', scores: { frontend: 3, 'urun-ux': 2 } },
      { id: 'q1b', text: 'Sunucu, API ve performans', scores: { backend: 3, devops: 1 } },
      { id: 'q1c', text: 'Veri seti ve grafikler', scores: { 'veri-bilimi': 3 } },
      { id: 'q1d', text: 'Yeni model / deney ve makaleler', scores: { 'yapay-zeka': 3 } },
    ],
  },
  {
    id: 'q2',
    text: 'İlk ciddi öğrenme hedefin hangisine daha yakın?',
    options: [
      { id: 'q2a', text: 'Web arayüzü (React/Vue benzeri)', scores: { frontend: 3 } },
      { id: 'q2b', text: 'Servis ve veritabanı katmanı', scores: { backend: 3 } },
      { id: 'q2c', text: 'SQL + Python analitik', scores: { 'veri-bilimi': 3 } },
      { id: 'q2d', text: 'Model eğitimi veya LLM uygulaması', scores: { 'yapay-zeka': 3 } },
    ],
  },
  {
    id: 'q3',
    text: 'Hangi okuma seni daha çok içine çeker?',
    options: [
      { id: 'q3a', text: 'Tasarım sistemleri ve mikro etkileşim', scores: { frontend: 2, 'urun-ux': 2 } },
      { id: 'q3b', text: 'Sistem mimarisi ve ölçeklenebilirlik', scores: { backend: 2, devops: 2 } },
      { id: 'q3c', text: 'İstatistik ve A/B sonuçları', scores: { 'veri-bilimi': 3 } },
      { id: 'q3d', text: 'Paper / yeni mimari (transformer vb.)', scores: { 'yapay-zeka': 3 } },
    ],
  },
  {
    id: 'q4',
    text: 'Takımda hayalindeki günlük iş daha çok hangisi?',
    options: [
      { id: 'q4a', text: 'Ekranları ve bileşenleri iyileştirmek', scores: { frontend: 3 } },
      { id: 'q4b', text: 'Çekirdek servisleri ve entegrasyonları yazmak', scores: { backend: 3 } },
      { id: 'q4c', text: 'Dashboard ve metrikler', scores: { 'veri-bilimi': 2, 'urun-ux': 1 } },
      { id: 'q4d', text: 'Deneysel prototip ve model', scores: { 'yapay-zeka': 3 } },
    ],
  },
  {
    id: 'q5',
    text: 'Hangi cümle sana daha çok hitap ediyor?',
    options: [
      { id: 'q5a', text: '“Kullanıcı akışını sadeleştirelim.”', scores: { 'urun-ux': 3, frontend: 1 } },
      { id: 'q5b', text: '“Sistem ayakta ve ölçülebilir olsun.”', scores: { backend: 2, devops: 2 } },
      { id: 'q5c', text: '“Veriden net bir hikâye çıkaralım.”', scores: { 'veri-bilimi': 3 } },
      { id: 'q5d', text: '“Şunu yeni teknikle deneyelim.”', scores: { 'yapay-zeka': 2, devops: 1 } },
    ],
  },
  {
    id: 'q6',
    text: 'Stres anında hangi görev daha “rahatlatıcı” gelir?',
    options: [
      { id: 'q6a', text: 'Piksel ve tutarlılık düzeltmek', scores: { frontend: 2 } },
      { id: 'q6b', text: 'Bug izlemek ve kök neden bulmak', scores: { backend: 2 } },
      { id: 'q6c', text: 'Grafik ve outlier keşfi', scores: { 'veri-bilimi': 2 } },
      { id: 'q6d', text: 'Pipeline / deploy düzeltmek', scores: { devops: 3 } },
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
    source: 'n8n',
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
    /* n8n yok veya CORS — yerel sonuç */
  }
  return local;
}
