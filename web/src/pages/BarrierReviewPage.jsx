import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';
import { getLlmBrandLabel } from '../lib/llmConfig.js';

function ActionList({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
      {items.map((a, i) => (
        <li key={i}>{a}</li>
      ))}
    </ul>
  );
}

export function BarrierReviewPage({ result, onPreviousStep, onNext, onRetryLlm, retryBusy }) {
  const brand = getLlmBrandLabel();
  const isDual = Boolean(result?.matrix);
  const legacyFlat = result && !result.matrix && result.reframe;

  const llmBlock = result?.llm ?? (legacyFlat ? { reframe: result.reframe, actions: result.actions ?? [] } : null);
  const matrixBlock = result?.matrix;
  const llmError = result?.llmError;
  const skipped = result?.skippedLlm;

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Yeniden çerçeveleme</div>

          {isDual ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/90 to-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-indigo-950">{brand} önerisi</h2>
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                    Yapay zekâ
                  </span>
                </div>
                {skipped && (
                  <p className="mt-2 text-xs text-slate-600">
                    Bu adım atlandı; aşağıdaki metin genel yönlendirmedir. Kişiselleştirilmiş özet için engelini yazıp
                    tekrar deneyebilirsin.
                  </p>
                )}
                {llmError && (
                  <div className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 text-sm text-amber-900">
                    <p>
                      {brand} yanıtı alınamadı: {llmError}. Matris rehberi önerisini kullanabilir veya aşağıdan tekrar
                      deneyebilirsin.
                    </p>
                    {typeof onRetryLlm === 'function' && (
                      <Button
                        type="button"
                        size="lg"
                        variant="ghost"
                        disabled={retryBusy}
                        className="w-full border border-amber-300/90 bg-white/90 text-amber-950 hover:bg-white sm:w-auto"
                        onClick={() => onRetryLlm()}
                      >
                        {retryBusy ? (
                          <>
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                            Yeniden deneniyor…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-5 w-5 shrink-0" aria-hidden />
                            {brand} önerisini tekrar dene
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
                {llmBlock && !llmError && (
                  <>
                    <p className="mt-3 text-base leading-relaxed text-slate-700">{llmBlock.reframe}</p>
                    <div className="mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Somut aksiyonlar</h4>
                      <ActionList items={llmBlock.actions} />
                    </div>
                  </>
                )}
              </div>

              <div
                className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-sm backdrop-blur"
                role="region"
                aria-label="Matris rehberi önerisi"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-indigo-950">Matris rehberi önerisi</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                    Matris
                  </span>
                </div>
                {matrixBlock?.reframe && (
                  <p className="mt-3 text-base leading-relaxed text-slate-700">{matrixBlock.reframe}</p>
                )}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Somut aksiyonlar</h4>
                  <ActionList items={matrixBlock?.actions} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-indigo-900">Bakış açın</h2>
              <p className="text-base leading-relaxed text-slate-700">{llmBlock?.reframe ?? result?.reframe}</p>
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-800">Somut aksiyonlar</h3>
                <ActionList items={llmBlock?.actions ?? result?.actions} />
              </div>
            </>
          )}

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
