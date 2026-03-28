import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Rocket, ArrowRight, Sparkles, RotateCcw, ArrowLeft } from 'lucide-react';
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
    desc: 'Gemini ile sana özel öneriler.',
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
  [FEATURE_KEYS.ai]: {
    title: 'AI Mentor',
    intro:
      'Google Gemini ile “Pusula kariyer rehberi” tonunda, yargılamayan Türkçe çıktılar üretir; JSON yapısı sayesinde ekranda düzenli kartlar görürsün.',
    points: [
      'Tam üç rol: başlık, neden uygun, etiketler ve başlangıç kaynakları.',
      'Engel kırıcı: yazdığın cümleyi yeniden çerçeveleyip 2 somut aksiyon önerir.',
      'Oturum verilerin (cevaplar + roller) tarayıcıda saklanabilir; engel aşamasında bağlam olarak kullanılır.',
      'API kotası veya ağ hatasında otomatik model sırası veya matris yedeği devreye girer.',
    ],
  },
};

export function LandingPage({ onStart, onResume, resumeAvailable, resumeSummary }) {
  const [detailId, setDetailId] = useState(null);

  if (detailId && FEATURE_DETAIL_COPY[detailId]) {
    const detail = FEATURE_DETAIL_COPY[detailId];
    return (
      <main className="relative mx-auto min-h-[70vh] max-w-3xl px-6 pb-20 pt-10 text-left sm:px-8">
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
        <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-indigo-700">Öne çıkan özellikler</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          {detail.points.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button size="lg" onClick={onStart}>
            Rotanı oluştur
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setDetailId(null)}>
            Özetlere geri dön
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex max-w-7xl flex-col items-center px-8 pb-12 pt-16 text-center lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Badge>
          <Sparkles size={16} />
          <span>Üniversiteli Kadınlar İçin Teknoloji Rehberi</span>
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
        Akademik arka planını teknoloji dünyasının fırsatlarıyla birleştir. Gemini AI
        destekli analizimizle sana en uygun kariyer rotasını ve Türkiye'deki fırsatları
        keşfet.
      </motion.p>

      <p className="mb-8 max-w-xl text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-600">Veri gizliliği:</span> Cevapların tarayıcında
        işlenir; analiz için Gemini API’sine gönderilen metin, sağlayıcı politikalarına tabidir.
        Hesap açman gerekmez; istersen sonuç ekranından çıktını indirebilirsin.
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

      {/* Özet kartlar: backdrop-blur kaldırıldı (ilk boyamada kaybolma); opacity animasyonu yok */}
      <div
        className="relative z-[5] mt-24 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
        style={{ isolation: 'isolate' }}
      >
        {FEATURE_BLOCKS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDetailId(item.id)}
              className={[
                'group rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-left shadow-sm ring-1 ring-black/[0.03]',
                'transition hover:border-indigo-200 hover:shadow-md hover:ring-indigo-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
              ].join(' ')}
            >
              <div
                className={[
                  'mb-4 inline-flex rounded-xl bg-gradient-to-br p-3',
                  item.accent,
                  'ring-1 ring-black/5',
                ].join(' ')}
              >
                <Icon className={`h-8 w-8 ${item.iconClass}`} aria-hidden />
              </div>
              <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              <span className="mt-4 inline-block text-xs font-semibold text-indigo-600 group-hover:underline">
                Detayları gör →
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
