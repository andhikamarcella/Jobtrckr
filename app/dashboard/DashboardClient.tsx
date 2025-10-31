"use client";

import { useCallback, useEffect, useMemo, useState, type SVGProps } from "react";
import { createClient } from "@/lib/supabaseClient";

type ApplicationStatus =
  | "waiting"
  | "screening"
  | "mcu"
  | "interview-user"
  | "psikotes"
  | "tes-online"
  | "training"
  | "tes-kesehatan"
  | "offering"
  | "rejected"
  | "hired";

type ApplicationSource =
  | "linkedin"
  | "email"
  | "website"
  | "disnaker"
  | "instagram"
  | "teman-keluarga"
  | "lainnya";

export type Application = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  notes: string | null;
};

const STATUS_DETAILS: Array<{
  value: ApplicationStatus;
  label: string;
  description: string;
}> = [
  { value: "waiting", label: "Waiting", description: "Semua lamaran kamu" },
  { value: "screening", label: "Screening", description: "Sedang di-screening" },
  { value: "mcu", label: "MCU", description: "Cek kesehatan awal" },
  { value: "interview-user", label: "Interview User", description: "Siap interview" },
  { value: "psikotes", label: "Psikotes", description: "Uji psikologi" },
  { value: "tes-online", label: "Tes Online", description: "Tes via web" },
  { value: "training", label: "Training", description: "Tahap pelatihan" },
  { value: "tes-kesehatan", label: "Tes Kesehatan", description: "Tes ulang kesehatan" },
  { value: "offering", label: "Offering", description: "Tawaran kerja" },
  { value: "rejected", label: "Rejected", description: "Jangan nyerah 👾" },
  { value: "hired", label: "Hired", description: "Selamat 🎉" },
];

const SOURCE_DETAILS: Array<{ value: ApplicationSource; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "disnaker", label: "Disnaker" },
  { value: "instagram", label: "Instagram" },
  { value: "teman-keluarga", label: "Teman/Keluarga" },
  { value: "lainnya", label: "Lainnya" },
];

const STATUS_ORDER = STATUS_DETAILS.map((item) => item.value);
const SOURCE_ORDER = SOURCE_DETAILS.map((item) => item.value);

const STATUS_LABEL_MAP: Record<ApplicationStatus, string> = STATUS_DETAILS.reduce(
  (acc, detail) => ({ ...acc, [detail.value]: detail.label }),
  {} as Record<ApplicationStatus, string>
);

const SOURCE_LABEL_MAP: Record<ApplicationSource, string> = SOURCE_DETAILS.reduce(
  (acc, detail) => ({ ...acc, [detail.value]: detail.label }),
  {} as Record<ApplicationSource, string>
);

function normalizeStatus(value: string | null | undefined): ApplicationStatus {
  const slug = (value ?? "waiting").toLowerCase().replace(/\s+/g, "-") as ApplicationStatus;
  return STATUS_ORDER.includes(slug) ? slug : "waiting";
}

function normalizeSource(value: string | null | undefined): ApplicationSource {
  const slug = (value ?? "lainnya").toLowerCase().replace(/\s+/g, "-") as ApplicationSource;
  return SOURCE_ORDER.includes(slug) ? slug : "lainnya";
}

