export const STATUS_OPTIONS = [
  { value: "waiting", label: "Waiting", description: "Lamaran baru kamu" },
  { value: "screening", label: "Screening", description: "Sedang ditinjau HR" },
  { value: "mcu", label: "MCU", description: "Tes medical check-up" },
  { value: "interview-user", label: "Interview User", description: "Jadwal interview user" },
  { value: "psikotes", label: "Psikotes", description: "Tes psikologi" },
  { value: "tes-online", label: "Tes Online", description: "Tes daring" },
  { value: "training", label: "Training", description: "Tahap pelatihan" },
  { value: "tes-kesehatan", label: "Tes Kesehatan", description: "Tes kesehatan akhir" },
  { value: "offering", label: "Offering", description: "Menunggu penawaran" },
  { value: "rejected", label: "Rejected", description: "Tetap semangat!" },
  { value: "hired", label: "Hired", description: "Selamat bergabung" },
] as const;

export const SOURCE_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "disnaker", label: "Disnaker" },
  { value: "instagram", label: "Instagram" },
  { value: "teman-keluarga", label: "Teman/Keluarga" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type ApplicationStatus = (typeof STATUS_OPTIONS)[number]["value"];
export type ApplicationSource = (typeof SOURCE_OPTIONS)[number]["value"];

export interface ApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  notes: string | null;
  created_at?: string | null;
}

export const STATUS_BADGE_STYLES: Record<ApplicationStatus, string> = {
  waiting: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  screening: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  mcu: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-200",
  "interview-user": "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
  psikotes: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200",
  "tes-online": "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200",
  training: "bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-200",
  "tes-kesehatan": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  offering: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
  hired: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-100",
};

export const STATUS_PILL_STYLES: Record<ApplicationStatus, string> = {
  waiting: "bg-amber-100 text-amber-800 dark:bg-amber-500/25 dark:text-amber-100",
  screening: "bg-sky-100 text-sky-800 dark:bg-sky-500/25 dark:text-sky-100",
  mcu: "bg-pink-100 text-pink-800 dark:bg-pink-500/25 dark:text-pink-100",
  "interview-user": "bg-blue-100 text-blue-800 dark:bg-blue-500/25 dark:text-blue-100",
  psikotes: "bg-purple-100 text-purple-800 dark:bg-purple-500/25 dark:text-purple-100",
  "tes-online": "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/25 dark:text-cyan-100",
  training: "bg-lime-100 text-lime-800 dark:bg-lime-500/25 dark:text-lime-100",
  "tes-kesehatan": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-100",
  offering: "bg-orange-100 text-orange-800 dark:bg-orange-500/25 dark:text-orange-100",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/25 dark:text-rose-100",
  hired: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-100",
};

export const SOURCE_CARD_GRADIENTS: Record<ApplicationSource, string> = {
  linkedin:
    "from-sky-200/90 via-white/95 to-white/90 text-slate-800 dark:from-sky-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  email:
    "from-emerald-200/90 via-white/95 to-white/90 text-slate-800 dark:from-emerald-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  website:
    "from-indigo-200/90 via-white/95 to-white/90 text-slate-800 dark:from-indigo-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  disnaker:
    "from-orange-200/90 via-white/95 to-white/90 text-slate-800 dark:from-orange-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  instagram:
    "from-fuchsia-200/90 via-white/95 to-white/90 text-slate-800 dark:from-fuchsia-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  "teman-keluarga":
    "from-lime-200/90 via-white/95 to-white/90 text-slate-800 dark:from-lime-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
  lainnya:
    "from-slate-200/90 via-white/95 to-white/90 text-slate-800 dark:from-slate-500/25 dark:via-slate-900/30 dark:to-slate-950/70 dark:text-slate-50",
};

export function normalizeStatus(value: string | null | undefined): ApplicationStatus {
  const slug = (value ?? "waiting").toLowerCase().replace(/\s+/g, "-") as ApplicationStatus;
  return STATUS_OPTIONS.some((item) => item.value === slug) ? slug : "waiting";
}

export function normalizeSource(value: string | null | undefined): ApplicationSource {
  const slug = (value ?? "lainnya").toLowerCase().replace(/\s+/g, "-") as ApplicationSource;
  return SOURCE_OPTIONS.some((item) => item.value === slug) ? slug : "lainnya";
}

export function getStatusLabel(value: ApplicationStatus): string {
  return STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function getSourceLabel(value: ApplicationSource): string {
  return SOURCE_OPTIONS.find((item) => item.value === value)?.label ?? value;
}
