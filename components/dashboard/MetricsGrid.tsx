import type { ApplicationStatus } from "@/lib/applicationTypes";
import { getStatusLabel } from "@/lib/applicationTypes";
import { ProgressBar } from "./ProgressBar";

interface MetricsGridProps {
  counts: Record<ApplicationStatus, number>;
  total: number;
  hired: number;
}

export function MetricsGrid({ counts, total, hired }: MetricsGridProps) {
  const heroStatus = (Object.keys(counts) as ApplicationStatus[]).reduce<ApplicationStatus | undefined>((prev, status) => {
    if (counts[status] === 0) return prev;
    if (!prev) return status;
    return counts[status] > counts[prev] ? status : prev;
  }, undefined);
  const heroLabel = heroStatus ? getStatusLabel(heroStatus) : "Belum ada data";
  const heroCount = heroStatus ? counts[heroStatus] : 0;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
      <article className="relative overflow-hidden rounded-4xl border border-slate-200/70 bg-gradient-to-br from-indigo-500/90 via-sky-500/80 to-emerald-400/90 p-8 text-white shadow-[0_25px_60px_rgba(37,99,235,0.35)] backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:from-indigo-500/80 dark:via-slate-900/60 dark:to-emerald-400/80">
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
        <p className="text-sm font-medium uppercase tracking-wide text-white/80">Status unggulan</p>
        <h2 className="mt-3 text-3xl font-semibold">{heroLabel}</h2>
        <p className="mt-1 text-sm text-white/80">{heroCount} lamaran berada pada tahap ini.</p>
        <div className="mt-8">
          <ProgressBar total={total} hired={hired} />
        </div>
      </article>

      <article className="rounded-4xl border border-slate-200/80 bg-white/85 p-6 shadow-lg shadow-slate-500/15 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_20px_55px_rgba(15,23,42,0.5)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200">Ringkasan Cepat</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <SummaryTile label="Total" value={total} accent="text-slate-900 dark:text-white" />
          <SummaryTile label="Hired" value={hired} accent="text-emerald-600 dark:text-emerald-300" />
          <SummaryTile label="Interview User" value={counts["interview-user"]} accent="text-sky-600 dark:text-sky-300" />
          <SummaryTile label="Waiting" value={counts.waiting} accent="text-amber-600 dark:text-amber-300" />
        </div>
      </article>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 text-center shadow-sm transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/60">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
