interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (value: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-slate-300/25 backdrop-blur-xl">
      <div className="flex min-w-[150px] flex-1 flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Dari</label>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onChange({ startDate: event.target.value, endDate })}
          className="mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div className="flex min-w-[150px] flex-1 flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sampai</label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onChange({ startDate, endDate: event.target.value })}
          className="mt-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ startDate: "", endDate: "" })}
        className="self-end rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
      >
        Reset
      </button>
    </div>
  );
}
