import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Loader2, Map } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { loadRoadmapsData } from '../lib/roadmapData.js';
import { getCompletedStepIds } from '../lib/roadmapProgress.js';
import { logEvent } from '../lib/analytics.js';

export function RoadmapHubPage({ onBack, onSelectTrack }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await loadRoadmapsData();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setErr(e?.message ?? 'Yüklenemedi');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('storage', bump);
    window.addEventListener('pusula-roadmap-progress', bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener('pusula-roadmap-progress', bump);
    };
  }, []);

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {typeof onBack === 'function' && (
            <Button type="button" variant="ghost" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" aria-hidden />
              Ana sayfa
            </Button>
          )}
        </div>
        <Card className="border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50">
          <div className="flex flex-wrap items-center gap-2 text-indigo-800">
            <Map className="h-7 w-7 shrink-0" aria-hidden />
            <h1 className="text-2xl font-extrabold tracking-tight text-indigo-950 sm:text-3xl">Dinamik öğrenme haritaları</h1>
          </div>
          <p className="mt-3 max-w-none text-sm leading-relaxed text-slate-600">
            Alan seç; adımları sırayla takip et. Her adımı tamamlayınca işaretle — ilerlemen bu cihazda saklanır.
          </p>
        </Card>

        {err && <p className="mt-6 text-sm text-red-600">{err}</p>}
        {!data && !err && (
          <div className="mt-10 flex items-center gap-2 text-slate-600">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            Haritalar yükleniyor…
          </div>
        )}

        {data && (
          <ul className="mt-8 grid list-none gap-4 sm:grid-cols-2">
            {data.tracks.map((t, idx) => {
              const n = t.steps?.length ?? 0;
              const done = getCompletedStepIds(t.id).length;
              const pct = n ? Math.round((done / n) * 100) : 0;
              return (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      logEvent('roadmap_track_open', { trackId: t.id });
                      onSelectTrack(t.id);
                    }}
                    className="flex w-full flex-col rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-left shadow-sm ring-1 ring-black/[0.04] transition hover:border-indigo-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <span className="text-lg font-extrabold text-indigo-950">{t.title}</span>
                    <span className="mt-1 text-sm text-slate-600">{t.summary}</span>
                    <span className="mt-3 text-xs font-semibold text-indigo-700">
                      {done}/{n} adım · %{pct}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                      Haritayı aç
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </main>
  );
}
