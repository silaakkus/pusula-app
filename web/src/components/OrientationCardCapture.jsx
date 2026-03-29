import React, { forwardRef } from 'react';

export const OrientationCardCapture = forwardRef(function OrientationCardCapture(
  { headline, subline, archetypeLabel, nextSteps, dateLabel },
  ref,
) {
  const steps = Array.isArray(nextSteps) ? nextSteps.slice(0, 4) : [];
  return (
    <div
      ref={ref}
      className="box-border w-[300px] max-w-full rounded-2xl border-2 border-violet-200 bg-white p-5 text-left shadow-xl"
      style={{ fontFamily: 'system-ui, Segoe UI, sans-serif' }}
    >
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">Pusula</div>
      <div className="mt-0.5 text-base font-extrabold leading-snug text-indigo-950">Yönelim kartı</div>
      {archetypeLabel && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{archetypeLabel}</div>
      )}
      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="text-sm font-extrabold leading-snug text-indigo-900">{headline}</div>
        {subline && <div className="mt-1.5 text-[11px] font-medium leading-snug text-slate-700">{subline}</div>}
      </div>
      {steps.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-semibold text-slate-500">Sonraki adımlar</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-3.5 text-[10px] font-medium leading-snug text-slate-800">
            {steps.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 text-right text-[9px] text-slate-400">{dateLabel}</div>
    </div>
  );
});
