import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Compass, Map, Rocket, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getLlmBrandLabel } from '../lib/llmConfig.js';
import { getLandingAccordionSections } from '../lib/landingFeatureContent.js';

const SECTION_ICONS = {
  privacy: Shield,
  'feature-hizli-analiz': Rocket,
  'feature-yerel-firsatlar': Compass,
  'feature-ai-mentor': Sparkles,
};

export function LandingPage({
  onStart,
  onResume,
  onOpenInfo,
  onOpenRoadmaps,
  onOpenOrientation,
  resumeAvailable,
  resumeSummary,
}) {
  const brand = getLlmBrandLabel();
  const sections = useMemo(() => getLandingAccordionSections(brand), [brand]);
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-center px-1 pb-16 pt-14 text-center sm:px-2 lg:px-3 lg:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Badge>
          <Sparkles size={16} />
          <span>{brand} destekli · Üniversiteli kadınlar için teknoloji rehberi</span>
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 text-4xl font-extrabold leading-tight text-indigo-800 sm:text-5xl lg:text-6xl"
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
        className="mb-8 w-full max-w-none text-lg leading-relaxed text-slate-600"
      >
        <p>
          Fakülte ve bölümünü seçip çok boyutlu profili doldurursun — bölüm ilgileri, teknolojide seni çeken üç soru grubu,
          hedef ve tercihler; ardından rota ve öneriler oluşur. Aşağıdaki başlıklara tıklayarak gizlilik ve özellikleri
          okuyabilirsin.
        </p>
        {onOpenInfo && (
          <button
            type="button"
            onClick={() => onOpenInfo(null)}
            className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-900 hover:decoration-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
          >
            Tüm metni ayrı sayfada aç (gizlilik dahil)
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex w-full max-w-none flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center"
      >
        <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]" onClick={onStart}>
          Akışa başla — profil ve rota
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

      {(onOpenRoadmaps || onOpenOrientation) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="mt-5 flex w-full max-w-none flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          {onOpenRoadmaps && (
            <Button
              size="lg"
              variant="ghost"
              className="w-full border border-indigo-200/80 bg-white/90 shadow-sm ring-1 ring-indigo-100/80 sm:w-auto sm:min-w-[200px]"
              onClick={onOpenRoadmaps}
            >
              <Map className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden />
              Öğrenme yolları
            </Button>
          )}
          {onOpenOrientation && (
            <Button
              size="lg"
              variant="ghost"
              className="w-full border border-violet-200/80 bg-white/90 shadow-sm ring-1 ring-violet-100/80 sm:w-auto sm:min-w-[200px]"
              onClick={onOpenOrientation}
            >
              <Sparkles className="h-5 w-5 shrink-0 text-violet-600" aria-hidden />
              Yönelim testi — hangi alana yakınsın?
            </Button>
          )}
        </motion.div>
      )}

      {resumeAvailable && resumeSummary && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mx-auto mt-5 max-w-2xl text-center text-xs leading-snug text-slate-500"
        >
          <span className="font-semibold text-slate-600">Kayıtlı oturum:</span> {resumeSummary}
        </motion.p>
      )}

      <div className="mt-12 w-full max-w-none space-y-2 text-left" role="region" aria-label="Konular">
        <p className="mb-3 text-center text-sm font-semibold text-slate-600">Konu seç — açıklama aşağıda açılır</p>
        {sections.map((s, idx) => {
          const Icon = SECTION_ICONS[s.id] ?? Sparkles;
          const open = openId === s.id;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * idx }}
              className="overflow-hidden rounded-2xl border border-white/35 bg-white/45 shadow-sm backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-expanded={open}
                className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
              >
                <span className="mt-0.5 shrink-0 text-indigo-600" aria-hidden>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-indigo-950">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-slate-600">{s.shortDesc}</span>
                </span>
                <ChevronDown
                  className={['h-5 w-5 shrink-0 text-slate-500 transition-transform', open ? 'rotate-180' : ''].join(
                    ' ',
                  )}
                  aria-hidden
                />
              </button>
              {open && (
                <div className="border-t border-white/25 bg-white/35 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  {s.detail}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
