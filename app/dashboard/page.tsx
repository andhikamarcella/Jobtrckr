"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SunIcon, MoonIcon } from "@/lib/heroicons-sun-moon";

type StatusType =
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

type SourceType =
  | "linkedin"
  | "email"
  | "website"
  | "disnaker"
  | "instagram"
  | "teman-keluarga"
  | "lainnya";

type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: StatusType;
  notes: string | null;
  source: SourceType | null;
};

const STATUS_FILTERS: { value: StatusType | "all"; label: string }[] = [
  { value: "all", label: "all" },
  { value: "waiting", label: "waiting" },
  { value: "screening", label: "screening" },
  { value: "mcu", label: "mcu" },
  { value: "interview-user", label: "interview user" },
  { value: "psikotes", label: "psikotes" },
  { value: "tes-online", label: "tes online" },
  { value: "training", label: "training" },
  { value: "tes-kesehatan", label: "tes kesehatan" },
  { value: "offering", label: "offering" },
  { value: "rejected", label: "rejected" },
  { value: "hired", label: "hired" },
];

const SOURCES: { value: SourceType; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "disnaker", label: "Disnaker" },
  { value: "instagram", label: "Instagram" },
  { value: "teman-keluarga", label: "Teman/Keluarga" },
  { value: "lainnya", label: "Lainnya" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filter, setFilter] = useState<"all" | StatusType>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [form, setForm] = useState({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting" as StatusType,
    notes: "",
    source: "linkedin" as SourceType,
  });

  const isDark = theme === "dark";
  const liveRegionRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "transition",
        prefersReducedMotion ? "" : "background-color 500ms ease, color 500ms ease"
      );
      document.documentElement.dataset.theme = theme;
    }
  }, [theme, prefersReducedMotion]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/");
        return;
      }
      setUserEmail(data.user.email || "");
      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", data.user.id)
        .order("applied_at", { ascending: false });
      setApplications((apps || []) as ApplicationRecord[]);
    };
    load();
  }, [router]);

  const filteredApps = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Menampilkan ${filteredApps.length} aplikasi untuk filter ${filter}.`;
    }
  }, [filteredApps.length, filter]);

  const analytics = useMemo(() => {
    const count = (s: StatusType) => applications.filter((a) => a.status === s).length;
    return {
      total: applications.length,
      waiting: count("waiting"),
      screening: count("screening"),
      mcu: count("mcu"),
      interviewUser: count("interview-user"),
      psikotes: count("psikotes"),
      tesOnline: count("tes-online"),
      training: count("training"),
      tesKesehatan: count("tes-kesehatan"),
      offering: count("offering"),
      rejected: count("rejected"),
      hired: count("hired"),
    };
  }, [applications]);

  const bySource = useMemo(() => {
    const base: Record<SourceType, number> = {
      linkedin: 0,
      email: 0,
      website: 0,
      disnaker: 0,
      instagram: 0,
      "teman-keluarga": 0,
      lainnya: 0,
    };
    applications.forEach((a) => {
      const s = (a.source || "lainnya") as SourceType;
      base[s] = (base[s] || 0) + 1;
    });
    return base;
  }, [applications]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      company: "",
      position: "",
      applied_at: new Date().toISOString().slice(0, 10),
      status: "waiting",
      notes: "",
      source: "linkedin",
    });
    setShowModal(true);
  };

  const openEdit = (app: ApplicationRecord) => {
    setEditingId(app.id);
    setForm({
      company: app.company,
      position: app.position,
      applied_at: app.applied_at,
      status: app.status,
      notes: app.notes || "",
      source: (app.source as SourceType) || "linkedin",
    });
    setShowModal(true);
  };

  const saveApp = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;
    const payload = {
      user_id: data.user.id,
      company: form.company.trim(),
      position: form.position.trim(),
      applied_at: form.applied_at,
      status: form.status,
      notes: form.notes,
      source: form.source,
    };
    if (editingId) {
      const { data: updated } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", editingId)
        .select();
      if (updated) {
        setApplications((prev) => prev.map((p) => (p.id === editingId ? (updated[0] as any) : p)));
      }
    } else {
      const { data: inserted } = await supabase.from("applications").insert(payload).select();
      if (inserted) {
        setApplications((prev) => [inserted[0] as any, ...prev]);
      }
    }
    setShowModal(false);
    setEditingId(null);
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Hapus lamaran ini?")) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApplications((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const exportCSV = async () => {
    setLoadingExport(true);
    try {
      const rows = [
        ["Company", "Position", "Applied At", "Status", "Source", "Notes"],
        ...applications.map((a) => [
          a.company,
          a.position,
          a.applied_at,
          a.status,
          a.source || "",
          (a.notes || "").replace(/\n/g, " "),
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jobtrackr.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  const baseFieldClass =
    "w-full px-4 py-2 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:outline-none";
  const fieldTone = isDark
    ? "bg-transparent border border-slate-600/60 text-slate-100 placeholder:text-slate-500"
    : "bg-white/85 border border-slate-300 text-slate-900 placeholder:text-slate-400";
  const motionLift = prefersReducedMotion ? "" : "transition-transform duration-300 hover:-translate-y-[1px]";
  const fieldClass = `${baseFieldClass} ${fieldTone} ${motionLift}`;
  const textAreaClass = `${fieldClass} min-h-[96px]`;
  const selectBase =
    "w-full px-4 py-2 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:outline-none appearance-none";
  const selectTone = isDark
    ? "bg-gradient-to-r from-slate-900/75 via-slate-900/35 to-slate-900/65 border border-slate-600/60 text-slate-100 shadow-[0_18px_45px_rgba(59,130,246,.35)]"
    : "bg-gradient-to-r from-white via-slate-100 to-slate-200 border border-slate-300 text-slate-900 shadow-[0_22px_45px_rgba(15,23,42,.12)]";
  const selectClass = `${selectBase} ${selectTone} ${prefersReducedMotion ? "" : "transition-transform duration-300 hover:-translate-y-[1px]"}`;
  const sourceSelectClass = `${selectClass} ring-1 ring-blue-400/40`;

  return (
    <div
      className={`${
        isDark
          ? "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
          : "min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900"
      } ${prefersReducedMotion ? "" : "transition-colors duration-700 ease-out"}`}
    >
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-full focus:bg-blue-600 focus:text-white"
      >
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-30 backdrop-blur border-b ${
          isDark ? "bg-slate-950/80 border-slate-700/30" : "bg-white/85 border-slate-200/60"
        } ${prefersReducedMotion ? "" : "transition-colors duration-500"}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">Hi, {userEmail}</h1>
            <p className="text-xs opacity-70">Pantau lamaran kamu di sini.</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                prefersReducedMotion ? "" : "transition-all duration-500 hover:-translate-y-1 active:scale-95"
              } ${
                isDark
                  ? "bg-slate-900/60 border-slate-600/60 shadow-[0_10px_30px_rgba(59,130,246,.4)]"
                  : "bg-white border-slate-300 shadow-[0_10px_30px_rgba(59,130,246,.25)]"
              }`}
              aria-label="Toggle theme"
              aria-pressed={isDark}
            >
              {isDark ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-slate-800" />}
            </button>
            <button
              onClick={exportCSV}
              className="btn-primary bg-emerald-500 hover:bg-emerald-600 from-emerald-500 to-emerald-500 shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              aria-busy={loadingExport}
              aria-live="polite"
            >
              {loadingExport ? "Export..." : "Export to Excel"}
            </button>
            <button
              onClick={openCreate}
              className={`btn-primary ${
                prefersReducedMotion ? "" : "hover:shadow-[0_24px_70px_rgba(99,102,241,.45)]"
              }`}
            >
              + Add Application
            </button>
            <button
              onClick={logout}
              className={
                isDark
                  ? "btn-secondary"
                  : "btn-secondary bg-gradient-to-r from-slate-200/90 via-slate-100/90 to-white text-slate-900 border-slate-300 shadow-[0_15px_40px_rgba(148,163,184,.35)] hover:shadow-[0_22px_55px_rgba(148,163,184,.55)]"
              }
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main id="dashboard-content" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <p ref={liveRegionRef} className="sr-only" aria-live="polite" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalyticsCard dark={isDark} label="Total Applications" value={analytics.total} desc="semua lamaran kamu" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Waiting" value={analytics.waiting} desc="menunggu jawaban" accent="dark:text-amber-200 text-amber-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Screening" value={analytics.screening} desc="sedang di-screening" accent="dark:text-sky-200 text-sky-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Interview User" value={analytics.interviewUser} desc="siap interview" accent="dark:text-blue-200 text-blue-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Psikotes" value={analytics.psikotes} desc="uji psikologi" accent="dark:text-purple-200 text-purple-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Tes Online" value={analytics.tesOnline} desc="tes via web" accent="dark:text-cyan-200 text-cyan-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Training" value={analytics.training} desc="tahap pelatihan" accent="dark:text-lime-200 text-lime-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="MCU" value={analytics.mcu} desc="cek kesehatan awal" accent="dark:text-pink-200 text-pink-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Tes Kesehatan" value={analytics.tesKesehatan} desc="tes ulang" accent="dark:text-emerald-200 text-emerald-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Offering" value={analytics.offering} desc="tawaran kerja" accent="dark:text-orange-200 text-orange-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Rejected" value={analytics.rejected} desc="jangan nyerah 🫂" accent="dark:text-red-200 text-red-600" prefersReducedMotion={prefersReducedMotion} />
          <AnalyticsCard dark={isDark} label="Hired" value={analytics.hired} desc="selamat 🎉" accent="dark:text-green-200 text-green-600" prefersReducedMotion={prefersReducedMotion} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SourceCard dark={isDark} label="LinkedIn" value={bySource.linkedin} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Email" value={bySource.email} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Website" value={bySource.website} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Disnaker" value={bySource.disnaker} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Instagram" value={bySource.instagram} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Teman/Keluarga" value={bySource["teman-keluarga"]} prefersReducedMotion={prefersReducedMotion} />
          <SourceCard dark={isDark} label="Lainnya" value={bySource.lainnya} prefersReducedMotion={prefersReducedMotion} />
        </div>

        <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter status aplikasi">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value as any)}
              className={`px-4 py-1 rounded-full text-sm capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                prefersReducedMotion ? "" : "transition-all duration-300 hover:-translate-y-1 active:scale-95"
              } ${
                filter === s.value
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-glow"
                  : isDark
                  ? "border border-slate-600/40 text-slate-100 hover:bg-slate-800/40"
                  : "border border-slate-300 text-slate-900 hover:bg-slate-200"
              }`}
              role="tab"
              aria-selected={filter === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div
          className={`hidden lg:block rounded-2xl overflow-hidden backdrop-blur shadow-glass ${
            prefersReducedMotion ? "" : "transition-all duration-500"
          } ${isDark ? "bg-slate-900/40 border border-slate-700/40" : "bg-white/95 border border-slate-200"}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={isDark ? "bg-slate-900/60" : "bg-slate-200"}>
                <tr>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Position</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Applied</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Source</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Notes</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      No applications.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className={isDark ? "border-t border-slate-700/20" : "border-t border-slate-200"}>
                      <td className="px-4 py-3">{app.company}</td>
                      <td className="px-4 py-3">{app.position}</td>
                      <td className="px-4 py-3">{app.applied_at}</td>
                      <td className="px-4 py-3">
                        <span className={statusClass(app.status)}>{app.status}</span>
                      </td>
                      <td className="px-4 py-3">{app.source ? sourceLabel(app.source) : "-"}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{app.notes}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => openEdit(app)}
                          className={`px-2 py-1 text-xs rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                            prefersReducedMotion ? "" : "transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                          } ${
                            isDark
                              ? "bg-gradient-to-r from-slate-800/70 via-slate-800/40 to-slate-800/70 text-slate-100 shadow-[0_14px_35px_rgba(15,23,42,.45)] hover:shadow-[0_18px_45px_rgba(59,130,246,.35)]"
                              : "bg-gradient-to-r from-slate-200 via-slate-100 to-white text-slate-900 shadow-[0_14px_30px_rgba(148,163,184,.35)] hover:shadow-[0_20px_45px_rgba(148,163,184,.45)]"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteApp(app.id)}
                          className={`px-2 py-1 text-xs rounded-xl bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
                            prefersReducedMotion ? "" : "transition-all duration-300 hover:from-red-500 hover:to-rose-500 hover:-translate-y-0.5 active:scale-95"
                          }`}
                          aria-label={`Hapus aplikasi ${app.company}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          {filteredApps.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No applications.</div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className={`${
                  isDark ? "bg-slate-900/40 border border-slate-700/30" : "bg-white/95 border border-slate-200"
                } ${
                  prefersReducedMotion ? "" : "transition-transform duration-300 hover:-translate-y-1"
                } backdrop-blur rounded-3xl p-4 shadow-glass space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{app.company}</div>
                    <div className="text-xs opacity-70">{app.position}</div>
                    <div className="text-[10px] opacity-50 mt-1">Applied: {app.applied_at}</div>
                    <div className="text-[10px] opacity-50 mt-1">Source: {app.source ? sourceLabel(app.source) : "-"}</div>
                  </div>
                  <span className={statusChip(app.status)}>{app.status}</span>
                </div>
                {app.notes ? <p className="text-xs opacity-80 leading-relaxed">{app.notes}</p> : null}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(app)}
                    className={`px-3 py-1 text-xs rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                      prefersReducedMotion ? "" : "transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                    } ${
                      isDark
                        ? "bg-gradient-to-r from-slate-800/70 via-slate-800/40 to-slate-800/70 text-slate-100 shadow-[0_14px_35px_rgba(15,23,42,.45)] hover:shadow-[0_18px_45px_rgba(59,130,246,.35)]"
                        : "bg-gradient-to-r from-slate-200 via-slate-100 to-white text-slate-900 shadow-[0_14px_30px_rgba(148,163,184,.35)] hover:shadow-[0_20px_45px_rgba(148,163,184,.45)]"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteApp(app.id)}
                    className={`px-3 py-1 text-xs rounded-xl bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
                      prefersReducedMotion ? "" : "transition-all duration-300 hover:from-red-500 hover:to-rose-500 hover:-translate-y-0.5 active:scale-95"
                    }`}
                    aria-label={`Hapus aplikasi ${app.company}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div
            className={`${
              isDark ? "bg-slate-950 border-slate-700/50" : "bg-white border-slate-200"
            } ${prefersReducedMotion ? "" : "transition-transform duration-300 hover:-translate-y-1"} rounded-2xl p-4 w-full max-w-md shadow-glass border`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-dialog-title"
          >
            <h2 id="application-dialog-title" className="text-lg font-semibold mb-2">
              {editingId ? "Edit Application" : "New Application"}
            </h2>
            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="company" className="text-sm font-medium block mb-1">
                  Company
                </label>
                <input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className={fieldClass}
                  aria-describedby="company-hint"
                />
                <p id="company-hint" className="text-xs opacity-60 mt-1">
                  Nama perusahaan tempat kamu melamar.
                </p>
              </div>
              <div>
                <label htmlFor="position" className="text-sm font-medium block mb-1">
                  Position
                </label>
                <input
                  id="position"
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  className={fieldClass}
                  aria-describedby="position-hint"
                />
                <p id="position-hint" className="text-xs opacity-60 mt-1">
                  Jabatan atau role yang ingin kamu isi.
                </p>
              </div>
              <div>
                <label htmlFor="applied-at" className="text-sm font-medium block mb-1">
                  Applied at
                </label>
                <input
                  id="applied-at"
                  type="date"
                  value={form.applied_at}
                  onChange={(e) => setForm((p) => ({ ...p, applied_at: e.target.value }))}
                  className={fieldClass}
                  aria-describedby="applied-at-hint"
                />
                <p id="applied-at-hint" className="text-xs opacity-60 mt-1">
                  Pilih tanggal saat kamu mengirim lamaran.
                </p>
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium block mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusType }))}
                  className={`${selectClass} cursor-pointer`}
                  aria-describedby="status-hint"
                >
                  {STATUS_FILTERS.filter((x) => x.value !== "all").map((x) => (
                    <option
                      key={x.value}
                      value={x.value}
                      className={isDark ? "bg-slate-900 text-slate-50" : "bg-white text-slate-900"}
                    >
                      {x.label}
                    </option>
                  ))}
                </select>
                <p id="status-hint" className="text-xs opacity-60 mt-1">
                  Pilih tahapan terbaru proses rekrutmen kamu.
                </p>
              </div>
              <div>
                <label htmlFor="source" className="text-sm font-medium block mb-1">
                  Source
                </label>
                <select
                  id="source"
                  value={form.source}
                  onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as SourceType }))}
                  className={`${sourceSelectClass} cursor-pointer`}
                  aria-describedby="source-hint"
                >
                  {SOURCES.map((x) => (
                    <option
                      key={x.value}
                      value={x.value}
                      className={isDark ? "bg-slate-900 text-slate-50" : "bg-white text-slate-900"}
                    >
                      {x.label}
                    </option>
                  ))}
                </select>
                <p id="source-hint" className="text-xs opacity-60 mt-1">
                  Dari mana kamu menemukan lowongan ini.
                </p>
              </div>
              <div>
                <label htmlFor="notes" className="text-sm font-medium block mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className={textAreaClass}
                  aria-describedby="notes-hint"
                />
                <p id="notes-hint" className="text-xs opacity-60 mt-1">
                  Catatan penting seputar progres atau hal yang perlu diingat.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-slate-600/40 text-sm">
                Cancel
              </button>
              <button onClick={saveApp} className="px-4 py-2 rounded-md bg-blue-500 text-sm">
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnalyticsCard({
  dark,
  label,
  value,
  desc,
  accent,
  prefersReducedMotion,
}: {
  dark: boolean;
  label: string;
  value: number;
  desc: string;
  accent?: string;
  prefersReducedMotion: boolean;
}) {
  return (
    <div
      className={`${
        dark
          ? "bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/10 border border-slate-700/50"
          : "bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-200"
      } rounded-3xl p-4 backdrop-blur shadow-glass ${
        prefersReducedMotion ? "" : "transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(59,130,246,.35)] active:scale-95"
      }`}
    >
      <div className="text-xs opacity-75 dark:text-slate-200 text-slate-600">{label}</div>
      <div className={`text-2xl font-bold mt-2 ${accent || ""}`}>{value}</div>
      <div className="text-[10px] mt-1 dark:text-slate-400 text-slate-500">{desc}</div>
    </div>
  );
}

