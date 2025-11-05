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
      <article className="y2k-card overflow-hidden bg-gradient-to-br from-sky-500 via-indigo-500 to-emerald-400 text-white shadow-[0_30px_70px_rgba(14,165,233,0.4)]">
        <div className="relative z-10">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-white/75">Status unggulan</p>
          <h2 className="mt-4 text-3xl font-semibold drop-shadow-sm">{heroLabel}</h2>
          <p className="mt-2 text-sm text-white/85">{heroCount} lamaran berada pada tahap ini.</p>
          <div className="mt-8">
            <ProgressBar total={total} hired={hired} />
          </div>
        </div>
      </article>

      <article className="y2k-card p-6">
        <div className="relative z-10">
          <h3 className="y2k-section-title text-slate-500">Ringkasan Cepat</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <SummaryTile label="Total" value={total} accent="text-slate-900" />
            <SummaryTile label="Hired" value={hired} accent="text-emerald-600" />
            <SummaryTile label="Interview User" value={counts["interview-user"]} accent="text-sky-600" />
            <SummaryTile label="Waiting" value={counts.waiting} accent="text-amber-600" />
          </div>
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
    <div className="y2k-card px-4 py-5 text-center">
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">{label}</p>
        <p className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</p>
      </div>
    </div>
  );
}
