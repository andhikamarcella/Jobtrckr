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
  waiting: "bg-amber-100 text-amber-800",
  screening: "bg-sky-100 text-sky-800",
  mcu: "bg-pink-100 text-pink-800",
  "interview-user": "bg-blue-100 text-blue-800",
  psikotes: "bg-purple-100 text-purple-800",
  "tes-online": "bg-cyan-100 text-cyan-800",
  training: "bg-lime-100 text-lime-800",
  "tes-kesehatan": "bg-emerald-100 text-emerald-800",
  offering: "bg-orange-100 text-orange-800",
  rejected: "bg-rose-100 text-rose-800",
  hired: "bg-emerald-100 text-emerald-800",
};

export const STATUS_PILL_STYLES: Record<ApplicationStatus, string> = {
  waiting: "bg-amber-100 text-amber-800",
  screening: "bg-sky-100 text-sky-800",
  mcu: "bg-pink-100 text-pink-800",
  "interview-user": "bg-blue-100 text-blue-800",
  psikotes: "bg-purple-100 text-purple-800",
  "tes-online": "bg-cyan-100 text-cyan-800",
  training: "bg-lime-100 text-lime-800",
  "tes-kesehatan": "bg-emerald-100 text-emerald-800",
  offering: "bg-orange-100 text-orange-800",
  rejected: "bg-rose-100 text-rose-800",
  hired: "bg-emerald-100 text-emerald-800",
};

export const SOURCE_CARD_GRADIENTS: Record<ApplicationSource, string> = {
  linkedin: "from-sky-100 via-white to-white text-slate-800",
  email: "from-emerald-100 via-white to-white text-slate-800",
  website: "from-indigo-100 via-white to-white text-slate-800",
  disnaker: "from-orange-100 via-white to-white text-slate-800",
  instagram: "from-fuchsia-100 via-white to-white text-slate-800",
  "teman-keluarga": "from-lime-100 via-white to-white text-slate-800",
  lainnya: "from-slate-100 via-white to-white text-slate-800",
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
