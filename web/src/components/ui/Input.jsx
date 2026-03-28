import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
        className,
      ].join(' ')}
    />
  );
}

