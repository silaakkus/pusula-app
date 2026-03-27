import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-3xl border border-white/30 bg-white/60 p-8 shadow-xl shadow-indigo-100 backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

