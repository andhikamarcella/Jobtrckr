interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (value: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-sm shadow-slate-500/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none">
      <div className="flex min-w-[150px] flex-1 flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Dari</label>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onChange({ startDate: event.target.value, endDate })}
          className="mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50"
        />
      </div>
      <div className="flex min-w-[150px] flex-1 flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Sampai</label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onChange({ startDate, endDate: event.target.value })}
          className="mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ startDate: "", endDate: "" })}
        className="self-end rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800/60"
      >
        Reset
      </button>
    </div>
  );
}
