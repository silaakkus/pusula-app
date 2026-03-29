import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function LandingPage({ onStart }) {
  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-center px-4 pb-12 pt-16 text-center sm:px-6 lg:px-10 lg:pt-24">
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

      <div className="mt-24 grid w-full max-w-none grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            icon: <Rocket className="text-orange-500" />,
            title: 'Hızlı Analiz',
            desc: '5 dakikada kariyer rotanı belirle.',
          },
          {
            icon: <Compass className="text-purple-500" />,
            title: 'Yerel Fırsatlar',
            desc: "Türkiye'deki burs ve eğitim radarı.",
          },
          {
            icon: <Sparkles className="text-indigo-500" />,
            title: 'AI Mentor',
            desc: 'Gemini ile sana özel öneriler.',
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.1 }}
            className="rounded-2xl border border-white/20 bg-white/50 p-6 text-left backdrop-blur-sm transition-all hover:shadow-lg"
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

