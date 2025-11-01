interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (value: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
      <div className="flex flex-1 min-w-[150px] flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Dari</label>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onChange({ startDate: event.target.value, endDate })}
          className="mt-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div className="flex flex-1 min-w-[150px] flex-col">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Sampai</label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onChange({ startDate, endDate: event.target.value })}
          className="mt-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ startDate: "", endDate: "" })}
        className="self-end rounded-2xl border border-slate-600 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
      >
        Reset
      </button>
    </div>
  );
}
