import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Home, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { OrientationCardCapture } from '../components/OrientationCardCapture.jsx';
import { downloadOrientationCardPng } from '../lib/downloadOrientationCard.js';
import { sanitizeOrientationBody } from '../lib/orientationQuiz.js';

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
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const archetypeLabel = result?.archetype ? ARCHETYPE_LABELS[result.archetype] ?? result.archetype : '';
  const bodySafe = sanitizeOrientationBody(result?.body ?? '');

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

        <Card className="mx-auto w-full max-w-xl border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/40 sm:max-w-2xl">
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
