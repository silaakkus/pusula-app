import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { getLlmBrandLabel } from '../lib/llmConfig.js';

export function AnalyzingPage({ message = 'Profilin analiz ediliyor…' }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="relative mx-auto flex max-w-3xl flex-col items-stretch px-6 pb-16 pt-10 sm:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" aria-hidden />
          <h2 className="mt-6 text-xl font-extrabold text-indigo-900">{message}</h2>
          <p className="mt-3 text-sm text-slate-600">
            {getLlmBrandLabel()} “Kariyer Mentörü” rol önerilerini hazırlıyor; bu birkaç saniye sürebilir.
          </p>
          {seconds >= 20 && (
            <p className="mt-4 text-xs text-slate-500">
              Uzun sürdüyse ağ veya API kotası etkili olabilir. İstek zaman aşımında veya hata olursa otomatik
              olarak disiplin matrisinden öneriler gösterilir.
            </p>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
