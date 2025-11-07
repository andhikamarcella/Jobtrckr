import type { ApplicationRecord } from "@/lib/applicationTypes";
import { getStatusLabel } from "@/lib/applicationTypes";

interface InsightsPanelProps {
  applications: ApplicationRecord[];
}

const INSIGHT_MESSAGES: Array<{ test: (apps: ApplicationRecord[]) => boolean; message: string }> = [
  {
    test: (apps) => apps.some((app) => app.status === "interview-user"),
    message: "Kamu punya interview user 💪 – siapkan pertanyaan terbaikmu!",
  },
  {
    test: (apps) => apps.some((app) => app.status === "offering"),
    message: "Ada offering menunggu – tinjau detailnya sebelum keputusan final.",
  },
  {
    test: (apps) => apps.some((app) => app.status === "psikotes" || app.status === "tes-online"),
    message: "Tes online & psikotes bisa dilakukan fokus bertahap. Good luck!",
  },
  {
    test: (apps) => apps.some((app) => app.status === "training"),
    message: "Training sudah di depan mata. Siapkan catatan pentingmu!",
  },
];

function getRandomFallback(apps: ApplicationRecord[]): string {
  if (!apps.length) {
    return "Mulai catat lamaran pertamamu dan pantau progresnya di sini ✨";
  }

  const waiting = apps.filter((app) => app.status === "waiting").length;
  if (waiting > 2) {
    return "Ada beberapa lamaran menunggu respons. Follow-up bisa jadi ide bagus.";
  }

  return "Terus pantau lamaran kamu ✨ setiap langkah membawa kamu lebih dekat.";
}

export function InsightsPanel({ applications }: InsightsPanelProps) {
  const insight =
    INSIGHT_MESSAGES.find((item) => item.test(applications))?.message || getRandomFallback(applications);

  const latest = applications[0];

  return (
    <section className="y2k-card p-6">
      <div className="relative z-10">
        <h2 className="text-lg font-semibold text-slate-800">Insight Hari Ini</h2>
        <p className="mt-2 text-sm text-slate-600">{insight}</p>
        {latest ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_28px_rgba(148,163,184,0.18)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Terbaru</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{latest.company}</p>
            <p className="text-sm text-slate-600">{latest.position}</p>
            <p className="mt-3 text-xs text-slate-500">
              Status: <span className="font-semibold text-slate-800">{getStatusLabel(latest.status)}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
