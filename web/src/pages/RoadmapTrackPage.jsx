import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Circle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getTrackById, loadRoadmapsData } from '../lib/roadmapData.js';
import {
  getCompletedStepIds,
  isStepDone,
  toggleStepDone,
  progressFraction,
} from '../lib/roadmapProgress.js';
import { logEvent } from '../lib/analytics.js';

function linkHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export function RoadmapTrackPage({ trackId, onBack }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [completed, setCompleted] = useState(() => getCompletedStepIds(trackId));

  const refresh = useCallback(() => {
    setCompleted([...getCompletedStepIds(trackId)]);
  }, [trackId]);

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
    refresh();
  }, [trackId, refresh]);

  const track = data ? getTrackById(data, trackId) : null;
  const steps = track?.steps ?? [];
  const total = steps.length;
  const pct = Math.round(progressFraction(trackId, total) * 100);

  const toggle = (stepId) => {
    const wasDone = isStepDone(trackId, stepId);
    toggleStepDone(trackId, stepId);
    refresh();
    logEvent('roadmap_step_toggle', { trackId, stepId, done: !wasDone });
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          {typeof onBack === 'function' && (
            <Button type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
              Tüm yollar
            </Button>
          )}
        </div>

        {!data && !err && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            Yükleniyor…
          </div>
        )}
        {err && <p className="text-sm text-red-600">{err}</p>}
        {track && (
          <>
            <Card className="mb-8 border-indigo-200/80">
              <h1 className="text-2xl font-extrabold text-indigo-950 sm:text-3xl">
                {track.emoji ? (
                  <span className="mr-1.5" aria-hidden>
                    {track.emoji}
                  </span>
                ) : null}
                {track.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{track.summary}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Terimleri ilk kez görüyorsan sorun değil; her adımda ne demek istediğini sade dille anlatmaya çalıştık. İstediğin
                adımı “Öğrenildi” ile işaretlemen tamamen sana kalmış — sadece kendi düzenini takip etmek için.
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                İlerleme: {completed.length}/{total} adım
              </p>
            </Card>

            <ol className="relative m-0 list-none space-y-0 pl-0">
              {steps.map((s, i) => {
                const done = isStepDone(trackId, s.id);
                const last = i === steps.length - 1;
                return (
                  <li key={s.id} className="relative flex gap-4 pb-10 sm:gap-5">
                    {!last && (
                      <span
                        className="absolute left-[18px] top-10 bottom-0 w-0.5 -translate-x-1/2 bg-indigo-200 sm:left-[22px]"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-10 flex shrink-0 flex-col items-center">
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm transition sm:h-11 sm:w-11',
                          done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-indigo-200 bg-white text-indigo-400 hover:border-indigo-400',
                        ].join(' ')}
                        aria-pressed={done}
                        aria-label={done ? 'Öğrenildi işaretini kaldır' : 'Öğrenildi olarak işaretle'}
                      >
                        {done ? <Check className="h-5 w-5" aria-hidden /> : <Circle className="h-5 w-5" aria-hidden />}
                      </button>
                    </div>
                    <Card className="min-w-0 flex-1 border-slate-200/90 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-lg font-extrabold text-indigo-950">
                          {i + 1}. {s.title}
                        </h2>
                        <Button
                          type="button"
                          size="sm"
                          variant={done ? 'ghost' : 'default'}
                          className="shrink-0"
                          onClick={() => toggle(s.id)}
                        >
                          {done ? 'İşareti kaldır' : 'Öğrenildi'}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.detail}</p>
                      {Array.isArray(s.links) && s.links.length > 0 && (
                        <>
                          <p className="mt-3 text-xs leading-relaxed text-slate-600">
                            Her bağlantının altında, o sitede hangi tür içeriklere / modüllere denk geleceğini kısaca yazdık.
                            Çoğu kaynak ücretsizdir; giriş bölümleriyle başlayıp kendi hızında derinleşmen yeterli — hepsini
                            bir seferde bitirmek zorunda değilsin.
                          </p>
                          <ul className="mt-3 list-none space-y-3 p-0">
                            {s.links.map((l, j) => {
                              const host = linkHostname(l.url);
                              const label = l.label || 'Bağlantı';
                              const about = typeof l.about === 'string' ? l.about.trim() : '';
                              return l?.url ? (
                                <li key={j} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                                  <a
                                    href={l.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={
                                      host
                                        ? `${label} — ${host} sitesinde açılır; sayfadaki modülleri kendi hızında inceleyebilirsin.`
                                        : undefined
                                    }
                                    className="inline-flex max-w-full items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200/80 hover:bg-indigo-100"
                                  >
                                    <span className="min-w-0 truncate">{label}</span>
                                    {host ? (
                                      <span className="hidden font-normal text-[10px] text-indigo-600/90 sm:inline">
                                        ({host})
                                      </span>
                                    ) : null}
                                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                                  </a>
                                  {about ? (
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{about}</p>
                                  ) : null}
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ol>
          </>
        )}
        {data && !track && !err && <p className="text-sm text-slate-600">Bu öğrenme yolu bulunamadı.</p>}
      </motion.div>
    </main>
  );
}
