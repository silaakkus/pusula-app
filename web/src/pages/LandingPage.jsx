import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Rocket, RotateCcw, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getLlmBrandLabel } from '../lib/llmConfig.js';

export function LandingPage({ onStart, onResume, onOpenInfo, resumeAvailable, resumeSummary }) {
  const brand = getLlmBrandLabel();

  const openInfo = (sectionId) => {
    if (onOpenInfo) onOpenInfo(sectionId);
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-center px-3 pb-16 pt-16 text-center sm:px-4 lg:px-6 lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Badge>
          <Sparkles size={16} />
          <span>
            {brand} destekli · Üniversiteli kadınlar için teknoloji rehberi
          </span>
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-10 w-full max-w-2xl text-lg leading-relaxed text-slate-600"
      >
        <p>
          Akademik arka planını teknoloji fırsatlarıyla birleştir; birkaç dakikada rota ve yerel fırsatlara
          göz at.
        </p>
        <button
          type="button"
          onClick={() => openInfo(null)}
          className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-900 hover:decoration-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
        >
          Detaylı bilgi ve veri gizliliği
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:max-w-2xl sm:flex-row sm:items-center sm:justify-center"
      >
        <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]" onClick={onStart}>
          Rotanı Oluştur
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Button>
        {resumeAvailable && onResume && (
          <Button
            size="lg"
            variant="ghost"
            className="w-full border border-slate-900/10 bg-white/95 shadow-sm ring-1 ring-black/[0.06] sm:w-auto sm:min-w-[220px]"
            onClick={onResume}
          >
            <RotateCcw className="h-5 w-5 shrink-0" aria-hidden />
            Kaldığın yerden devam et
          </Button>
        )}
      </motion.div>

      {resumeAvailable && resumeSummary && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-5 max-w-xl text-center text-xs text-slate-500"
        >
          Kayıtlı oturum: {resumeSummary}
        </motion.p>
      )}

      <div className="mt-20 grid w-full max-w-none grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            icon: <Rocket className="text-orange-500" />,
            title: 'Hızlı Analiz',
            desc: '5 dakikada kariyer rotanı belirle.',
            targetId: 'feature-hizli-analiz',
          },
          {
            icon: <Compass className="text-purple-500" />,
            title: 'Yerel Fırsatlar',
            desc: "Türkiye'deki burs ve eğitim radarı.",
            targetId: 'feature-yerel-firsatlar',
          },
          {
            icon: <Sparkles className="text-indigo-500" />,
            title: 'AI Mentor',
            desc: `${brand} ile sana özel öneriler.`,
            targetId: 'feature-ai-mentor',
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 + idx * 0.08 }}
            role="button"
            tabIndex={0}
            onClick={() => openInfo(item.targetId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openInfo(item.targetId);
            }}
            className="cursor-pointer rounded-2xl border border-white/20 bg-white/50 p-6 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="mb-2 font-bold">{item.title}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