function formatOwner(email: string): string {
  if (!email) return "Guest";
  const namePart = email.split("@")[0] ?? "Guest";
  const formatted = namePart
    .replace(/[._-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
  return formatted.join(" ") || "Guest";
}

export default function DashboardClient() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<ApplicationStatus | "all">("all");
  const [isDark, setIsDark] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingMutation, setLoadingMutation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting" as ApplicationStatus,
    source: "linkedin" as ApplicationSource,
    notes: "",
  });

  const resolveSiteUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl && envUrl.length > 0) {
      return envUrl;
    }
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin.includes("localhost")) {
        return origin;
      }
    }
    return "https://jobtrckr.vercel.app";
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        window.location.href = "/auth";
        return;
      }
      setUserEmail(authData.user.email || "");

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("applied_at", { ascending: false });

      if (!error && data) {
        setApplications(
          (data as Application[]).map((item) => ({
            ...item,
            status: normalizeStatus(item.status),
            source: normalizeSource(item.source),
          }))
        );
      }
    };

    fetchApplications();
  }, [supabase]);

  const filteredApplications = useMemo(() => {
    if (filteredStatus === "all") return applications;
    return applications.filter((item) => normalizeStatus(item.status) === filteredStatus);
  }, [applications, filteredStatus]);

  const countsByStatus = useMemo(() => {
    const result: Record<ApplicationStatus, number> = STATUS_ORDER.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<ApplicationStatus, number>
    );
    for (const app of applications) {
      const status = normalizeStatus(app.status);
      result[status] += 1;
    }
    return result;
  }, [applications]);

  const countsBySource = useMemo(() => {
    const result: Record<ApplicationSource, number> = SOURCE_ORDER.reduce(
      (acc, source) => ({ ...acc, [source]: 0 }),
      {} as Record<ApplicationSource, number>
    );
    for (const app of applications) {
      const source = normalizeSource(app.source);
      result[source] += 1;
    }
    return result;
  }, [applications]);

  const summaryCards = useMemo(
    () => [
      {
        key: "total",
        label: "Total Applications",
        description: "Jumlah seluruh lamaran",
        count: applications.length,
      },
      ...STATUS_DETAILS.map(({ value, label, description }) => ({
        key: value,
        label,
        description,
        count: countsByStatus[value],
      })),
    ],
    [applications.length, countsByStatus]
  );

  const themeAwareCard = isDark
    ? "bg-slate-900/55 border border-slate-700/50 text-slate-100 shadow-[0_25px_55px_rgba(2,6,23,0.55)]"
    : "bg-white/95 border border-slate-200 text-slate-900 shadow-[0_24px_55px_rgba(15,23,42,0.18)]";

  const themeAwareSourceCard = isDark
    ? "bg-slate-900/45 border border-slate-700/45 text-slate-100 shadow-[0_22px_45px_rgba(15,23,42,0.45)]"
    : "bg-white/95 border border-slate-200 text-slate-900 shadow-[0_22px_45px_rgba(148,163,184,0.28)]";

  const ctaCardClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-900/60 border border-slate-700/50 text-slate-100 shadow-[0_26px_55px_rgba(2,6,23,0.6)]"
    : "bg-gradient-to-br from-white via-white/90 to-slate-100 border border-slate-200 text-slate-900 shadow-[0_26px_55px_rgba(148,163,184,0.35)]";

  const inputClass = `${
    isDark
      ? "border-slate-600/60 bg-transparent text-slate-100 placeholder:text-slate-400"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
  } w-full rounded-2xl border px-4 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(99,102,241,0.2)]`;

  const selectClass = `${
    isDark
      ? "border-slate-600/60 bg-slate-950/70 text-slate-100"
      : "border-slate-300 bg-white text-slate-900"
  } w-full rounded-2xl border px-4 py-2 text-sm appearance-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(99,102,241,0.28)]`;

  const textareaClass = `${inputClass} min-h-[110px] resize-none`;

  const helperTextClass = isDark ? "text-xs text-slate-400" : "text-xs text-slate-600";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = resolveSiteUrl();
  };

  const resetForm = useCallback(() => {
    setForm({
      company: "",
      position: "",
      applied_at: new Date().toISOString().slice(0, 10),
      status: "waiting",
      source: "linkedin",
      notes: "",
    });
    setEditingId(null);
    setErrorMessage("");
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        resetForm();
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [resetForm]);

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (application: Application) => {
    setEditingId(application.id);
    setForm({
      company: application.company,
      position: application.position,
      applied_at: application.applied_at,
      status: normalizeStatus(application.status),
      source: normalizeSource(application.source),
      notes: application.notes ?? "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const refreshApplications = async (userId: string) => {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("applied_at", { ascending: false });

    if (data) {
      setApplications(
        (data as Application[]).map((item) => ({
          ...item,
          status: normalizeStatus(item.status),
          source: normalizeSource(item.source),
        }))
      );
    }
  };

  const handleSave = async () => {
    setLoadingMutation(true);
    setErrorMessage("");

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      setErrorMessage("Sesi berakhir, silakan login kembali.");
      setLoadingMutation(false);
      return;
    }

    const payload = {
      user_id: authData.user.id,
      company: form.company.trim(),
      position: form.position.trim(),
      applied_at: form.applied_at,
      status: form.status,
      source: form.source,
      notes: form.notes.trim() || null,
    };

    const mutation = editingId
      ? supabase.from("applications").update(payload).eq("id", editingId).eq("user_id", authData.user.id)
      : supabase.from("applications").insert(payload);

    const { error } = await mutation;
    if (error) {
      console.error("mutation error", error);
      setErrorMessage(error.message);
      setLoadingMutation(false);
      return;
    }

    await refreshApplications(authData.user.id);

    setLoadingMutation(false);
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    await supabase.from("applications").delete().eq("id", id).eq("user_id", authData.user.id);
    await refreshApplications(authData.user.id);
  };

  const exportToCsv = async () => {
    if (applications.length === 0) return;

    const rows = applications.map((app) => ({
      Company: app.company,
      Position: app.position,
      AppliedAt: app.applied_at,
      Status: STATUS_LABEL_MAP[normalizeStatus(app.status)],
      Source: SOURCE_LABEL_MAP[normalizeSource(app.source)],
      Notes: app.notes?.replace(/\r?\n/g, " ") ?? "",
    }));

    const header = "Company,Position,AppliedAt,Status,Source,Notes\n";
    const csv =
      header +
      rows
        .map((row) =>
          [row.Company, row.Position, row.AppliedAt, row.Status, row.Source, row.Notes.replace(/,/g, ";")].join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jobtrackr-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen pb-16 transition-colors duration-700 ease-out ${
        isDark ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900"
      }`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-500 ${
          isDark
            ? "bg-slate-950/85 border-slate-800 shadow-[0_18px_55px_rgba(2,6,23,0.55)]"
            : "bg-white/85 border-slate-200 shadow-[0_18px_45px_rgba(148,163,184,0.35)]"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold md:text-3xl" aria-live="polite">
              Hai, {formatOwner(userEmail)}
            </h1>
            <p className={`text-xs transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Pantau semua lamaran kerja kamu dalam satu dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setIsDark((prev) => !prev)}
              className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(99,102,241,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                isDark
                  ? "border-slate-700/60 bg-slate-900/70 text-yellow-200"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  isDark ? "opacity-0" : "opacity-100"
                }`}
              >
                <SunIcon className="h-6 w-6" />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  isDark ? "opacity-100" : "opacity-0"
                }`}
              >
                <MoonIcon className="h-6 w-6" />
              </span>
            </button>
            <button
              onClick={exportToCsv}
              className={`hidden items-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold transition-all duration-300 sm:flex hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                isDark
                  ? "bg-emerald-500 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.35)]"
                  : "bg-emerald-400 text-slate-900 shadow-[0_20px_40px_rgba(74,222,128,0.35)]"
              }`}
            >
              <DownloadIcon className="h-4 w-4" />
              Export to Excel
            </button>
            <button
              onClick={openCreate}
              className={`hidden items-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold transition-all duration-300 sm:flex hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500 text-white shadow-[0_22px_48px_rgba(129,140,248,0.45)]"
                  : "bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 text-white shadow-[0_22px_48px_rgba(129,140,248,0.35)]"
              }`}
            >
              <PlusIcon className="h-4 w-4" />
              Add Application
            </button>
            <button
              onClick={handleLogout}
              className={`rounded-3xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 ${
                isDark
                  ? "border border-slate-600/60 bg-slate-900/60 text-slate-100 hover:bg-slate-800/70 hover:shadow-[0_18px_38px_rgba(2,6,23,0.55)]"
                  : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-200/70 hover:shadow-[0_14px_28px_rgba(148,163,184,0.25)]"
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-4 flex gap-3 px-4 sm:hidden">
        <button
          onClick={exportToCsv}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
            isDark
              ? "bg-emerald-500 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.35)]"
              : "bg-emerald-400 text-slate-900 shadow-[0_20px_40px_rgba(74,222,128,0.35)]"
          }`}
        >
          <DownloadIcon className="h-4 w-4" />
          Export
        </button>
        <button
          onClick={openCreate}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
            isDark
              ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500 text-white shadow-[0_22px_48px_rgba(129,140,248,0.45)]"
              : "bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 text-white shadow-[0_22px_48px_rgba(129,140,248,0.35)]"
          }`}
        >
          <PlusIcon className="h-4 w-4" />
          Add
        </button>
      </div>

      <main className="mx-auto mt-8 space-y-8 px-4 max-w-6xl">
        <section
          className={`${ctaCardClass} group relative overflow-hidden rounded-4xl p-6 transition-all duration-500 hover:-translate-y-1 motion-safe:animate-[float-card_18s_ease-in-out_infinite]`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_55%)] opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 md:max-w-2xl">
              <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "text-indigo-200" : "text-indigo-500"}`}>
                New Application
              </p>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Tambahkan lamaran baru dan lanjutkan perjalanan kariermu.
              </h2>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Catat detail perusahaan, posisi, dan progres setiap proses rekrutmen. Statistik akan otomatis diperbarui setelah kamu menyimpan data.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openCreate}
                className={`relative inline-flex items-center gap-2 overflow-hidden rounded-3xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500 text-white shadow-[0_25px_50px_rgba(129,140,248,0.45)]"
                    : "bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 text-white shadow-[0_25px_50px_rgba(129,140,248,0.35)]"
                }`}
              >
                <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                <span className="relative z-10 flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Mulai Input
                </span>
              </button>
              <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Tips: tekan <kbd className="rounded-md border border-slate-500/40 px-1 text-[0.65rem]">Ctrl</kbd> + <kbd className="rounded-md border border-slate-500/40 px-1 text-[0.65rem]">I</kbd> untuk membuka form.
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {summaryCards.map(({ key, label, description, count }) => (
            <article
              key={key}
              className={`${themeAwareCard} group relative overflow-hidden rounded-4xl p-5 transition-all duration-500 hover:-translate-y-1`}
              role="status"
              aria-live="polite"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {label}
              </p>
              <p className="mt-2 text-4xl font-bold">{count}</p>
              <p className={`mt-2 text-sm transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}>{description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCE_DETAILS.map(({ value, label }) => (
            <article
              key={value}
              className={`${themeAwareSourceCard} group relative overflow-hidden rounded-3xl p-4 transition-all duration-500 hover:-translate-y-1`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                {label}
              </p>
              <p className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{countsBySource[value]}</p>
            </article>
          ))}
        </section>

        <section className="flex gap-3 overflow-x-auto pb-1" aria-label="Filter status">
          <FilterPill label="All" active={filteredStatus === "all"} onClick={() => setFilteredStatus("all")} isDark={isDark} />
          {STATUS_DETAILS.map(({ value, label }) => (
            <FilterPill
              key={value}
              label={label}
              active={filteredStatus === value}
              onClick={() => setFilteredStatus(value)}
              isDark={isDark}
            />
          ))}
        </section>

        <section
          className={`${
            isDark
              ? "bg-slate-950/45 border border-slate-800/40"
              : "bg-white/90 border border-slate-200"
          } rounded-4xl shadow-[0_25px_55px_rgba(15,23,42,0.35)] backdrop-blur-xl`}
        >
          <div
            className={`hidden md:grid grid-cols-[1.2fr,1.2fr,0.75fr,0.9fr,0.9fr,1.2fr,0.7fr] gap-6 px-8 py-5 text-sm font-semibold uppercase tracking-wide ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <div>Company</div>
            <div>Position</div>
            <div>Applied</div>
            <div>Status</div>
            <div>Source</div>
            <div>Notes</div>
            <div className="text-center">Actions</div>
          </div>
          <div className="divide-y divide-slate-800/20">
            {filteredApplications.length === 0 ? (
              <p className={`px-6 py-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Belum ada data lamaran.
              </p>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="grid gap-6 px-6 py-5 text-sm md:grid-cols-[1.2fr,1.2fr,0.75fr,0.9fr,0.9fr,1.2fr,0.7fr]"
                >
                  <div className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{app.company}</div>
                  <div className={isDark ? "text-slate-200" : "text-slate-700"}>{app.position}</div>
                  <div className={isDark ? "text-slate-300" : "text-slate-600"}>{app.applied_at}</div>
                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-800/60 text-xs capitalize text-slate-100">
                      {STATUS_LABEL_MAP[normalizeStatus(app.status)]}
                    </span>
                  </div>
                  <div className={isDark ? "text-slate-200" : "text-slate-700"}>
                    {SOURCE_LABEL_MAP[normalizeSource(app.source)]}
                  </div>
                  <div
                    className={`max-w-md whitespace-pre-line text-sm leading-relaxed ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    } md:line-clamp-2`}
                    title={app.notes ?? ""}
                  >
                    {app.notes?.trim() ? app.notes : "—"}
                  </div>
                  <div className="flex items-center justify-start gap-2 md:justify-center">
                    <button
                      onClick={() => openEdit(app)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                        isDark
                          ? "bg-slate-700/60 text-slate-100 hover:bg-slate-600/70"
                          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 md:hidden">
          {filteredApplications.length === 0 ? (
            <p className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Belum ada data lamaran.</p>
          ) : (
            filteredApplications.map((app) => (
              <article
                key={app.id}
                className={`${
                  isDark
                    ? "bg-slate-900/40 border border-slate-800/40 text-slate-100"
                    : "bg-white border border-slate-200 text-slate-900"
                } rounded-3xl p-4 shadow-[0_18px_45px_rgba(15,23,42,0.35)] transition-all duration-500`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{app.company}</p>
                    <p className="text-xs opacity-75">{app.position}</p>
                    <p className="text-[10px] opacity-60 mt-2">Applied: {app.applied_at}</p>
                    <p className="text-[10px] opacity-60">Source: {SOURCE_LABEL_MAP[normalizeSource(app.source)]}</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-[10px] font-semibold capitalize text-indigo-200">
                    {STATUS_LABEL_MAP[normalizeStatus(app.status)]}
                  </span>
                </div>
                {app.notes && app.notes.trim() ? (
                  <p className="mt-3 whitespace-pre-line text-xs leading-relaxed opacity-85">
                    {app.notes}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">Tidak ada catatan.</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(app)}
                    className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                      isDark
                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                        : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="flex-1 rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div
            className={`${
              isDark
                ? "bg-slate-950/90 border border-slate-700/60"
                : "bg-white border border-slate-200"
            } w-full max-w-lg rounded-3xl p-6 shadow-[0_0_60px_rgba(99,102,241,0.35)] transition-transform duration-300 ease-out animate-[fadeScale_0.25s_ease-out]`}
          >
            <h2 className={`text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              {editingId ? "Edit Application" : "New Application"}
            </h2>
            <p className={helperTextClass + " mt-1"}>
              Lengkapi detail lamaran kerja kamu di bawah ini.
            </p>
            <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Company</label>
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className={inputClass}
                  placeholder="Silakan isi nama perusahaan"
                />
                <p className={helperTextClass + " mt-1"}>Contoh: PT Lion Super Indo.</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Position</label>
                <input
                  value={form.position}
                  onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                  className={inputClass}
                  placeholder="Silakan isi posisi yang dilamar"
                />
                <p className={helperTextClass + " mt-1"}>Misal: DC Fresh Administration Staff.</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Applied at</label>
                <input
                  type="date"
                  value={form.applied_at}
                  onChange={(event) => setForm((prev) => ({ ...prev, applied_at: event.target.value }))}
                  className={inputClass}
                />
                <p className={helperTextClass + " mt-1"}>Tanggal ketika lamaran dikirim.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Status</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as ApplicationStatus }))
                    }
                    className={selectClass}
                  >
                    {STATUS_ORDER.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className={isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}
                      >
                        {STATUS_LABEL_MAP[status]}
                      </option>
                    ))}
                  </select>
                  <p className={helperTextClass + " mt-1"}>Tahapan terbaru proses rekrutmen.</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Source</label>
                  <select
                    value={form.source}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, source: event.target.value as ApplicationSource }))
                    }
                    className={`${selectClass} shadow-[0_0_0] focus:shadow-[0_18px_42px_rgba(16,185,129,0.25)]`}
                  >
                    {SOURCE_ORDER.map((source) => (
                      <option
                        key={source}
                        value={source}
                        className={isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}
                      >
                        {SOURCE_LABEL_MAP[source]}
                      </option>
                    ))}
                  </select>
                  <p className={helperTextClass + " mt-1"}>Asal informasi lowongan pekerjaan.</p>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className={textareaClass}
                  placeholder="Catatan penting: jadwal interview, kontak HR, dan sebagainya."
                />
              </div>
              {errorMessage ? (
                <p className="rounded-2xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className={`rounded-3xl px-5 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 ${
                  isDark
                    ? "border border-slate-600/60 text-slate-200 hover:bg-slate-900/60"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loadingMutation}
                className={`rounded-3xl px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500 shadow-[0_22px_48px_rgba(129,140,248,0.45)]"
                    : "bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 shadow-[0_22px_48px_rgba(129,140,248,0.35)]"
                }`}
              >
                {loadingMutation ? "Saving…" : editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93 6.34 6.34" />
      <path d="M17.66 17.66 19.07 19.07" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66 4.93 19.07" />
      <path d="M19.07 4.93 17.66 6.34" />
    </svg>
  );
}

function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
    </svg>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12" />
      <path d="m7 12 5 5 5-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

type FilterPillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
};

function FilterPill({ label, active, onClick, isDark }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
        active
          ? "bg-indigo-500 text-white shadow-[0_20px_45px_rgba(99,102,241,0.45)]"
          : isDark
          ? "border border-slate-700/40 bg-slate-900/50 text-slate-200 hover:bg-slate-900/70"
          : "border border-slate-300 bg-white/70 text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

export { normalizeSource as toSource, normalizeStatus as toStatus };