function SourceCard({
  dark,
  label,
  value,
  prefersReducedMotion,
}: {
  dark: boolean;
  label: string;
  value: number;
  prefersReducedMotion: boolean;
}) {
  return (
    <div
      className={`${
        dark
          ? "bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/5 border border-slate-800/40 shadow-[0_22px_55px_rgba(59,130,246,.35)]"
          : "bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-200 shadow-[0_20px_45px_rgba(15,23,42,.1)]"
      } rounded-2xl p-3 border flex items-center justify-between ${
        prefersReducedMotion ? "" : "transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(59,130,246,.25)] active:scale-95"
      }`}
    >
      <div className="text-xs opacity-70 dark:text-slate-200 text-slate-600">{label}</div>
      <div className="text-base font-semibold dark:text-white text-slate-900">{value}</div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "hired")
    return "badge bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 capitalize";
  if (status === "rejected")
    return "badge bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-200 capitalize";
  if (status === "interview-user")
    return "badge bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 capitalize";
  if (status === "screening")
    return "badge bg-sky-200 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200 capitalize";
  if (status === "psikotes")
    return "badge bg-purple-200 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200 capitalize";
  if (status === "tes-online")
    return "badge bg-cyan-200 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200 capitalize";
  if (status === "training")
    return "badge bg-lime-200 text-lime-800 dark:bg-lime-500/20 dark:text-lime-200 capitalize";
  if (status === "mcu")
    return "badge bg-pink-200 text-pink-800 dark:bg-pink-500/20 dark:text-pink-200 capitalize";
  if (status === "tes-kesehatan")
    return "badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 capitalize";
  if (status === "offering")
    return "badge bg-orange-200 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200 capitalize";
  return "badge bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 capitalize";
}

