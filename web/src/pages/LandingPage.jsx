import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Layers,
  Rocket,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const FEATURE_KEYS = {
  fast: 'fast',
  local: 'local',
  ai: 'ai',
};

const FEATURE_BLOCKS = [
  {
    id: FEATURE_KEYS.fast,
    icon: Rocket,
    iconClass: 'text-orange-500',
    title: 'Hızlı Analiz',
    desc: '5 dakikada kariyer rotanı belirle.',
    accent: 'from-orange-500/10 to-transparent',
  },
  {
    id: FEATURE_KEYS.local,
    icon: Compass,
    iconClass: 'text-purple-500',
    title: 'Yerel Fırsatlar',
    desc: "Türkiye'deki burs ve eğitim radarı.",
    accent: 'from-purple-500/10 to-transparent',
  },
  {
    id: FEATURE_KEYS.ai,
    icon: Sparkles,
    iconClass: 'text-indigo-500',
    title: 'AI Mentor',
    desc: '', // kart metni aşağıda cardDesc ile (Groq vurgusu)
    accent: 'from-indigo-500/10 to-transparent',
  },
];

const FEATURE_DETAIL_COPY = {
  [FEATURE_KEYS.fast]: {
    title: 'Hızlı Analiz',
    intro:
      'Kısa profil soruları ve ön özgüven ölçümüyle dakikalar içinde yola çıkmanı sağlar; uzun formlarla vakit kaybetmezsin.',
    points: [
      'Çok boyutlu profil: disiplin, ilgi, güçlü yön, öğrenme stili ve hedef tek akışta.',
      'Ön ve son anket ile özgüven deltası (Δ) hesabı — ilerlemen görünür olsun.',
      'Analiz bittiğinde üç rol önerisi ve her rol için ilk adımlar hazır.',
      'API erişilemezse disiplin matrisiyle yine de anlamlı öneriler gösterilir.',
    ],
  },
  [FEATURE_KEYS.local]: {
    title: 'Yerel Fırsatlar',
    intro:
      'Önerilen rollerine göre Türkiye’deki program, topluluk, kurs ve burs kaynaklarını tek ekranda toplar; linklerle doğrudan başvuru sayfalarına gidebilirsin.',
    points: [
      'UP School, SistersLab, Kodluyoruz, Patika.dev, Women Techmakers, YGA gibi kaynaklar veri dosyasında güncellenir.',
      'İstersen şehrine göre önceliklendirme: çevrim içi ve Türkiye geneli fırsatlar her zaman listede kalır.',
      'Her rol için en az üç eşleşen fırsat; etiketler (data, ux, pm…) ile akıllı eşleştirme.',
      'Tıklamalar yalnızca tarayıcından ilgili siteye gider; hesap zorunluluğu yoktur.',
    ],
  },
};

function getAiMentorDetailCopy() {
  return {
    title: 'AI Mentor',
    intro:
      'Pusula’da kariyer önerileri öncelikle Groq’un hızlı yapay zeka altyapısı üzerinden üretilir. “Pusula kariyer rehberi” tonunda, yargılamayan ve Türkçe bir dil kullanılır; cevaplar düzenli kartlar halinde sunulur. Amacımız sana hazır şablon değil, senin profiline yakın üç yön ve ilk adımlar göstermek.',
    points: [
      'Groq sayesinde analiz genelde çok kısa sürede tamamlanır; birkaç sorunun ardından rotana dair somut bir çıktı alırsın.',
      'Sana üç rol önerilir: her birinde rol adı, neden sana uygun olabileceği, kısa etiketler ve başlayabileceğin kaynak fikirleri yer alır.',
      'Sonuç ekranında Groq metninden ayrı alanlarda, hazır matristen gelen işveren linkleri, stajlar, günün akışı ve maaş bantları gibi sabit rehber bilgileri de görürsün.',
      'Engel kırıcı adımında yazdığın düşünceyi yeniden çerçeveleyip, atabileceğin iki küçük ve net aksiyon önerilir.',
      'Bağlantı veya kota gibi olağan dışı durumlarda yine de disiplin matrisi önerileriyle yola devam edebilirsin.',
    ],
  };
}

