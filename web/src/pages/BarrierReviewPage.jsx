import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';

export function BarrierReviewPage({ result, onPreviousStep, onNext }) {
  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-4 pb-16 pt-10 text-left sm:px-6 lg:px-10">
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
          <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
            {typeof onPreviousStep === 'function' && (
              <Button type="button" variant="ghost" onClick={onPreviousStep} className={flowPreviousStepButtonClass}>
                <ArrowLeft className="h-5 w-5" aria-hidden />
                Önceki adım
              </Button>
            )}
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
