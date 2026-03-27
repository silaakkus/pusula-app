import React from 'react';

export function Badge({ children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

