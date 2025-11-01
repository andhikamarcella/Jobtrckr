interface ProgressBarProps {
  total: number;
  hired: number;
}

export function ProgressBar({ total, hired }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((hired / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/80">
        <span>Progres menuju hired</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/30">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-white via-sky-100 to-emerald-200 transition-[width] duration-500 dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