export function LandingPage({ onStart, onResume, resumeAvailable, resumeSummary }) {
  const [detailId, setDetailId] = useState(null);

  const activeDetail =
    detailId === FEATURE_KEYS.ai
      ? getAiMentorDetailCopy()
      : detailId
        ? FEATURE_DETAIL_COPY[detailId]
        : null;

  if (activeDetail) {
    const detail = activeDetail;
    return (
      <main className="relative mx-auto flex min-h-[70vh] w-full max-w-full flex-col items-center px-6 pb-20 pt-10 sm:px-8">
        <div className="w-full max-w-3xl text-left">
          <Button
            variant="ghost"
            className="mb-8 rounded-xl px-3 py-2 text-sm"
            onClick={() => setDetailId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Ana sayfaya dön
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">{detail.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{detail.intro}</p>
          <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-indigo-700">
            Öne çıkan özellikler
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {detail.points.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={onStart}>
              Rotanı oluştur
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto" onClick={() => setDetailId(null)}>
              Özetlere geri dön
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex w-full max-w-full flex-col items-center px-6 pb-12 pt-16 text-center sm:px-8 lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Badge>
          <Sparkles size={16} />
          <span>Groq destekli · Üniversiteli kadınlar için teknoloji rehberi</span>
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 text-5xl font-extrabold leading-tight text-indigo-800 lg:text-7xl"
      >
        <span className="text-indigo-800">Bölümün Ne Olursa Olsun,</span> <br />
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
          Geleceğin Teknolojide.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-600"
      >
        Akademik arka planını teknoloji dünyasının fırsatlarıyla birleştir. Kariyer önerileri
        öncelikle <span className="font-semibold text-slate-800">Groq</span> yapay zeka altyapısıyla
        üretilir; sana en uygun rotayı ve Türkiye&apos;deki fırsatları birkaç dakikada keşfet.
      </motion.p>

      <p className="mb-8 max-w-xl text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-600">Veri gizliliği:</span> Cevapların önemli kısmı
        tarayıcında işlenir; analiz için metnin Groq (veya teknik bir kesinti halinde yedek bir yapay
        zeka hizmeti) ile paylaşılabileceğini bil. Bu veri aktarımı ilgili sağlayıcıların
        politikalarına tabidir. Pusula’da hesap açman gerekmez; istersen sonuç ekranından çıktını
        indirebilirsin.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" onClick={onStart}>
            Rotanı Oluştur
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
        {resumeAvailable && typeof onResume === 'function' && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" variant="ghost" onClick={onResume}>
              <RotateCcw className="h-5 w-5" />
              Kaldığın yerden devam et
            </Button>
          </motion.div>
        )}
      </motion.div>
      {resumeAvailable && resumeSummary && (
        <p className="mt-3 max-w-md text-center text-xs text-slate-500">
          Kayıtlı oturum: <span className="font-medium text-slate-700">{resumeSummary}</span>
        </p>
      )}

      {/* Özet kartlar — kompakt, ortalanmış sütunlar */}
      <div
        className="relative z-[5] mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 justify-items-center gap-4 md:mt-20 md:grid-cols-3 md:justify-items-stretch md:gap-3"
        style={{ isolation: 'isolate' }}
      >
        {FEATURE_BLOCKS.map((item) => {
          const Icon = item.icon;
          const cardDesc =
            item.id === FEATURE_KEYS.ai
              ? 'Öncelikle Groq ile kişisel öneriler; yanında hazır matris verisi.'
              : item.desc;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDetailId(item.id)}
              className={[
                'group w-full max-w-[17rem] rounded-xl border border-slate-200/80 bg-white/90 p-4 text-left shadow-sm ring-1 ring-black/[0.03]',
                'transition hover:border-indigo-200 hover:shadow-md hover:ring-indigo-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
                'justify-self-center md:max-w-none md:justify-self-stretch',
              ].join(' ')}
            >
              <div
                className={[
                  'mb-3 inline-flex rounded-lg bg-gradient-to-br p-2',
                  item.accent,
                  'ring-1 ring-black/5',
                ].join(' ')}
              >
                <Icon className={`h-6 w-6 ${item.iconClass}`} aria-hidden />
              </div>
              <h3 className="mb-1.5 text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{cardDesc}</p>
              <span className="mt-3 inline-block text-[11px] font-semibold text-indigo-600 group-hover:underline">
                Detayları gör →
              </span>
            </button>
          );
        })}
      </div>

      <section
        className="relative z-[5] mx-auto mt-8 w-full max-w-4xl rounded-xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/90 to-white/80 px-4 py-4 text-left shadow-sm ring-1 ring-indigo-100/80 sm:px-5 sm:py-5"
        aria-labelledby="landing-matrix-heading"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-indigo-100"
            aria-hidden
          >
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="landing-matrix-heading" className="text-sm font-bold text-indigo-950 sm:text-base">
              Hazır veri rehberi (matris)
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Groq’tan gelen kişisel önerilere ek olarak, Pusula’da ekibin hazırladığı{' '}
              <span className="font-medium text-slate-800">sabit veri katmanı</span> da vardır. Rotanı
              oluşturduğunda bu bilgiler yapay zeka çıktısından ayrı alanlarda ve kartlarda görünür:
              disiplin–rol eşleştirmesi, örnek işveren ve staj bağlantıları, günün akışı ve maaş
              bantları gibi alanlar bu rehberden gelir. Bağlantı veya kota sorununda bile matris
              önerileriyle yola devam edebilirsin.
            </p>
            <ul className="mt-3 grid gap-1.5 text-[11px] leading-snug text-slate-600 sm:grid-cols-2 sm:text-xs">
              <li className="flex gap-2">
                <span className="text-indigo-500" aria-hidden>
                  ·
                </span>
                <span>Disiplin matrisi ve rol etiketleri (veri dosyasından)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500" aria-hidden>
                  ·
                </span>
                <span>Türkiye fırsat listesi ve şehir filtresi</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500" aria-hidden>
                  ·
                </span>
                <span>İşveren / staj linkleri ve yerel program özetleri</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500" aria-hidden>
                  ·
                </span>
                <span>API yanıtı gelmezse otomatik matris yedeği</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
