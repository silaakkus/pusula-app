import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AnalyzingPage({ message = 'Profilin analiz ediliyor…' }) {
  return (
    <main className="relative mx-auto flex max-w-3xl flex-col items-stretch px-6 pb-16 pt-10 sm:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" aria-hidden />
          <h2 className="mt-6 text-xl font-extrabold text-indigo-900">{message}</h2>
          <p className="mt-3 text-sm text-slate-600">
            Gemini “Kariyer Mentörü” rol önerilerini hazırlıyor; bu birkaç saniye sürebilir.
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
