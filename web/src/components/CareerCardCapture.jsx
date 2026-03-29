import React, { forwardRef } from 'react';

export const CareerCardCapture = forwardRef(function CareerCardCapture(
  { profileLabel, roles, delta, dateLabel },
  ref,
) {
  const roleNames = (roles ?? []).map((r) => r.roleName).filter(Boolean);

  return (
    <div
      ref={ref}
      className="box-border w-full max-w-[min(100%,36rem)] rounded-3xl border-2 border-indigo-200 bg-white p-6 text-left shadow-xl sm:p-8"
      style={{ fontFamily: 'system-ui, Segoe UI, sans-serif' }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Pusula</div>
      <div className="mt-1 text-lg font-extrabold text-indigo-950">Kariyer Rota Kartı</div>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="text-xs font-semibold text-slate-500">Disiplin / bölüm grubu</div>
        <div className="mt-1 text-sm font-bold text-slate-900">{profileLabel || '—'}</div>
      </div>
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-500">Önerilen 3 rol</div>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm font-medium text-slate-800">
          {roleNames.slice(0, 3).map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ol>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 rounded-2xl bg-indigo-50 px-4 py-3">
        <div>
          <div className="text-xs font-semibold text-indigo-800">Özgüven deltası (Δ)</div>
          <div className="text-[11px] text-indigo-700/80">Son − ilk (1–5 ölçeği)</div>
        </div>
        <div className="text-2xl font-black text-indigo-900">{delta >= 0 ? `+${delta}` : delta}</div>
      </div>
      <div className="mt-6 text-right text-[11px] text-slate-400">{dateLabel}</div>
    </div>
  );
});
