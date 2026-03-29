import React, { useCallback, useEffect, useId, useState } from 'react';
import { Award } from 'lucide-react';
import { BADGE_META, getPusulaBadges } from '../lib/pusulaBadges.js';

export function PusulaBadgesStrip({ className = '' }) {
  const panelId = useId();
  const [unlocked, setUnlocked] = useState(() => new Set(getPusulaBadges()));
  const [openId, setOpenId] = useState(null);

  const refresh = useCallback(() => {
    setUnlocked(new Set(getPusulaBadges()));
  }, []);

  useEffect(() => {
    const onUpd = () => refresh();
    window.addEventListener('pusula-badges-updated', onUpd);
    return () => window.removeEventListener('pusula-badges-updated', onUpd);
  }, [refresh]);

  const openMeta = openId ? BADGE_META.find((b) => b.id === openId) : null;

  return (
    <div className={['relative z-20 w-full min-w-0 text-left', className].join(' ')}>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs md:text-sm">
          <Award className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" aria-hidden />
          Rozetler
        </div>
        <div className="flex w-full min-w-0 flex-wrap content-start items-start justify-start gap-2 sm:max-w-none sm:justify-end">
          {BADGE_META.map((b) => {
            const on = unlocked.has(b.id);
            const expanded = openId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpenId((cur) => (cur === b.id ? null : b.id))}
                aria-expanded={expanded}
                aria-controls={expanded ? panelId : undefined}
                className={[
                  'min-h-[2.25rem] shrink-0 cursor-pointer rounded-full border px-2.5 py-1.5 text-left text-[11px] font-semibold leading-snug transition sm:px-3.5 sm:py-2 sm:text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
                  on
                    ? 'border-indigo-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200/90'
                    : 'border-slate-200 bg-slate-100/90 text-slate-500 opacity-90 hover:bg-slate-200/80 hover:opacity-100',
                ].join(' ')}
              >
                {b.label}
                {on ? ' ✓' : ''}
              </button>
            );
          })}
        </div>
      </div>
      {openMeta && (
        <div
          id={panelId}
          role="region"
          aria-live="polite"
          className="mt-2 max-w-full rounded-2xl border border-indigo-100 bg-white/95 px-4 py-3 text-left text-sm text-slate-700 shadow-md sm:ml-auto sm:max-w-md"
        >
          <span className="text-base font-bold text-indigo-900">{openMeta.label}</span>
          <p className="mt-1.5 leading-relaxed">{openMeta.desc}</p>
          <p className="mt-2 text-xs text-slate-500">
            {unlocked.has(openMeta.id) ? 'Bu rozeti kazandın.' : 'Akışta ilgili adımı tamamlayınca açılır.'}
          </p>
        </div>
      )}
    </div>
  );
}
