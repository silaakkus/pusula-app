import React from 'react';

export function Button({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'ghost'
  size = 'md', // 'md' | 'lg'
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-60 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700',
    ghost: 'bg-white/70 text-slate-700 ring-1 ring-black/5 hover:bg-white',
  };

  const sizes = {
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      {...props}
      className={[base, variants[variant], sizes[size], className].join(' ')}
    >
      {children}
    </button>
  );
}

