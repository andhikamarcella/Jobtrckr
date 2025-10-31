"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

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

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

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
    "w-full px-3 py-2 rounded-md text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30";
  const themeFieldClass = isDark
    ? "bg-slate-900/50 border border-slate-700/50 text-slate-100 placeholder:text-slate-400"
    : "bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500";
  const fieldClass = `${baseFieldClass} ${themeFieldClass}`;
  const textAreaClass = `${fieldClass} min-h-[70px]`;

  return (
    <div className={isDark ? "min-h-screen bg-slate-950 text-slate-50" : "min-h-screen bg-slate-100 text-slate-900"}>
      <header
        className={`sticky top-0 z-30 backdrop-blur border-b ${
          isDark ? "bg-slate-950/80 border-slate-700/30" : "bg-white/80 border-slate-200/60"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">Hi, {userEmail}</h1>
            <p className="text-xs opacity-70">Pantau lamaran kamu di sini.</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-slate-900/50 border border-slate-600/60 flex items-center justify-center transition-transform duration-200 hover:-translate-y-1 active:scale-95"
            >
              {isDark ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-slate-800" />}
            </button>
            <button
              onClick={exportCSV}
              className="btn-primary bg-emerald-500 hover:bg-emerald-600 from-emerald-500 to-emerald-500 shadow-glow"
            >
              {loadingExport ? "Export..." : "Export to Excel"}
            </button>
            <button onClick={openCreate} className="btn-primary">
              + Add Application
            </button>
            <button
              onClick={logout}
              className={isDark ? "btn-secondary" : "btn-secondary bg-white text-slate-900 border-slate-300"}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalyticsCard dark={isDark} label="Total Applications" value={analytics.total} desc="semua lamaran kamu" />
          <AnalyticsCard dark={isDark} label="Waiting" value={analytics.waiting} desc="menunggu jawaban" accent="text-amber-200" />
          <AnalyticsCard dark={isDark} label="Screening" value={analytics.screening} desc="sedang di-screening" accent="text-sky-200" />
          <AnalyticsCard dark={isDark} label="Interview User" value={analytics.interviewUser} desc="siap interview" accent="text-blue-200" />
          <AnalyticsCard dark={isDark} label="Psikotes" value={analytics.psikotes} desc="uji psikologi" accent="text-purple-200" />
          <AnalyticsCard dark={isDark} label="Tes Online" value={analytics.tesOnline} desc="tes via web" accent="text-cyan-200" />
          <AnalyticsCard dark={isDark} label="Training" value={analytics.training} desc="tahap pelatihan" accent="text-lime-200" />
          <AnalyticsCard dark={isDark} label="MCU" value={analytics.mcu} desc="cek kesehatan awal" accent="text-pink-200" />
          <AnalyticsCard dark={isDark} label="Tes Kesehatan" value={analytics.tesKesehatan} desc="tes ulang" accent="text-emerald-200" />
          <AnalyticsCard dark={isDark} label="Offering" value={analytics.offering} desc="tawaran kerja" accent="text-orange-200" />
          <AnalyticsCard dark={isDark} label="Rejected" value={analytics.rejected} desc="jangan nyerah 🫂" accent="text-red-200" />
          <AnalyticsCard dark={isDark} label="Hired" value={analytics.hired} desc="selamat 🎉" accent="text-green-200" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SourceCard dark={isDark} label="LinkedIn" value={bySource.linkedin} />
          <SourceCard dark={isDark} label="Email" value={bySource.email} />
          <SourceCard dark={isDark} label="Website" value={bySource.website} />
          <SourceCard dark={isDark} label="Disnaker" value={bySource.disnaker} />
          <SourceCard dark={isDark} label="Instagram" value={bySource.instagram} />
          <SourceCard dark={isDark} label="Teman/Keluarga" value={bySource["teman-keluarga"]} />
          <SourceCard dark={isDark} label="Lainnya" value={bySource.lainnya} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value as any)}
              className={`px-4 py-1 rounded-full text-sm capitalize transition-transform duration-200 hover:-translate-y-1 active:scale-95 ${
                filter === s.value
                  ? "bg-blue-500 text-white shadow-glow"
                  : isDark
                  ? "border border-slate-600/40"
                  : "border border-slate-300 text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div
          className={`hidden lg:block rounded-2xl overflow-hidden backdrop-blur shadow-glass ${
            isDark ? "bg-slate-900/30 border border-slate-700/30" : "bg-white border border-slate-200"
          }`}
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
                          className={`px-2 py-1 text-xs rounded-md transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 ${
                            isDark ? "bg-slate-700/50 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="px-2 py-1 text-xs rounded-md bg-red-500/80 hover:bg-red-500 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
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
                className={`backdrop-blur rounded-3xl p-4 shadow-glass space-y-3 transition-transform duration-200 hover:-translate-y-1 ${
                  isDark ? "bg-slate-900/40 border border-slate-700/30" : "bg-white border border-slate-200"
                }`}
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
                    className={`px-3 py-1 text-xs rounded-md transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      isDark ? "bg-slate-700/50" : "bg-slate-200 text-slate-900"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteApp(app.id)}
                    className="px-3 py-1 text-xs rounded-md bg-red-500/80 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
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
            className={`rounded-2xl p-4 w-full max-w-md shadow-glass border ${
              isDark ? "bg-slate-950 border-slate-700/50" : "bg-white border-slate-200"
            }`}
          >
            <h2 className="text-lg font-semibold mb-2">{editingId ? "Edit Application" : "New Application"}</h2>
            <div className="space-y-2 mb-4">
              <input
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                placeholder="Company"
                className={fieldClass}
              />
              <input
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                placeholder="Position"
                className={fieldClass}
              />
              <input
                type="date"
                value={form.applied_at}
                onChange={(e) => setForm((p) => ({ ...p, applied_at: e.target.value }))}
                className={fieldClass}
              />
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusType }))}
                className={`${fieldClass} cursor-pointer`}
              >
                {STATUS_FILTERS.filter((x) => x.value !== "all").map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <select
                value={form.source}
                onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as SourceType }))}
                className={`${fieldClass} cursor-pointer`}
              >
                {SOURCES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Notes"
                className={textAreaClass}
              />
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
}: {
  dark: boolean;
  label: string;
  value: number;
  desc: string;
  accent?: string;
}) {
  return (
    <div
      className={
        (dark
          ? "bg-slate-900/50 border border-slate-700/40 "
          : "bg-white/80 border border-slate-200 ") +
        "rounded-3xl p-4 backdrop-blur shadow-glass transition-transform duration-200 hover:-translate-y-1 active:scale-95"
      }
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className={"text-2xl font-bold mt-2 " + (accent || "")}>{value}</div>
      <div className="text-[10px] opacity-50 mt-1">{desc}</div>
    </div>
  );
}