function statusChip(status: string) {
  if (status === "hired")
    return "px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200 text-[10px] capitalize";
  if (status === "rejected")
    return "px-3 py-1 rounded-full bg-red-200 text-red-900 dark:bg-red-500/20 dark:text-red-200 text-[10px] capitalize";
  if (status === "interview-user")
    return "px-3 py-1 rounded-full bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200 text-[10px] capitalize";
  if (status === "screening")
    return "px-3 py-1 rounded-full bg-sky-200 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200 text-[10px] capitalize";
  if (status === "psikotes")
    return "px-3 py-1 rounded-full bg-purple-200 text-purple-900 dark:bg-purple-500/20 dark:text-purple-200 text-[10px] capitalize";
  if (status === "tes-online")
    return "px-3 py-1 rounded-full bg-cyan-200 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200 text-[10px] capitalize";
  if (status === "training")
    return "px-3 py-1 rounded-full bg-lime-200 text-lime-900 dark:bg-lime-500/20 dark:text-lime-200 text-[10px] capitalize";
  if (status === "mcu")
    return "px-3 py-1 rounded-full bg-pink-200 text-pink-900 dark:bg-pink-500/20 dark:text-pink-200 text-[10px] capitalize";
  if (status === "tes-kesehatan")
    return "px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200 text-[10px] capitalize";
  if (status === "offering")
    return "px-3 py-1 rounded-full bg-orange-200 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200 text-[10px] capitalize";
  return "px-3 py-1 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 text-[10px] capitalize";
}

function sourceLabel(src: SourceType) {
  const f = SOURCES.find((s) => s.value === src);
  return f ? f.label : src;
}
