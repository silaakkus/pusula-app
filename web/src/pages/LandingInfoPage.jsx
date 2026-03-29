import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Rocket, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

/** Nasıl çalışır + veri gizliliği + özellik detayları (ana sayfadan ayrı ekran). */
export function LandingInfoPage({ onBack, initialSectionId, aiBrandLabel }) {
  useEffect(() => {
    if (!initialSectionId || typeof document === 'undefined') return;
    const id = initialSectionId;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [initialSectionId]);

  const brand = aiBrandLabel || 'Yapay zeka';

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col px-3 pb-20 pt-8 sm:px-4 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="w-fit border border-slate-200/90 bg-white/90 shadow-sm"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
          Ana sayfaya dön
        </Button>
      </motion.div>

      <article className="mx-auto w-full max-w-3xl text-left text-slate-700">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-2xl font-extrabold tracking-tight text-indigo-900 sm:text-3xl"
        >
          Pusula nasıl çalışır?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-base leading-relaxed sm:text-lg"
        >
          Akademik arka planını teknoloji dünyasının fırsatlarıyla birleştir. Kariyer önerileri öncelikle{' '}
          <span className="font-semibold text-indigo-900">{brand}</span> yapay zeka altyapısıyla üretilir;
          sana en uygun rotayı ve Türkiye&apos;deki fırsatları birkaç dakikada keşfet.
        </motion.p>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-8 rounded-2xl border border-indigo-100/90 bg-white/70 p-5 shadow-sm backdrop-blur"
          aria-labelledby="privacy-heading"
        >
          <h2 id="privacy-heading" className="text-sm font-bold text-indigo-900">
            Veri gizliliği
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Yanıtlarının çoğu cihazında tutulur; analiz için seçilen sağlayıcıya (
            {brand}) yalnızca akışta verdiğin özet bilgiler gönderilir. Hesap açman gerekmez; sonuçları
            istersen indirip paylaşabilirsin. Tasarım gereği ham veriler sunucularımızda kalıcı profil
            olarak saklanmaz.
          </p>
        </motion.section>

        <section
          id="feature-hizli-analiz"
          className="mt-12 scroll-mt-24 border-t border-slate-200/80 pt-10"
          aria-labelledby="feat-fast"
        >
          <div className="mb-3 flex items-center gap-2 text-indigo-700">
            <Rocket className="h-5 w-5" aria-hidden />
            <h2 id="feat-fast" className="text-lg font-bold text-indigo-900">
              Hızlı Analiz
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Pusula, bölümün, ilgi alanların ve güçlü yönlerin üzerinden geçerek senin için en uygun
            teknoloji rolleri ve alanlarını çıkartır. Sorular sade tutulur; birkaç dakikada doldurup ilk
            rota taslağını görebilirsin.
          </p>
        </section>

        <section
          id="feature-yerel-firsatlar"
          className="mt-10 scroll-mt-24 border-t border-slate-200/80 pt-10"
          aria-labelledby="feat-local"
        >
          <div className="mb-3 flex items-center gap-2 text-indigo-700">
            <Compass className="h-5 w-5" aria-hidden />
            <h2 id="feat-local" className="text-lg font-bold text-indigo-900">
              Yerel Fırsatlar
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Türkiye&apos;deki burs programları, bootcamp&apos;ler, topluluklar ve staj/iş fırsatları
            arasından profilinle eşleşenleri ön plana çıkarıyoruz. Henüz tüm kurumları kapsamasa da,
            teknolojiye girişte işine yarayacak kapıları bir arada görmeni sağlıyor.
          </p>
        </section>

        <section
          id="feature-ai-mentor"
          className="mt-10 scroll-mt-24 border-t border-slate-200/80 pt-10 pb-4"
          aria-labelledby="feat-ai"
        >
          <div className="mb-3 flex items-center gap-2 text-indigo-700">
            <Sparkles className="h-5 w-5" aria-hidden />
            <h2 id="feat-ai" className="text-lg font-bold text-indigo-900">
              AI Mentor
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-slate-800">{brand}</span> destekli mentor, seçilen kariyer
            rotalarına göre hangi becerileri geliştirmen, hangi kaynaklardan başlaman ve hangi adımları
            denemen gerektiği konusunda sana özel bir aksiyon listesi çıkarır.
          </p>
        </section>

        <div className="mt-10 flex justify-center">
          <Button type="button" size="lg" onClick={onBack}>
            Ana sayfaya dön
          </Button>
        </div>
      </article>
    </main>
  );
}
