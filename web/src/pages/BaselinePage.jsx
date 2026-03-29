import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';

export function BaselinePage({
  value,
  onChange,
  onPreviousStep,
  onNext,
}) {
  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 sm:px-2 lg:px-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">
            Baseline (Özgüven Ölçümü)
          </div>
          <h2 className="mb-2 text-xl font-extrabold tracking-tight text-indigo-900 sm:text-2xl">
            Şu an teknoloji sektöründe kendine yer bulma konusunda özgüvenin kaç?
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">
            1 en düşük, 5 en yüksek. Bu skor, ileride Δ (delta) hesabı için başlangıç noktamız olacak.
          </p>

          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = v <= value;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange(v)}
                  className="group rounded-2xl p-2 transition hover:bg-white/70"
                  aria-label={`Özgüven: ${v}`}
                >
                  <Star
                    className={[
                      'h-8 w-8 transition sm:h-9 sm:w-9',
                      active ? 'fill-pusula-coral text-pusula-coral' : 'text-slate-300',
                      'group-hover:scale-110',
                    ].join(' ')}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center text-sm font-semibold text-slate-700">
            Seçimin: <span className="text-indigo-700">{value}/5</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
            {typeof onPreviousStep === 'function' && (
              <Button
                type="button"
                variant="ghost"
                onClick={onPreviousStep}
                className={flowPreviousStepButtonClass}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden />
                Önceki adım
              </Button>
            )}
            <Button onClick={onNext}>
              Devam et
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}

