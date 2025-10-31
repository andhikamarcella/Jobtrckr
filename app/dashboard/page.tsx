"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Sun, Moon, LogOut, Plus, Download } from "lucide-react";

type ApplicationStatus =
  | "waiting"
  | "screening"
  | "mcu"
  | "interview user"
  | "psikotes"
  | "tes online"
  | "training"
  | "tes kesehatan"
  | "offering"
  | "rejected"
  | "hired";

type ApplicationSource =
  | "LinkedIn"
  | "Email"
  | "Website"
  | "Disnaker"
  | "Instagram"
  | "Teman/Keluarga"
  | "Lainnya";

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

const STATUS_ORDER: ApplicationStatus[] = [
  "waiting",
  "screening",
  "mcu",
  "interview user",
  "psikotes",
  "tes online",
  "training",
  "tes kesehatan",
  "offering",
  "rejected",
  "hired",
];

const SOURCE_ORDER: ApplicationSource[] = [
  "LinkedIn",
  "Email",
  "Website",
  "Disnaker",
  "Instagram",
  "Teman/Keluarga",
  "Lainnya",
];

export default function DashboardPage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<ApplicationStatus | "all">("all");
  const [isDark, setIsDark] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate] = useState("");
  const [form, setForm] = useState<{
    company: string;
    position: string;
    applied_at: string;
    status: ApplicationStatus;
    source: ApplicationSource;
    notes: string;
  }>({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting",
    source: "LinkedIn",
    notes: "",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const fetchData = async () => {
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
        setApplications(data as Application[]);
      }
    };

    fetchData();
  }, []);

  const filteredApplications =
    filteredStatus === "all"
      ? applications
      : applications.filter((a) => a.status === filteredStatus);

  const countsByStatus: Record<ApplicationStatus, number> = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }),
    {} as Record<ApplicationStatus, number>
  );

  const countsBySource: Record<ApplicationSource, number> = SOURCE_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.source === s).length }),
    {} as Record<ApplicationSource, number>
  );

  const totalApplications = applications.length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const openModal = () => {
    setForm({
      company: "",
      position: "",
      applied_at: new Date().toISOString().slice(0, 10),
      status: "waiting",
      source: "LinkedIn",
      notes: "",
    });
    setErrorCreate("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = async () => {
    setLoadingCreate(true);
    setErrorCreate("");

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      setErrorCreate("Session habis, silakan login ulang.");
      setLoadingCreate(false);
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

    const { data, error } = await supabase.from("applications").insert(payload).select();

    if (error) {
      console.error("insert error", error);
      setErrorCreate(error.message);
      setLoadingCreate(false);
      return;
    }

    // re-fetch
    const { data: newData } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("applied_at", { ascending: false });

    if (newData) {
      setApplications(newData as Application[]);
    }

    setLoadingCreate(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    await supabase.from("applications").delete().eq("id", id).eq("user_id", authData.user.id);

    const { data: newData } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("applied_at", { ascending: false });

    if (newData) {
      setApplications(newData as Application[]);
    }
  };

  const exportToExcel = async () => {
    if (applications.length === 0) return;
    const rows = applications.map((a) => ({
      Company: a.company,
      Position: a.position,
      AppliedAt: a.applied_at,
      Status: a.status,
      Source: a.source,
      Notes: a.notes || "",
    }));

    const csvHeader = "Company,Position,AppliedAt,Status,Source,Notes\n";
    const csvRows = rows
      .map((r) =>
        [
          r.Company,
          r.Position,
          r.AppliedAt,
          r.Status,
          r.Source,
          r.Notes.replace(/,/g, ";"),
        ].join(",")
      )
      .join("\n");
    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobtrackr-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-10">
      {/* top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-4 bg-slate-950/60 backdrop-blur border-b border-slate-800">
        <h1 className="text-2xl md:text-3xl font-bold truncate">
          Hi, {userEmail || "Guest"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark((v) => !v)}
            className="w-10 h-10 rounded-full bg-slate-900/60 border border-slate-700 flex items-center justify-center shadow-[0_0_20px_rgba(15,23,42,0.5)]"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={exportToExcel}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 transition"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button
            onClick={openModal}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/40 hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* mobile actions */}
      <div className="sm:hidden px-4 mt-4 flex gap-3">
        <button
          onClick={exportToExcel}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={openModal}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/40"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* analytics */}
      <main className="px-4 mt-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {STATUS_ORDER.slice(0, 4).map((status, idx) => (
            <div
              key={status}
              className="rounded-3xl bg-slate-900/40 border border-slate-700/40 p-4 shadow-[0_0_50px_rgba(15,23,42,0.25)]"
            >
              <p className="text-sm text-slate-300">
                {status === "waiting"
                  ? "semua lamaran kamu"
                  : status === "screening"
                  ? "sedang di-screening"
                  : status === "mcu"
                  ? "cek kesehatan awal"
                  : status === "interview user"
                  ? "siap interview"
                  : status === "psikotes"
                  ? "uji psikologi"
                  : status === "tes online"
                  ? "tes via web"
                  : status === "training"
                  ? "tahap pelatihan"
                  : status === "tes kesehatan"
                  ? "tes ulang"
                  : status === "offering"
                  ? "tawaran kerja"
                  : status === "rejected"
                  ? "jangan nyerah 👾"
                  : "selamat 🎉"}
              </p>
              <p className="text-4xl font-bold mt-1">{countsByStatus[status]}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {SOURCE_ORDER.map((src) => (
            <div
              key={src}
              className="rounded-3xl bg-slate-900/40 border border-slate-700/40 p-4 flex items-center justify-between shadow-[0_0_40px_rgba(15,23,42,0.2)]"
            >
              <div>
                <p className="text-sm text-slate-100">{src}</p>
              </div>
              <p className="text-2xl font-bold text-slate-50">{countsBySource[src]}</p>
            </div>
          ))}
        </div>

        {/* filter pills */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          <FilterPill
            label="All"
            active={filteredStatus === "all"}
            onClick={() => setFilteredStatus("all")}
          />
          {STATUS_ORDER.map((st) => (
            <FilterPill
              key={st}
              label={
                st === "interview user"
                  ? "Interview User"
                  : st === "tes kesehatan"
                  ? "Tes Kesehatan"
                  : st === "tes online"
                  ? "Tes Online"
                  : st === "mcu"
                  ? "MCU"
                  : st === "psikotes"
                  ? "Psikotes"
                  : st === "waiting"
                  ? "Waiting"
                  : st === "training"
                  ? "Training"
                  : st === "screening"
                  ? "Screening"
                  : st === "offering"
                  ? "Offering"
                  : st === "rejected"
                  ? "Rejected"
                  : "Hired"
              }
              active={filteredStatus === st}
              onClick={() => setFilteredStatus(st)}
            />
          ))}
        </div>

        {/* table */}
        <div className="rounded-3xl bg-slate-950/40 border border-slate-700/40 shadow-[0_0_40px_rgba(15,23,42,0.25)] overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr,1.2fr,0.7fr,0.8fr,0.8fr,0.6fr] gap-4 px-6 py-4 text-sm text-slate-200 bg-slate-950/30 border-b border-slate-700/40">
            <div>Company</div>
            <div>Position</div>
            <div>Applied</div>
            <div>Status</div>
            <div>Source</div>
            <div className="text-center">Actions</div>
          </div>
          <div className="divide-y divide-slate-800/40">
            {filteredApplications.length === 0 ? (
              <p className="px-6 py-6 text-slate-400 text-sm">No applications.</p>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="grid md:grid-cols-[1.2fr,1.2fr,0.7fr,0.8fr,0.8fr,0.6fr] gap-4 px-6 py-4 text-sm items-center"
                >
                  <div className="font-medium text-slate-50">{app.company}</div>
                  <div className="text-slate-200">{app.position}</div>
                  <div className="text-slate-300">{app.applied_at}</div>
                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-800/60 text-xs capitalize">
                      {app.status}
                    </span>
                  </div>
                  <div className="text-slate-200">{app.source}</div>
                  <div className="flex gap-2 justify-center">
                    <button className="px-3 py-1 rounded-full bg-slate-700 text-xs">Edit</button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="px-3 py-1 rounded-full bg-rose-500 text-xs text-slate-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-950/90 border border-slate-700/60 shadow-[0_0_60px_rgba(99,102,241,0.35)] p-6 animate-[fadeIn_0.2s_ease-out]">
            <h2 className="text-xl font-semibold mb-4 text-slate-50">New Application</h2>
            <div className="space-y-4 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-sm mb-1 text-slate-200">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Nama perusahaan"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Nama perusahaan tempat kamu melamar.
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-200">Position</label>
                <input
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Contoh: Admin Gudang / IT Support"
                />
                <p className="text-xs text-slate-400 mt-1">Jabatan atau role yang ingin kamu isi.</p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-200">Applied at</label>
                <input
                  type="date"
                  value={form.applied_at}
                  onChange={(e) => setForm((f) => ({ ...f, applied_at: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <p className="text-xs text-slate-400 mt-1">Pilih tanggal saat kamu mengirim lamaran.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-200">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as ApplicationStatus }))
                    }
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-slate-50">
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Pilih tahapan terbaru proses rekrutmen kamu.
                  </p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-200">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source: e.target.value as ApplicationSource }))
                    }
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {SOURCE_ORDER.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-slate-50">
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Dari mana kamu menemukan lowongan ini.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-200">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[110px]"
                  placeholder="Catatan penting seputar progres atau hal yang perlu diingat."
                />
              </div>
              {errorCreate ? (
                <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/40 rounded-2xl px-3 py-2">
                  {errorCreate}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-2xl border border-slate-600 text-slate-50 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loadingCreate}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-slate-50 font-semibold shadow-lg shadow-indigo-500/40 disabled:opacity-60"
              >
                {loadingCreate ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full border text-sm capitalize transition ${
        active
          ? "bg-indigo-500 text-slate-50 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          : "bg-slate-950/30 text-slate-100 border-slate-700/40 hover:bg-slate-900/60"
      }`}
    >
      {label}
    </button>
  );
}
