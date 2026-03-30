import React, { forwardRef } from 'react';

/** PNG yakalama için sabit genişlik + kompakt tipografi (html2canvas ölçek tutarlılığı). */
export const CareerCardCapture = forwardRef(function CareerCardCapture(
  { profileLabel, roles, delta, dateLabel },
  ref,
) {
  const roleNames = (roles ?? []).map((r) => r.roleName).filter(Boolean);

  return (
    <div
      ref={ref}
      className="box-border w-[300px] max-w-full rounded-2xl border-2 border-indigo-200 bg-white p-5 text-left shadow-xl"
      style={{ fontFamily: 'system-ui, Segoe UI, sans-serif' }}
    >
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-indigo-600">Pusula</div>
      <div className="mt-0.5 text-base font-extrabold leading-snug text-indigo-950">Kariyer Rota Kartı</div>
      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="text-[10px] font-semibold text-slate-500">Fakülte / bölüm</div>
        <div className="mt-1 text-xs font-bold leading-snug text-slate-900">{profileLabel || '—'}</div>
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-semibold text-slate-500">Öne çıkan rol örnekleri</div>
        <ol className="mt-1.5 list-decimal space-y-0.5 pl-3.5 text-[11px] font-medium leading-snug text-slate-800">
          {roleNames.slice(0, 4).map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ol>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 rounded-xl bg-indigo-50 px-3 py-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-indigo-800">Özgüven deltası (Δ)</div>
          <div className="text-[9px] text-indigo-700/85">Son − ilk (1–5 ölçeği)</div>
        </div>
        <div className="shrink-0 text-lg font-black tabular-nums text-indigo-900">
          {delta >= 0 ? `+${delta}` : delta}
        </div>
      </div>
      <div className="mt-4 text-right text-[9px] text-slate-400">{dateLabel}</div>
    </div>
  );
});
