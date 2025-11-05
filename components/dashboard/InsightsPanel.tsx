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
    <section className="rounded-4xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-slate-300/35 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-slate-800">Insight Hari Ini</h2>
      <p className="mt-2 text-sm text-slate-600">{insight}</p>
      {latest ? (
        <div className="mt-4 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Terbaru</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{latest.company}</p>
          <p className="text-sm text-slate-600">{latest.position}</p>
          <p className="mt-2 text-xs text-slate-500">
            Status: <span className="font-semibold text-slate-800">{getStatusLabel(latest.status)}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
