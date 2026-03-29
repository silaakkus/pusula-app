import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Rocket, Shield, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getLandingAccordionSections } from '../lib/landingFeatureContent.js';

const SECTION_ICONS = {
  privacy: Shield,
  'feature-hizli-analiz': Rocket,
  'feature-yerel-firsatlar': Compass,
  'feature-ai-mentor': Sparkles,
};

/** Nasıl çalışır + veri gizliliği + özellik detayları (ana sayfadan ayrı ekran). */
export function LandingInfoPage({ onBack, initialSectionId, aiBrandLabel }) {
  const brand = aiBrandLabel || 'Yapay zeka';
  const sections = useMemo(() => getLandingAccordionSections(brand), [brand]);

  useEffect(() => {
    if (!initialSectionId || typeof document === 'undefined') return;
    const id = initialSectionId;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [initialSectionId]);

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col px-1 pb-20 pt-8 sm:px-2 lg:px-3">
      <article className="mx-auto w-full max-w-none text-left text-slate-700">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-xl font-extrabold tracking-tight text-indigo-900 sm:text-2xl"
        >
          Pusula nasıl çalışır?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-sm leading-relaxed sm:text-base"
        >
          Akademik arka planını teknoloji dünyasının fırsatlarıyla birleştir. Kariyer önerileri öncelikle{' '}
          <span className="font-semibold text-indigo-900">{brand}</span> yapay zeka altyapısıyla üretilir;
          sana en uygun rotayı ve Türkiye&apos;deki fırsatları birkaç dakikada keşfet.
        </motion.p>

        {sections.map((item, i) => {
          const Icon = SECTION_ICONS[item.id] ?? Sparkles;
          const isFirst = i === 0;
          return (
            <section
              key={item.id}
              id={item.id}
              className={
                isFirst
                  ? 'mt-8 scroll-mt-24'
                  : 'mt-10 scroll-mt-24 border-t border-slate-200/80 pt-10'
              }
              aria-labelledby={`info-${item.id}`}
            >
              <div className="mb-3 flex items-center gap-2 text-indigo-700">
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <h2 id={`info-${item.id}`} className="text-lg font-bold text-indigo-900">
                  {item.title}
                </h2>
              </div>
              <p className="text-sm leading-relaxed">{item.detail}</p>
            </section>
          );
        })}

        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="border border-slate-200/90 bg-white/90 shadow-sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
            Ana sayfaya dön
          </Button>
        </div>
      </article>
    </main>
  );
}
