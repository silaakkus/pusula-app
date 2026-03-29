import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Download, Grid3x3, Home, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { OrientationCardCapture } from '../components/OrientationCardCapture.jsx';
import { downloadOrientationCardPng } from '../lib/downloadOrientationCard.js';
import { sanitizeOrientationBody } from '../lib/orientationQuiz.js';
import { fetchOrientationGroqSupplement } from '../lib/orientationGroqEnrich.js';
import { fetchOrientationMatrixHints } from '../lib/orientationMatrixHints.js';

function splitOrientationStepLine(s) {
  const m = s.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  if (!m) return { lead: s, detail: null };
  return { lead: m[1].trim(), detail: m[2].trim() };
}

const ARCHETYPE_LABELS = {
  frontend: 'Web arayüzü',
  backend: 'Sunucu ve veri tarafı',
  'veri-bilimi': 'Veri ve grafikler',
  'yapay-zeka': 'Yapay zekâ ve akıllı sistemler',
  devops: 'Yayın ve altyapı',
  'urun-ux': 'Ürün ve kullanıcı deneyimi',
};

export function OrientationResultPage({ result, onBack, onHome }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [groqExtra, setGroqExtra] = useState(null);
  const [groqBusy, setGroqBusy] = useState(false);
  const [groqError, setGroqError] = useState('');
  const [groqRetry, setGroqRetry] = useState(0);
  const [matrixHints, setMatrixHints] = useState(null);
  const [matrixBusy, setMatrixBusy] = useState(false);
  const [matrixError, setMatrixError] = useState('');
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const archetypeLabel = result?.archetype ? ARCHETYPE_LABELS[result.archetype] ?? result.archetype : '';
  const bodySafe = sanitizeOrientationBody(result?.body ?? '');

  useEffect(() => {
    if (!result?.archetype) {
      setMatrixHints(null);
      setMatrixBusy(false);
      setMatrixError('');
      return;
    }

    let cancelled = false;
    setMatrixHints(null);
    setMatrixBusy(true);
    setMatrixError('');

    (async () => {
      try {
        const hints = await fetchOrientationMatrixHints(result.archetype);
        if (!cancelled) setMatrixHints(hints.length > 0 ? hints : null);
      } catch (e) {
        if (!cancelled) {
          setMatrixHints(null);
          setMatrixError(e instanceof Error ? e.message : 'Matris önerileri yüklenemedi');
        }
      } finally {
        if (!cancelled) setMatrixBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [result?.archetype]);

  useEffect(() => {
    const key = import.meta.env.VITE_GROQ_API_KEY?.trim();
    if (!key || !result) {
      setGroqExtra(null);
      setGroqBusy(false);
      setGroqError('');
      return;
    }

    let cancelled = false;
    setGroqExtra(null);
    setGroqBusy(true);
    setGroqError('');

    (async () => {
      try {
        const data = await fetchOrientationGroqSupplement({
          archetype: result.archetype,
          archetypeLabel,
          headline: result.headline,
          subline: result.subline,
          body: bodySafe,
          nextSteps: result.nextSteps,
        });
        if (!cancelled) setGroqExtra(data);
      } catch (e) {
        if (!cancelled) {
          setGroqExtra(null);
          setGroqError(e instanceof Error ? e.message : 'Groq önerisi alınamadı');
        }
      } finally {
        if (!cancelled) setGroqBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [result, archetypeLabel, bodySafe, groqRetry]);

  const hasGroqKey = Boolean(import.meta.env.VITE_GROQ_API_KEY?.trim());

  const handlePng = useCallback(async () => {
    setBusy(true);
    try {
      await downloadOrientationCardPng(cardRef.current, 'pusula-yonelim-karti.png');
    } catch {
      alert('PNG oluşturulamadı. Sayfayı yenileyip tekrar dene.');
    } finally {
      setBusy(false);
    }
  }, []);

  if (!result) {
    return null;
  }

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          {typeof onBack === 'function' && (
            <Button type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
              Teste dön
            </Button>
          )}
        </div>

        <div
          className={[
            'mx-auto grid w-full max-w-xl grid-cols-1 gap-6 sm:max-w-2xl lg:max-w-6xl lg:items-start lg:gap-8',
            hasGroqKey ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
          ].join(' ')}
        >
          <Card className="w-full border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/40">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-6 w-6 shrink-0 text-violet-600" aria-hidden />
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">
                {result.source === 'remote' ? 'Güncellenmiş özet' : 'Yönelim özeti'}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-extrabold leading-snug text-indigo-950 sm:text-3xl">{result.headline}</h1>
            {result.subline && (
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700 sm:text-base">{result.subline}</p>
            )}
            {bodySafe && (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                {bodySafe.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            )}

            {Array.isArray(result.nextSteps) && result.nextSteps.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/50 bg-white/80 px-3 py-3 sm:px-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Önerilen sıradaki adımlar
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Her madde kısa bir başlık ve acemi diliyle açıklama içerir; istediğin sırayla ilerleyebilirsin.
                </p>
                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-slate-800 marker:font-bold">
                  {result.nextSteps.map((s, i) => {
                    const { lead, detail } = splitOrientationStepLine(String(s));
                    return (
                      <li key={i} className="pl-1">
                        <span className="font-semibold text-slate-900">{lead}</span>
                        {detail ? (
                          <span className="mt-0.5 block text-sm font-normal leading-relaxed text-slate-600">
                            {detail}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </Card>

          <Card className="w-full border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40">
            <div className="flex flex-wrap items-center gap-2">
              <Grid3x3 className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                Matris rehberi
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Pusula’daki üniversite disiplin matrisinden, seçtiğin yöne yakın rollerin kısa özeti. Profilde bölümünü
              seçtiğinde tam kişiselleştirilmiş sonuçlar da üretilir; burada genel bir köprü görürsün.
            </p>
            {matrixBusy ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" aria-hidden />
                Matris eşleştiriliyor…
              </div>
            ) : matrixError ? (
              <p className="mt-4 text-sm text-red-600">{matrixError}</p>
            ) : matrixHints && matrixHints.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {matrixHints.map((h) => (
                  <li key={h.roleId} className="rounded-xl border border-emerald-100/90 bg-white/75 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/90">{h.roleName}</p>
                    {h.whyFits[0] ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{h.whyFits[0]}</p>
                    ) : null}
                    {h.firstSteps.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-700">
                        {h.firstSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-2 text-[10px] leading-snug text-slate-500">Örnek disiplin: {h.disciplineName}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Bu yön için matristen öneri çıkarılamadı.</p>
            )}
          </Card>

          {hasGroqKey ? (
            <Card className="w-full border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50">
              <div className="flex flex-wrap items-center gap-2">
                <Bot className="h-6 w-6 shrink-0 text-indigo-600" aria-hidden />
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-900">
                  Groq ek önerisi
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Pusula özetiyle aynı teste dayanır; Groq tarafı tamamlayıcı bakış ve ipuçları üretir — ikisini birlikte düşünebilirsin.
              </p>
              {groqBusy ? (
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-600" aria-hidden />
                  Öneri hazırlanıyor…
                </div>
              ) : groqError ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-red-600">{groqError}</p>
                  <Button type="button" size="sm" variant="ghost" className="ring-1 ring-indigo-200" onClick={() => setGroqRetry((n) => n + 1)}>
                    Tekrar dene
                  </Button>
                </div>
              ) : groqExtra ? (
                <div className="mt-4 space-y-4">
                  {groqExtra.summary ? (
                    <div className="text-sm leading-relaxed text-slate-800 sm:text-[15px]">{groqExtra.summary}</div>
                  ) : null}
                  {Array.isArray(groqExtra.tips) && groqExtra.tips.length > 0 ? (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Hızlı ipuçları</h2>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                        {groqExtra.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Öneri oluşturulamadı.</p>
              )}
            </Card>
          ) : null}
        </div>

        <div className="mt-10">
          <p className="mb-3 text-center text-sm font-semibold text-slate-700">Kart önizleme — PNG indir</p>
          <div className="flex justify-center overflow-x-auto pb-4">
            <OrientationCardCapture
              ref={cardRef}
              headline={result.headline}
              subline={result.subline}
              archetypeLabel={archetypeLabel}
              nextSteps={result.nextSteps}
              dateLabel={dateLabel}
            />
          </div>
        </div>

        <div className="mt-8 flex max-w-xl flex-col gap-3 sm:mx-auto sm:max-w-2xl sm:flex-row sm:flex-wrap sm:justify-center">
          <Button size="lg" onClick={handlePng} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Hazırlanıyor…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" aria-hidden />
                PNG indir
              </>
            )}
          </Button>
          {typeof onHome === 'function' && (
            <Button size="lg" variant="ghost" onClick={onHome}>
              <Home className="h-5 w-5" aria-hidden />
              Ana sayfa
            </Button>
          )}
        </div>
      </motion.div>
    </main>
  );
}
