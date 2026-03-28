import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { runBarrierReframe } from '../lib/gemini.js';
import { logEvent } from '../lib/analytics.js';
import { BARRIER_STATIC_FALLBACK } from '../lib/barrierFallback.js';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';

export function BarrierPage({ apiKey, profileSummary, onResult, onSkip, onPreviousStep }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setError('Lütfen en az birkaç kelimeyle engelini yaz veya “Atla” ile devam et.');
      return;
    }
    setError('');
    setLoading(true);
    logEvent('barrier_submit', { length: trimmed.length });
    try {
      const res = await runBarrierReframe({ apiKey, barrierText: trimmed, profileSummary });
      onResult(res);
    } catch {
      onResult(BARRIER_STATIC_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex max-w-3xl flex-col items-stretch px-6 pb-16 pt-10 text-left sm:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Engel kırıcı</div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-indigo-900">
            Seni durduran şey ne?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">
            Örneğin: “Bölümüm alakasız”, “Geç kaldım”, “Matematik zayıfım”, “Aile desteği konusunda emin değilim”…
            Yargılanmayacaksın; amaç metni yeniden çerçevelemek ve küçük aksiyonlar üretmek.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Buraya yaz…"
            disabled={loading}
            className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-60"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <Button variant="ghost" type="button" onClick={onSkip} disabled={loading}>
              Atla (sabit öneriyle devam)
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              {typeof onPreviousStep === 'function' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onPreviousStep}
                  disabled={loading}
                  className={flowPreviousStepButtonClass}
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                  Önceki adım
                </Button>
              )}
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Gönderiliyor…
                  </>
                ) : (
                  <>
                    Yeniden çerçevele
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
