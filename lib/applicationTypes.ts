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
  waiting: "bg-amber-500/20 text-amber-200",
  screening: "bg-sky-500/20 text-sky-200",
  mcu: "bg-pink-500/20 text-pink-200",
  "interview-user": "bg-blue-500/20 text-blue-200",
  psikotes: "bg-purple-500/20 text-purple-200",
  "tes-online": "bg-cyan-500/20 text-cyan-200",
  training: "bg-lime-500/20 text-lime-200",
  "tes-kesehatan": "bg-emerald-500/20 text-emerald-200",
  offering: "bg-orange-500/20 text-orange-200",
  rejected: "bg-rose-500/20 text-rose-200",
  hired: "bg-emerald-500/25 text-emerald-100",
};

export const STATUS_PILL_STYLES: Record<ApplicationStatus, string> = {
  waiting: "bg-amber-100 text-amber-900",
  screening: "bg-sky-100 text-sky-900",
  mcu: "bg-pink-100 text-pink-900",
  "interview-user": "bg-blue-100 text-blue-900",
  psikotes: "bg-purple-100 text-purple-900",
  "tes-online": "bg-cyan-100 text-cyan-900",
  training: "bg-lime-100 text-lime-900",
  "tes-kesehatan": "bg-emerald-100 text-emerald-900",
  offering: "bg-orange-100 text-orange-900",
  rejected: "bg-rose-100 text-rose-900",
  hired: "bg-emerald-200 text-emerald-900",
};

export const SOURCE_CARD_GRADIENTS: Record<ApplicationSource, string> = {
  linkedin: "from-sky-500/30 to-slate-900/40",
  email: "from-emerald-500/30 to-slate-900/40",
  website: "from-indigo-500/30 to-slate-900/40",
  disnaker: "from-orange-500/30 to-slate-900/40",
  instagram: "from-fuchsia-500/30 to-slate-900/40",
  "teman-keluarga": "from-lime-500/30 to-slate-900/40",
  lainnya: "from-slate-500/30 to-slate-900/40",
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
