"use client";

import { useEffect, useMemo, useState, type SVGProps } from "react";
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

  const themeAwareCard = isDark
    ? "bg-slate-900/50 border border-slate-700/50 text-slate-100 shadow-[0_28px_60px_rgba(2,6,23,0.55)]"
    : "bg-white/90 border border-slate-200 text-slate-900 shadow-[0_24px_55px_rgba(148,163,184,0.35)]";

  const themeAwareSourceCard = isDark
    ? "bg-slate-900/45 border border-slate-700/50 text-slate-100 shadow-[0_20px_45px_rgba(15,23,42,0.45)]"
    : "bg-white/95 border border-slate-200 text-slate-900 shadow-[0_20px_40px_rgba(148,163,184,0.3)]";

  const inputClass = `${
    isDark
      ? "border-slate-600/60 bg-transparent text-slate-100 placeholder:text-slate-400"
      : "border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-500"
  } w-full rounded-2xl border px-4 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(99,102,241,0.2)]`;

  const selectClass = `${
    isDark
      ? "border-slate-600/60 bg-slate-950/60 text-slate-100"
      : "border-slate-300 bg-white text-slate-900"
  } w-full rounded-2xl border px-4 py-2 text-sm appearance-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(99,102,241,0.28)]`;

  const textareaClass = `${inputClass} min-h-[110px] resize-none`;

  const helperTextClass = isDark ? "text-xs text-slate-400" : "text-xs text-slate-600";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const resetForm = () => {
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
  };

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
      className={`min-h-screen pb-14 transition-colors duration-700 ease-out ${
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
              Hi, {userEmail || "Guest"}
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
                className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "opacity-0" : "opacity-100"}`}
              >
                <SunIcon className="h-full w-full" />
              </span>
              <span
                className={`absolute inset-0 transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
              >
                <MoonIcon className="h-full w-full" />
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
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {STATUS_DETAILS.map(({ value, label, description }) => (
            <article
              key={value}
              className={`${themeAwareCard} group relative overflow-hidden rounded-4xl p-5 transition-all duration-500 hover:-translate-y-1`}
              role="status"
              aria-live="polite"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {label}
              </p>
              <p className="mt-2 text-4xl font-bold">{countsByStatus[value]}</p>
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-emerald-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
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
            className={`hidden md:grid grid-cols-[1.2fr,1.2fr,0.7fr,0.9fr,0.9fr,0.9fr] gap-6 px-8 py-5 text-sm font-semibold uppercase tracking-wide ${
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
                  className="grid gap-6 px-6 py-5 md:grid-cols-[1.2fr,1.2fr,0.7fr,0.9fr,0.9fr,0.9fr] md:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-tight md:text-sm">{app.company}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>ID: {app.id.slice(0, 8)}…</p>
                  </div>
                  <div className="text-sm md:text-base md:font-medium">{app.position}</div>
                  <div className={`text-sm ${isDark ? "text-slate-200" : "text-slate-600"}`}>{app.applied_at}</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all duration-300 ${
                        isDark
                          ? "bg-slate-900/60 text-slate-100"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {STATUS_LABEL_MAP[normalizeStatus(app.status)]}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {SOURCE_LABEL_MAP[normalizeSource(app.source)]}
                  </div>
                  <div className={`text-sm leading-relaxed md:line-clamp-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {app.notes || "—"}
                  </div>
                  <div className="flex gap-2 md:justify-center">
                    <button
                      onClick={() => openEdit(app)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                        isDark
                          ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 bg-rose-500 hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl transform rounded-4xl border p-6 shadow-[0_32px_80px_rgba(15,23,42,0.55)] transition-all duration-500 ${
              isDark
                ? "border-slate-700/60 bg-slate-950/90"
                : "border-slate-200 bg-white/95"
            } animate-modal-pop`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-xl font-semibold">
                {editingId ? "Edit Application" : "New Application"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full border border-transparent p-2 text-sm transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Lengkapi informasi di bawah ini untuk melacak progres lamaranmu.
            </p>
            <div className="mt-6 space-y-5 overflow-y-auto pr-1" style={{ maxHeight: "65vh" }}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Company</label>
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  className={inputClass}
                  placeholder="Silakan isi nama perusahaan"
                />
                <p className={helperTextClass}>Contoh: PT Ayam Jago Tbk.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Position</label>
                <input
                  value={form.position}
                  onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                  className={inputClass}
                  placeholder="Silakan isi posisi yang kamu lamar"
                />
                <p className={helperTextClass}>Contoh: Admin Gudang / IT Support / Designer.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Applied At</label>
                <input
                  type="date"
                  value={form.applied_at}
                  onChange={(event) => setForm((prev) => ({ ...prev, applied_at: event.target.value }))}
                  className={inputClass}
                />
                <p className={helperTextClass}>Tanggal saat lamaran dikirim.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Status</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as ApplicationStatus }))
                    }
                    className={`${selectClass} bg-gradient-to-br from-transparent to-transparent`}
                  >
                    {STATUS_DETAILS.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-slate-900 text-slate-50 dark:bg-slate-900 dark:text-slate-50">
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className={helperTextClass}>Pilih tahapan terbaru proses rekrutmen.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Source</label>
                  <select
                    value={form.source}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, source: event.target.value as ApplicationSource }))
                    }
                    className={`${selectClass} shadow-[0_18px_48px_rgba(99,102,241,0.35)]`}
                  >
                    {SOURCE_DETAILS.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-slate-900 text-slate-50 dark:bg-slate-900 dark:text-slate-50">
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className={helperTextClass}>Dari mana kamu menemukan lowongan ini.</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className={textareaClass}
                  placeholder="Catatan penting: misal jadwal interview atau contact HR."
                />
              </div>
              {errorMessage ? (
                <p className="rounded-2xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 dark:text-rose-200">
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
