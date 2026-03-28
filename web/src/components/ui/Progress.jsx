import React from 'react';

export function Progress({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={[
        'h-2 w-full overflow-hidden rounded-full bg-slate-200/70',
        className,
      ].join(' ')}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

