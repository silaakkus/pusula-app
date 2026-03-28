import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function BarrierReviewPage({ result, onNext }) {
  return (
    <main className="relative mx-auto flex max-w-3xl flex-col items-stretch px-6 pb-16 pt-10 text-left sm:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Yeniden çerçeveleme</div>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-indigo-900">Bakış açın</h2>
          <p className="text-base leading-relaxed text-slate-700">{result?.reframe}</p>
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-800">Somut aksiyonlar</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
              {(result?.actions ?? []).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex justify-end">
            <Button onClick={onNext}>
              Son ölçüme geç
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
