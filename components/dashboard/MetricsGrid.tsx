import type { ApplicationStatus } from "@/lib/applicationTypes";
import { getStatusLabel } from "@/lib/applicationTypes";
import { ProgressBar } from "./ProgressBar";

interface MetricsGridProps {
  counts: Record<ApplicationStatus, number>;
  total: number;
  hired: number;
}

export function MetricsGrid({ counts, total, hired }: MetricsGridProps) {
  const heroStatus = (Object.keys(counts) as ApplicationStatus[]).find((status) => counts[status] > 0);
  const heroLabel = heroStatus ? getStatusLabel(heroStatus) : "Belum ada data";
  const heroCount = heroStatus ? counts[heroStatus] : 0;

  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="rounded-4xl border border-slate-200/70 bg-white/95 p-6 shadow-lg shadow-slate-500/20 transition-colors duration-500 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/40 dark:to-slate-950 dark:shadow-[0_25px_60px_rgba(15,23,42,0.45)]">
        <p className="text-sm text-slate-600 dark:text-slate-300">Status unggulan</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{heroLabel}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{heroCount} lamaran berada pada tahap ini.</p>
        <div className="mt-6">
          <ProgressBar total={total} hired={hired} />
        </div>
      </div>
      <div className="rounded-4xl border border-slate-200/70 bg-white/95 p-6 shadow-lg shadow-slate-500/15 transition-colors duration-500 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/80 dark:via-slate-900/40 dark:to-slate-950/70 dark:shadow-[0_18px_45px_rgba(15,23,42,0.4)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Ringkasan Cepat</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Hired</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{hired}</p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Interview/User</p>
            <p className="mt-1 text-xl font-semibold text-blue-600 dark:text-blue-200">{counts["interview-user"]}</p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Waiting</p>
            <p className="mt-1 text-xl font-semibold text-amber-500 dark:text-amber-200">{counts.waiting}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
