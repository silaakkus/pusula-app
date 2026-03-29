import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';

export function PostSurveyPage({ baselineBefore, value, onChange, onPreviousStep, onNext }) {
  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Son ölçüm (Özgüven Deltası)</div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-indigo-900">
            Şimdi tekrar düşün: teknoloji sektöründe kendine yer bulma konusunda özgüvenin kaç?
          </h2>
          <p className="mb-2 text-sm leading-relaxed text-slate-600">
            1 en düşük, 5 en yüksek. Başlangıç skorun:{' '}
            <span className="font-semibold text-indigo-700">{baselineBefore}/5</span>. Δ (delta) = son − ilk olarak
            hesaplanacak.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
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
                      'h-9 w-9 transition',
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
              <Button type="button" variant="ghost" onClick={onPreviousStep} className={flowPreviousStepButtonClass}>
                <ArrowLeft className="h-5 w-5" aria-hidden />
                Önceki adım
              </Button>
            )}
            <Button onClick={onNext}>
              Kariyer kartına geç
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
