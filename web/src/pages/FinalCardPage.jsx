import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Home, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CareerCardCapture } from '../components/CareerCardCapture.jsx';
import { downloadCareerCardPng } from '../lib/downloadCareerCard.js';
import { logEvent } from '../lib/analytics.js';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';
import { InviteFriendCard } from '../components/InviteFriendCard.jsx';

export function FinalCardPage({
  profile,
  roles,
  baselineBefore,
  baselineAfter,
  onPreviousStep,
  onHome,
  onCardDownloaded,
}) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const delta = baselineAfter - baselineBefore;
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleDownload = useCallback(async () => {
    setBusy(true);
    try {
      await downloadCareerCardPng(cardRef.current, 'pusula-kariyer-rota-karti.png');
      onCardDownloaded?.();
    } catch (e) {
      alert('PNG oluşturulamadı. Sayfayı yenileyip tekrar dene.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }, [onCardDownloaded]);

  React.useEffect(() => {
    logEvent('delta_value', { before: baselineBefore, after: baselineAfter, delta });
  }, [baselineBefore, baselineAfter, delta]);

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-center px-4 pb-16 pt-10 text-center sm:px-6 lg:px-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card className="text-center">
          <h2 className="text-2xl font-extrabold text-indigo-900">Özgüven deltası (Δ)</h2>
          <p className="mt-2 text-sm text-slate-600">
            İlk skor: <span className="font-semibold">{baselineBefore}/5</span> · Son skor:{' '}
            <span className="font-semibold">{baselineAfter}/5</span>
          </p>
          <p className="mt-4 text-4xl font-black text-indigo-700">{delta >= 0 ? `+${delta}` : delta}</p>
          <p className="mt-2 text-xs text-slate-500">Δ = son − ilk (aynı 1–5 ölçeği)</p>
        </Card>

        <div className="mt-10 w-full">
          <p className="mb-4 text-sm font-semibold text-slate-700">Kariyer Rota Kartı — önizleme</p>
          <div className="flex justify-center overflow-x-auto pb-4">
            <CareerCardCapture
              ref={cardRef}
              profileLabel={profile?.disciplineLabel}
              roles={roles}
              delta={delta}
              dateLabel={dateLabel}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {typeof onPreviousStep === 'function' && (
            <Button type="button" variant="ghost" onClick={onPreviousStep} className={flowPreviousStepButtonClass}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
              Önceki adım
            </Button>
          )}
          <Button size="lg" onClick={handleDownload} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Hazırlanıyor…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                PNG indir
              </>
            )}
          </Button>
          <Button size="lg" variant="ghost" onClick={onHome}>
            <Home className="h-5 w-5" />
            Başa dön
          </Button>
        </div>

        <InviteFriendCard />
      </motion.div>
    </main>
  );
}
