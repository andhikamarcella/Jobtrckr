import type { ApplicationStatus } from "@/lib/applicationTypes";
import { getStatusLabel } from "@/lib/applicationTypes";
import { ProgressBar } from "./ProgressBar";

interface MetricsGridProps {
  counts: Record<ApplicationStatus, number>;
  total: number;
  hired: number;
}

export function MetricsGrid({ counts, total, hired }: MetricsGridProps) {
  const leadingStatus = (Object.keys(counts) as ApplicationStatus[]).reduce<ApplicationStatus | null>(
    (winner, status) => {
      if (counts[status] === 0) return winner;
      if (!winner) return status;
      return counts[status] > counts[winner] ? status : winner;
    },
    null
  );

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <article className="rounded-[28px] bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-200 p-[1px] shadow-[0_26px_60px_rgba(59,130,246,0.25)]">
        <div className="rounded-[26px] bg-white/95 px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status unggulan</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {leadingStatus ? getStatusLabel(leadingStatus) : "Belum ada data"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {leadingStatus
              ? `${counts[leadingStatus]} lamaran berada pada tahap ini.`
              : "Tambahkan lamaran pertama kamu untuk mulai memantau progres."}
          </p>
          <div className="mt-8">
            <ProgressBar total={total} hired={hired} />
          </div>
        </div>
      </article>

      <article className="y2k-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SummaryStat label="Total" value={total} accent="text-slate-900" />
          <SummaryStat label="Hired" value={hired} accent="text-emerald-600" />
          <SummaryStat label="Interview User" value={counts["interview-user"]} accent="text-sky-600" />
          <SummaryStat label="Waiting" value={counts.waiting} accent="text-amber-600" />
        </div>
      </article>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="min-w-[120px] flex-1 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-center shadow-[0_18px_32px_rgba(148,163,184,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