function SourceCard({ dark, label, value }: { dark: boolean; label: string; value: number }) {
  return (
    <div
      className={
        (dark ? "bg-slate-900/40 border-slate-800/40 " : "bg-white border-slate-200 ") +
        "rounded-2xl p-3 border flex items-center justify-between transition-transform duration-200 hover:-translate-y-1 active:scale-95"
      }
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "hired") return "badge bg-emerald-500/20 text-emerald-200 capitalize";
  if (status === "rejected") return "badge bg-red-500/20 text-red-200 capitalize";
  if (status === "interview-user") return "badge bg-blue-500/20 text-blue-200 capitalize";
  if (status === "screening") return "badge bg-sky-500/20 text-sky-200 capitalize";
  if (status === "psikotes") return "badge bg-purple-500/20 text-purple-200 capitalize";
  if (status === "tes-online") return "badge bg-cyan-500/20 text-cyan-200 capitalize";
  if (status === "training") return "badge bg-lime-500/20 text-lime-200 capitalize";
  if (status === "mcu") return "badge bg-pink-500/20 text-pink-200 capitalize";
  if (status === "tes-kesehatan") return "badge bg-emerald-500/20 text-emerald-200 capitalize";
  if (status === "offering") return "badge bg-orange-500/20 text-orange-200 capitalize";
  return "badge bg-amber-500/20 text-amber-200 capitalize";
}

function statusChip(status: string) {
  if (status === "hired") return "px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-[10px] capitalize";
  if (status === "rejected") return "px-3 py-1 rounded-full bg-red-200 text-red-900 text-[10px] capitalize";
  if (status === "interview-user") return "px-3 py-1 rounded-full bg-blue-200 text-blue-900 text-[10px] capitalize";
  if (status === "screening") return "px-3 py-1 rounded-full bg-sky-200 text-sky-900 text-[10px] capitalize";
  if (status === "psikotes") return "px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-[10px] capitalize";
  if (status === "tes-online") return "px-3 py-1 rounded-full bg-cyan-200 text-cyan-900 text-[10px] capitalize";
  if (status === "training") return "px-3 py-1 rounded-full bg-lime-200 text-lime-900 text-[10px] capitalize";
  if (status === "mcu") return "px-3 py-1 rounded-full bg-pink-200 text-pink-900 text-[10px] capitalize";
  if (status === "tes-kesehatan") return "px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] capitalize";
  if (status === "offering") return "px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-[10px] capitalize";
  return "px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] capitalize";
}

function sourceLabel(src: SourceType) {
  const f = SOURCES.find((s) => s.value === src);
  return f ? f.label : src;
}
