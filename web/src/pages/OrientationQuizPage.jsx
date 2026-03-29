import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ORIENTATION_QUESTIONS, resolveOrientationResult } from '../lib/orientationQuiz.js';
import { logEvent } from '../lib/analytics.js';

export function OrientationQuizPage({ onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const q = ORIENTATION_QUESTIONS[index];
  const total = ORIENTATION_QUESTIONS.length;

  const pick = async (optionId) => {
    if (!q || busy) return;
    const nextAnswers = [...answers.filter((a) => a.questionId !== q.id), { questionId: q.id, optionId }];
    setAnswers(nextAnswers);
    setErr('');

    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }

    setBusy(true);
    logEvent('orientation_quiz_complete', { n: nextAnswers.length });
    try {
      const result = await resolveOrientationResult(nextAnswers);
      onComplete?.(result);
    } catch (e) {
      setErr(e?.message ?? 'Sonuç hesaplanamadı');
    } finally {
      setBusy(false);
    }
  };

  const goPrev = () => {
    if (busy) return;
    if (index <= 0) onBack?.();
    else {
      setIndex((i) => i - 1);
      setErr('');
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={goPrev} disabled={busy}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
            {index === 0 ? 'Ana sayfa' : 'Önceki soru'}
          </Button>
          <span className="text-xs font-semibold text-slate-500">
            Soru {Math.min(index + 1, total)} / {total}
          </span>
        </div>

        <Card>
          <h1 className="text-xl font-extrabold text-indigo-950 sm:text-2xl">
            <span aria-hidden>✨ </span>Hangi alana daha çok yakınsın?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Altı kısa soru: teknoloji dünyasında farklı “roller” ve yönler var (ekranı yapmak, arka planı kurmak, veriyle uğraşmak gibi).
            Bu testte <strong className="font-semibold text-slate-700">doğru veya yanlış cevap yok</strong> — içgüdüyle seç.
            Her seçeneğin altındaki açıklama tamamen şunu anlatır: “bu ne demek?” Cevapların yalnızca sana özet bir yön önerisi üretir.
          </p>

          {q && (
            <div className="mt-8">
              <p className="text-base font-bold leading-snug text-slate-900">
                {q.emoji ? (
                  <>
                    <span className="mr-1.5" aria-hidden>
                      {q.emoji}
                    </span>
                  </>
                ) : null}
                {q.text}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {q.options.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => pick(o.id)}
                      className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 ring-1 ring-black/[0.04] transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-60"
                    >
                      {o.emoji ? (
                        <span className="mt-0.5 shrink-0 text-lg leading-none" aria-hidden>
                          {o.emoji}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block">{o.text}</span>
                      {o.help ? (
                        <span className="mt-1.5 block text-xs font-normal leading-snug text-slate-600">
                          {o.help}
                        </span>
                      ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {busy && (
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Sonuç hazırlanıyor…
            </p>
          )}
          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        </Card>
      </motion.div>
    </main>
  );
}
