interface ProgressBarProps {
  total: number;
  hired: number;
}

export function ProgressBar({ total, hired }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((hired / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>Progres menuju hired</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
