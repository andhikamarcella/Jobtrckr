"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// tipe aplikasi
type StatusType = "waiting" | "interview" | "rejected" | "hired";
type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: StatusType;
  notes?: string | null;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | StatusType>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [form, setForm] = useState({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting" as StatusType,
    notes: "",
  });
  const [exporting, setExporting] = useState(false);

  // load user + apps
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/");
        return;
      }
      setUserEmail(data.user.email ?? "");

      const { data: appsData, error: appsErr } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", data.user.id)
        .order("applied_at", { ascending: false });

      if (!appsErr && appsData) {
        setApps(appsData as ApplicationRecord[]);
      }
    };
    load();
  }, [router]);

  // filter data
  const filteredApps = useMemo(() => {
    if (activeFilter === "all") return apps;
    return apps.filter((a) => a.status === activeFilter);
  }, [apps, activeFilter]);

  // analytics
  const analytics = useMemo(() => {
    return {
      total: apps.length,
      waiting: apps.filter((a) => a.status === "waiting").length,
      interview: apps.filter((a) => a.status === "interview").length,
      hired: apps.filter((a) => a.status === "hired").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    };
  }, [apps]);

  // handlers
  const openCreate = () => {
    setEditingId(null);
    setForm({
      company: "",
      position: "",
      applied_at: new Date().toISOString().slice(0, 10),
      status: "waiting",
      notes: "",
    });
    setShowForm(true);
  };

  const openEdit = (app: ApplicationRecord) => {
    setEditingId(app.id);
    setForm({
      company: app.company,
      position: app.position,
      applied_at: app.applied_at,
      status: app.status,
      notes: app.notes || "",
    });
    setShowForm(true);
  };

  const saveApplication = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.replace("/");
      return;
    }

    const payload = {
      user_id: userData.user.id,
      company: form.company,
      position: form.position,
      applied_at: form.applied_at,
      status: form.status,
      notes: form.notes,
    };

    // update
    if (editingId) {
      const { data, error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", editingId)
        .select();
      if (!error && data) {
        setApps((prev) => prev.map((p) => (p.id === editingId ? (data[0] as any) : p)));
      }
    } else {
      // create
      const { data, error } = await supabase.from("applications").insert(payload).select();
      if (!error && data) {
        setApps((prev) => [data[0] as any, ...prev]);
      }
    }

    setShowForm(false);
    setEditingId(null);
  };

  const deleteApplication = async (id: string) => {
    const ok = typeof window === "undefined" ? true : window.confirm("Hapus lamaran ini?");
    if (!ok) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApps((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = [
        ["Company", "Position", "Applied At", "Status", "Notes"],
        ...apps.map((a) => [
          a.company,
          a.position,
          a.applied_at,
          a.status,
          (a.notes || "").replace(/\n/g, " "),
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jobtrackr-applications.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const toggleTheme = () => {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  };

  // style base theme
  const isDark = theme === "dark";
  const bgPage = isDark ? "#020617" : "#e2e8f0";
  const textColor = isDark ? "white" : "#0f172a";
  const cardBg = isDark ? "rgba(15,23,42,.55)" : "rgba(255,255,255,.8)";
  const borderColor = isDark ? "rgba(148,163,184,.18)" : "rgba(15,23,42,.12)";

  return (
    <div style={{ minHeight: "100vh", background: bgPage, color: textColor, padding: "1.4rem" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 700 }}>Hi, {userEmail}</h1>
          <p style={{ opacity: isDark ? 0.6 : 0.8 }}>Pantau lamaran kamu di sini.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={toggleTheme} style={btnGhost(isDark)}>
            {isDark ? "Light" : "Dark"}
          </button>
          <button onClick={exportExcel} style={btnGreen(isDark)} disabled={exporting}>
            {exporting ? "Exporting..." : "Export to Excel"}
          </button>
          <button onClick={openCreate} style={btnPrimary(isDark)}>
            + Add Application
          </button>
          <button onClick={logout} style={btnGhost(isDark)}>
            Logout
          </button>
        </div>
      </div>

      {/* analytics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <AnalyticCard
          title="Total Applications"
          value={analytics.total}
          desc="semua lamaran kamu"
          color={isDark ? "#38bdf8" : "#0f172a"}
          isDark={isDark}
        />
        <AnalyticCard
          title="Waiting"
          value={analytics.waiting}
          desc="menunggu jawaban"
          color="#facc15"
          isDark={isDark}
        />
        <AnalyticCard
          title="Interview"
          value={analytics.interview}
          desc="siapkan dirimu"
          color="#38bdf8"
          isDark={isDark}
        />
        <AnalyticCard
          title="Hired"
          value={analytics.hired}
          desc="selamat 🎉"
          color="#22c55e"
          isDark={isDark}
        />
      </div>

      {/* filter */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["all", "waiting", "interview", "rejected", "hired"].map((st) => (
          <button
            key={st}
            onClick={() => setActiveFilter(st as "all" | StatusType)}
            style={st === activeFilter ? pillActive(isDark) : pill(isDark)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* table / cards */}
      <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: "1.1rem", overflow: "hidden" }}>
        {/* desktop table */}
        <div className="desktop-table" style={{ display: "none", minHeight: "120px" }}>{/* will be overwritten by CSS below */}</div>

        {/* table for desktop */}
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th(isDark)}>Company</th>
              <th style={th(isDark)}>Position</th>
              <th style={th(isDark)}>Applied</th>
              <th style={th(isDark)}>Status</th>
              <th style={th(isDark)}>Notes</th>
              <th style={th(isDark)}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "1rem", textAlign: "center", opacity: 0.6 }}>
                  No applications.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} style={tr(isDark)}>
                  <td style={td(isDark)}>{app.company}</td>
                  <td style={td(isDark)}>{app.position}</td>
                  <td style={td(isDark)}>{app.applied_at}</td>
                  <td style={td(isDark)}>
                    <span style={badge(app.status)}>{app.status}</span>
                  </td>
                  <td style={td(isDark)}>{app.notes}</td>
                  <td style={td(isDark)}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button onClick={() => openEdit(app)} style={actionBtn(isDark)}>
                        Edit
                      </button>
                      <button onClick={() => deleteApplication(app.id)} style={deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* mobile cards */}
        <div className="mobile-list" style={mobileList}>
          {filteredApps.length === 0 ? (
            <div style={{ padding: "1rem", opacity: 0.6, textAlign: "center" }}>No applications.</div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.id} style={mobileCard(isDark)}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.company}</div>
                    <div style={{ opacity: 0.6 }}>{app.position}</div>
                  </div>
                  <span style={badge(app.status)}>{app.status}</span>
                </div>
                <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", opacity: 0.6 }}>
                  Applied: {app.applied_at}
                </div>
                {app.notes ? <div style={{ marginTop: "0.4rem" }}>{app.notes}</div> : null}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(app)} style={actionBtn(isDark)}>
                    Edit
                  </button>
                  <button onClick={() => deleteApplication(app.id)} style={deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* modal */}
      {showForm ? (
        <div style={overlayStyle}>
          <div style={modalStyle(isDark)}>
            <h2 style={{ marginBottom: "0.8rem", fontSize: "1.1rem", fontWeight: 600 }}>
              {editingId ? "Edit Application" : "New Application"}
            </h2>
            <p style={{ fontSize: "0.75rem", opacity: 0.5, marginBottom: "0.8rem" }}>
              Isi data lamaran: nama perusahaan, posisi, tanggal apply, dan catatan. Status bisa kamu ganti lagi nanti.
            </p>
            <input
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              placeholder="Company"
              style={inputStyle(isDark)}
            />
            <input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              placeholder="Position"
              style={inputStyle(isDark)}
            />
            <input
              type="date"
              value={form.applied_at}
              onChange={(e) => setForm((p) => ({ ...p, applied_at: e.target.value }))}
              style={inputStyle(isDark)}
            />
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusType }))}
              style={inputStyle(isDark)}
            >
              <option value="waiting">waiting</option>
              <option value="interview">interview</option>
              <option value="rejected">rejected</option>
              <option value="hired">hired</option>
            </select>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Notes..."
              style={{ ...inputStyle(isDark), minHeight: "76px", resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowForm(false)} style={btnGhost(isDark)}>
                Cancel
              </button>
              <button onClick={saveApplication} style={btnPrimary(isDark)}>
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* simple mobile css */}
      <style jsx>{`
        @media (max-width: 768px) {
          table {
            display: none;
          }
          .mobile-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
        }
        @media (min-width: 769px) {
          .mobile-list {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function AnalyticCard({
  title,
  value,
  desc,
  color,
  isDark,
}: {
  title: string;
  value: number;
  desc: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <div
      style={{
        background: isDark
          ? "radial-gradient(circle at top, rgba(15,23,42,.8) 0%, rgba(2,6,23,.3) 90%)"
          : "white",
        border: isDark ? "1px solid rgba(148,163,184,.22)" : "1px solid rgba(15,23,42,.06)",
        borderRadius: "1rem",
        padding: "1rem",
        boxShadow: isDark ? "0 10px 30px rgba(15,23,42,.35)" : "0 6px 12px rgba(15,23,42,.08)",
      }}
    >
      <div style={{ fontSize: "0.8rem", opacity: isDark ? 0.6 : 0.6 }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color, marginTop: "0.3rem" }}>{value}</div>
      <div style={{ fontSize: "0.7rem", marginTop: "0.3rem", opacity: isDark ? 0.5 : 0.7 }}>{desc}</div>
    </div>
  );
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "700px",
};

const mobileList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem",
};

const badge = (status: string): CSSProperties => {
  const base: CSSProperties = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 9999,
    fontSize: "0.7rem",
    textTransform: "capitalize",
  };
  switch (status) {
    case "waiting":
      return { ...base, background: "rgba(250,204,21,.12)", color: "#fde68a" };
    case "interview":
      return { ...base, background: "rgba(59,130,246,.12)", color: "#bfdbfe" };
    case "rejected":
      return { ...base, background: "rgba(248,113,113,.12)", color: "#fecaca" };
    case "hired":
      return { ...base, background: "rgba(34,197,94,.12)", color: "#bbf7d0" };
    default:
      return base;
  }
};

const th = (dark: boolean): CSSProperties => ({
  textAlign: "left",
  padding: "0.75rem 1rem",
  borderBottom: dark ? "1px solid rgba(148,163,184,.15)" : "1px solid rgba(15,23,42,.1)",
  fontSize: "0.75rem",
});

const td = (dark: boolean): CSSProperties => ({
  padding: "0.75rem 1rem",
  borderBottom: dark ? "1px solid rgba(148,163,184,.03)" : "1px solid rgba(15,23,42,.03)",
  fontSize: "0.77rem",
});

const tr = (dark: boolean): CSSProperties => ({
  transition: "background .12s ease",
});

const btnPrimary = (dark: boolean): CSSProperties => ({
  background: dark ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)" : "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "0.6rem",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: 500,
  boxShadow: dark ? "0 0 18px rgba(99,102,241,.45)" : "none",
});

const btnGreen = (dark: boolean): CSSProperties => ({
  background: dark ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "0.6rem",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: 500,
});

const btnGhost = (dark: boolean): CSSProperties => ({
  background: dark ? "rgba(15,23,42,.2)" : "transparent",
  border: dark ? "1px solid rgba(148,163,184,.25)" : "1px solid rgba(15,23,42,.12)",
  borderRadius: "0.6rem",
  padding: "0.5rem 1rem",
  cursor: "pointer",
});

const pill = (dark: boolean): CSSProperties => ({
  background: dark ? "rgba(15,23,42,.3)" : "rgba(255,255,255,.5)",
  border: dark ? "1px solid rgba(148,163,184,.17)" : "1px solid rgba(15,23,42,.02)",
  borderRadius: 9999,
  padding: "0.25rem 0.85rem",
  cursor: "pointer",
  textTransform: "capitalize",
});

const pillActive = (dark: boolean): CSSProperties => ({
  ...pill(dark),
  background: dark ? "rgba(59,130,246,1)" : "#0f172a",
  color: "white",
  boxShadow: "0 0 14px rgba(59,130,246,.55)",
});

const actionBtn = (dark: boolean): CSSProperties => ({
  background: dark ? "rgba(15,23,42,.5)" : "rgba(240,240,240,1)",
  border: dark ? "1px solid rgba(148,163,184,.4)" : "1px solid rgba(15,23,42,.09)",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: "0.7rem",
  cursor: "pointer",
});

const deleteBtn: CSSProperties = {
  background: "rgba(248,113,113,.15)",
  border: "1px solid rgba(248,113,113,.35)",
  color: "white",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: "0.7rem",
  cursor: "pointer",
};

const mobileCard = (dark: boolean): CSSProperties => ({
  background: dark ? "rgba(15,23,42,.6)" : "white",
  border: dark ? "1px solid rgba(148,163,184,.12)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: "1rem",
  padding: "0.85rem",
  boxShadow: dark ? "0 12px 25px rgba(15,23,42,.35)" : "0 6px 16px rgba(15,23,42,.1)",
});

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,.5)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  zIndex: 50,
};

const modalStyle = (dark: boolean): CSSProperties => ({
  background: dark
    ? "radial-gradient(circle at top, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 100%)"
    : "white",
  border: dark ? "1px solid rgba(148,163,184,.25)" : "1px solid rgba(15,23,42,.1)",
  borderRadius: "1rem",
  padding: "1rem",
  width: "100%",
  maxWidth: "420px",
  boxShadow: dark ? "0 0 25px rgba(59,130,246,.35)" : "0 0 25px rgba(15,23,42,.12)",
});

const inputStyle = (dark: boolean): CSSProperties => ({
  width: "100%",
  background: dark ? "rgba(15,23,42,.25)" : "rgba(226,232,240,1)",
  border: dark ? "1px solid rgba(148,163,184,.28)" : "1px solid rgba(15,23,42,.08)",
  borderRadius: "0.6rem",
  padding: "0.45rem 0.6rem",
  marginBottom: "0.6rem",
  color: dark ? "white" : "#0f172a",
  outline: "none",
});
