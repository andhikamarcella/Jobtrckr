'use client';

import clsx from 'clsx';

const STATUS_OPTIONS = ['all', 'waiting', 'interview', 'rejected', 'hired'] as const;

export type StatusFilterValue = (typeof STATUS_OPTIONS)[number];

interface StatusFilterProps {
  activeStatus: StatusFilterValue;
  onChange: (status: StatusFilterValue) => void;
}

export function StatusFilter({ activeStatus, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors',
            activeStatus === status
              ? 'border-blue-600 bg-blue-600 text-white shadow'
              : 'border-slate-300 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-600'
          )}
        >
          {status === 'all' ? 'All' : status}
        </button>
      ))}
    </div>
  );
}

export { STATUS_OPTIONS };
