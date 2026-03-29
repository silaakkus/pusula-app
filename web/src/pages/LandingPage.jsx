import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function LandingPage({ onStart, onResume, resumeAvailable, resumeSummary }) {
  const scrollToSection = (id) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        className="mb-12 w-full max-w-none text-lg leading-relaxed text-slate-600"
      >
        Akademik arka planını teknoloji dünyasının fırsatlarıyla birleştir. Gemini AI
        destekli analizimizle sana en uygun kariyer rotasını ve Türkiye'deki fırsatları
        keşfet.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button size="lg" onClick={onStart}>
          Rotanı Oluştur
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      {resumeAvailable && onResume && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 w-full max-w-3xl text-left"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white/70 p-4 text-sm text-slate-700 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Kaldığın yerden devam et
                </p>
                {resumeSummary && (
                  <p className="mt-1 text-xs text-slate-600">{resumeSummary}</p>
                )}
              </div>
              <Button size="sm" onClick={onResume}>
                Devam Et
              </Button>
            </div>
          </div>
        </motion.div>
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
            desc: 'Gemini ile sana özel öneriler.',
            targetId: 'feature-ai-mentor',
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.1 }}
            role="button"
            tabIndex={0}
            onClick={() => scrollToSection(item.targetId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') scrollToSection(item.targetId);
            }}
            className="cursor-pointer rounded-2xl border border-white/20 bg-white/50 p-6 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="mb-2 font-bold">{item.title}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <section
        id="feature-hizli-analiz"
        className="mt-20 w-full max-w-4xl text-left text-slate-700"
        aria-label="Hızlı Analiz nasıl çalışır?"
      >
        <h2 className="text-xl font-bold text-indigo-900">Hızlı Analiz nasıl çalışıyor?</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Pusula, bölümün, ilgi alanların ve güçlü yönlerin üzerinden geçerek senin için en uygun
          teknoloji rolleri ve alanlarını çıkartır. Sorular sade tutulur; 5 dakikadan kısa sürede
          doldurup ilk rota taslağını görebilirsin.
        </p>
      </section>

      <section
        id="feature-yerel-firsatlar"
        className="mt-14 w-full max-w-4xl text-left text-slate-700"
        aria-label="Yerel fırsatlar neleri kapsar?"
      >
        <h2 className="text-xl font-bold text-indigo-900">Yerel Fırsatlar neleri kapsıyor?</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Türkiye&apos;deki burs programları, bootcamp&apos;ler, topluluklar ve staj/iş fırsatları
          arasından profilinle eşleşenleri ön plana çıkarıyoruz. Henüz tüm kurumları kapsamasa da,
          özellikle teknolojiye girişte işine yarayacak kapıları bir arada görmeni sağlıyor.
        </p>
      </section>

      <section
        id="feature-ai-mentor"
        className="mt-14 w-full max-w-4xl text-left text-slate-700"
        aria-label="AI Mentor sana ne sunar?"
      >
        <h2 className="text-xl font-bold text-indigo-900">AI Mentor sana ne sunuyor?</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Gemini destekli AI mentor, seçilen kariyer rotalarına göre hangi becerileri geliştirmen,
          hangi kaynaklardan başlaman ve hangi adımları denemen gerektiği konusunda sana özel bir
          aksiyon listesi çıkarır. Böylece &quot;nereden başlamalıyım?&quot; sorusuna yalnız
          başına cevap aramak zorunda kalmazsın.
        </p>
      </section>
    </main>
  );
}

