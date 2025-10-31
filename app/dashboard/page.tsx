"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | StatusType>("all");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting" as StatusType,
    notes: "",
  });

  // load data
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/");
        return;
      }
      setUserEmail(data.user.email || "");

      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", data.user.id)
        .order("applied_at", { ascending: false });

      setApps((appsData || []) as ApplicationRecord[]);
    };
    load();
  }, [router]);

  const filteredApps = useMemo(() => {
    if (activeFilter === "all") return apps;
    return apps.filter((a) => a.status === activeFilter);
  }, [apps, activeFilter]);

  const analytic = useMemo(() => {
    return {
      total: apps.length,
      waiting: apps.filter((a) => a.status === "waiting").length,
      interview: apps.filter((a) => a.status === "interview").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      hired: apps.filter((a) => a.status === "hired").length,
    };
  }, [apps]);

  const isDark = theme === "dark";
  const pageBg = isDark ? "#020617" : "#f3f4f6";
  const textMain = isDark ? "#ffffff" : "#0f172a";
  const textSub = isDark ? "rgba(255,255,255,.6)" : "rgba(15,23,42,.65)";
  const borderCol = isDark ? "rgba(148,163,184,.14)" : "rgba(15,23,42,.06)";

  const toggleTheme = () => {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  };

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

  const saveApp = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const payload = {
      user_id: userData.user.id,
      company: form.company.trim(),
      position: form.position.trim(),
      applied_at: form.applied_at,
      status: form.status,
      notes: form.notes,
    };

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
      const { data, error } = await supabase.from("applications").insert(payload).select();
      if (!error && data) {
        setApps((prev) => [data[0] as any, ...prev]);
      }
    }

    setShowForm(false);
    setEditingId(null);
  };

  const deleteApp = async (id: string) => {
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

  const exportCSV = async () => {
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

  return (
    <div style={{ minHeight: "100vh", background: pageBg, color: textMain }}>
      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: isDark ? "rgba(2,6,23,.9)" : "rgba(243,244,246,.9)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${borderCol}`,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {/* title */}
          <div style={{ minWidth: "170px", flex: "1 1 auto" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              Hi, {userEmail}
            </h1>
            <p style={{ color: textSub, fontSize: ".78rem" }}>Pantau lamaran kamu di sini.</p>
          </div>
          {/* actions */}
          <div
            style={{
              display: "flex",
              gap: ".55rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {/* icon toggle */}
            <button onClick={toggleTheme} style={iconBtn(isDark)}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <button onClick={exportCSV} style={btnGreen}>
              {exporting ? "Export..." : "Export to Excel"}
            </button>
            <button onClick={openCreate} style={btnPrimary}>
              + Add Application
            </button>
            <button onClick={logout} style={btnGhost(isDark)}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.2rem 1rem 5rem" }}>
        {/* analytics */}
        <div style={analyticsGrid}>
          <AnalyticsCard
            title="Total Applications"
            value={analytic.total}
            desc="semua lamaran kamu"
            glowColor="#38bdf8"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Waiting"
            value={analytic.waiting}
            desc="menunggu jawaban"
            glowColor="#f97316"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Interview"
            value={analytic.interview}
            desc="siapkan dirimu"
            glowColor="#3b82f6"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Hired"
            value={analytic.hired}
            desc="selamat 🎉"
            glowColor="#22c55e"
            isDark={isDark}
          />
        </div>

        {/* filter */}
        <div style={{ display: "flex", gap: ".55rem", marginTop: "1.1rem", flexWrap: "wrap" }}>
          {["all", "waiting", "interview", "rejected", "hired"].map((st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st as any)}
              style={st === activeFilter ? tabActive : tabNormal(isDark)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* desktop table */}
        <div style={tableWrap}>
          <table style={tableStyle(isDark)}>
            <thead>
              <tr>
                <th style={thStyle(isDark)}>Company</th>
                <th style={thStyle(isDark)}>Position</th>
                <th style={thStyle(isDark)}>Applied</th>
                <th style={thStyle(isDark)}>Status</th>
                <th style={thStyle(isDark)}>Notes</th>
                <th style={thStyle(isDark)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem 0", color: textSub }}>
                    No applications.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td style={tdStyle(isDark)}>{app.company}</td>
                    <td style={tdStyle(isDark)}>{app.position}</td>
                    <td style={tdStyle(isDark)}>{app.applied_at}</td>
                    <td style={tdStyle(isDark)}>
                      <span style={statusBadge(app.status)}>{app.status}</span>
                    </td>
                    <td style={tdStyle(isDark)}>{app.notes}</td>
                    <td style={tdStyle(isDark)}>
                      <div style={{ display: "flex", gap: ".35rem" }}>
                        <button onClick={() => openEdit(app)} style={smallBtn(isDark)}>
                          Edit
                        </button>
                        <button onClick={() => deleteApp(app.id)} style={smallDanger}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* mobile cards */}
        <div style={mobileList}>
          {filteredApps.length === 0 ? (
            <div style={{ textAlign: "center", color: textSub, padding: "1.2rem 0" }}>No applications.</div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.id} style={mobileCard(isDark, borderCol)}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{app.company}</div>
                    <div style={{ color: textSub, fontSize: ".8rem" }}>{app.position}</div>
                    <div style={{ color: textSub, fontSize: ".7rem", marginTop: ".35rem" }}>Applied: {app.applied_at}</div>
                  </div>
                  <span style={statusCapsule(app.status)}>{app.status}</span>
                </div>
                {app.notes ? <p style={{ marginTop: ".7rem", lineHeight: 1.4 }}>{app.notes}</p> : null}
                <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem" }}>
                  <button onClick={() => openEdit(app)} style={smallBtn(isDark)}>
                    Edit
                  </button>
                  <button onClick={() => deleteApp(app.id)} style={smallDanger}>
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
        <div style={overlay}>
          <div style={modal(isDark)}>
            <h2 style={{ marginBottom: ".45rem" }}>{editingId ? "Edit Application" : "New Application"}</h2>
            <p style={{ color: textSub, fontSize: ".7rem", marginBottom: ".6rem" }}>
              Isi data lamaran kerja kamu.
            </p>
            <input
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              style={inputStyle(isDark)}
              placeholder="Company"
            />
            <input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              style={inputStyle(isDark)}
              placeholder="Position"
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
              style={{ ...inputStyle(isDark), minHeight: "70px" }}
              placeholder="Notes..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: ".4rem" }}>
              <button onClick={() => setShowForm(false)} style={btnGhost(isDark)}>
                Cancel
              </button>
              <button onClick={saveApp} style={btnPrimary}>
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @media (max-width: 960px) {
          table {
            display: none;
          }
          .mobile-visible {
            display: block !important;
          }
        }
        @media (min-width: 961px) {
          .mobile-visible {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  desc,
  glowColor,
  isDark,
}: {
  title: string;
  value: number;
  desc: string;
  glowColor: string;
  isDark: boolean;
}) {
  return (
    <div
      style={{
        background: isDark ? "rgba(5,12,27,1)" : "#ffffff",
        border: isDark ? "1px solid rgba(148,163,184,.12)" : "1px solid rgba(15,23,42,.03)",
        borderRadius: "1.2rem",
        padding: "1rem",
        boxShadow: isDark
          ? `0 10px 35px rgba(0,0,0,.19), 0 0 25px ${glowColor}10`
          : "0 10px 28px rgba(15,23,42,.06)",
      }}
    >
      <div style={{ fontSize: ".7rem", color: isDark ? "rgba(255,255,255,.6)" : "rgba(15,23,42,.6)" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: ".25rem", color: glowColor }}>{value}</div>
      <div style={{ fontSize: ".68rem", color: isDark ? "rgba(255,255,255,.4)" : "rgba(15,23,42,.5)", marginTop: ".25rem" }}>
        {desc}
      </div>
    </div>
  );
}

// styles
const analyticsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
  gap: "1rem",
};

const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg,#3b82f6 0%,#a855f7 100%)",
  border: "none",
  borderRadius: ".7rem",
  padding: ".5rem 1rem",
  color: "white",
  fontWeight: 500,
  boxShadow: "0 0 16px rgba(99,102,241,.4)",
  cursor: "pointer",
};

const btnGreen: React.CSSProperties = {
  background: "#22c55e",
  border: "none",
  borderRadius: ".7rem",
  padding: ".5rem 1rem",
  color: "white",
  fontWeight: 500,
  cursor: "pointer",
};

const btnGhost = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.4)" : "white",
  border: dark ? "1px solid rgba(148,163,184,.5)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: ".7rem",
  padding: ".5rem 1rem",
  color: dark ? "white" : "#0f172a",
  cursor: "pointer",
});

const iconBtn = (dark: boolean): React.CSSProperties => ({
  width: "40px",
  height: "40px",
  borderRadius: "9999px",
  border: dark ? "1px solid rgba(148,163,184,.4)" : "1px solid rgba(15,23,42,.1)",
  background: dark ? "rgba(15,23,42,.5)" : "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.1rem",
  cursor: "pointer",
});

const tabActive: React.CSSProperties = {
  background: "rgba(59,130,246,1)",
  border: "none",
  color: "white",
  borderRadius: "9999px",
  padding: ".35rem 1rem",
  fontWeight: 500,
};

const tabNormal = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.2)" : "white",
  border: dark ? "1px solid rgba(148,163,184,.1)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: "9999px",
  padding: ".35rem 1rem",
  color: dark ? "white" : "#0f172a",
  cursor: "pointer",
});

const tableWrap: React.CSSProperties = {
  marginTop: "1.1rem",
  borderRadius: "1rem",
  overflowX: "auto",
  background: "transparent",
};

const tableStyle = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  minWidth: "720px",
  borderCollapse: "collapse",
  color: dark ? "white" : "#0f172a",
});

const thStyle = (dark: boolean): React.CSSProperties => ({
  textAlign: "left",
  padding: ".7rem 1rem",
  fontSize: ".68rem",
  textTransform: "uppercase",
  letterSpacing: ".08em",
  background: dark ? "rgba(2,6,23,1)" : "white",
  borderBottom: dark ? "1px solid rgba(148,163,184,.12)" : "1px solid rgba(15,23,42,.04)",
});

const tdStyle = (dark: boolean): React.CSSProperties => ({
  padding: ".65rem 1rem",
  borderBottom: dark ? "1px solid rgba(148,163,184,.03)" : "1px solid rgba(15,23,42,.03)",
  fontSize: ".75rem",
});

const statusBadge = (status: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: ".25rem .7rem",
    borderRadius: "9999px",
    fontSize: ".65rem",
    textTransform: "capitalize",
    fontWeight: 500,
  };
  switch (status) {
    case "hired":
      return { ...base, background: "rgba(34,197,94,.15)", color: "#166534" };
    case "rejected":
      return { ...base, background: "rgba(248,113,113,.15)", color: "#b91c1c" };
    case "waiting":
      return { ...base, background: "rgba(250,204,21,.15)", color: "#92400e" };
    case "interview":
      return { ...base, background: "rgba(59,130,246,.15)", color: "#1d4ed8" };
    default:
      return base;
  }
};

const mobileList: React.CSSProperties = {
  display: "none",
  gap: ".85rem",
  marginTop: "1rem",
};

const mobileCard = (dark: boolean, border: string): React.CSSProperties => ({
  background: dark ? "rgba(5,12,27,1)" : "white",
  border: `1px solid ${border}`,
  borderRadius: "1.2rem",
  padding: ".9rem .9rem 1rem",
  boxShadow: dark ? "0 18px 40px rgba(0,0,0,.2)" : "0 18px 30px rgba(15,23,42,.05)",
});

const statusCapsule = (status: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: ".25rem .7rem",
    borderRadius: "9999px",
    fontSize: ".6rem",
    textTransform: "capitalize",
    fontWeight: 500,
  };
  switch (status) {
    case "hired":
      return { ...base, background: "rgba(187,247,208,1)", color: "#064e3b" };
    case "rejected":
      return { ...base, background: "rgba(254,226,226,1)", color: "#991b1b" };
    case "waiting":
      return { ...base, background: "rgba(254,249,195,1)", color: "#92400e" };
    case "interview":
      return { ...base, background: "rgba(219,234,254,1)", color: "#1d4ed8" };
    default:
      return base;
  }
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  zIndex: 50,
};

const modal = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#020617" : "white",
  borderRadius: "1rem",
  padding: "1rem",
  width: "100%",
  maxWidth: "420px",
  border: dark ? "1px solid rgba(148,163,184,.3)" : "1px solid rgba(15,23,42,.05)",
});

const inputStyle = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  background: dark ? "rgba(15,23,42,.5)" : "#f3f4f6",
  border: dark ? "1px solid rgba(148,163,184,.35)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: ".6rem",
  padding: ".45rem .55rem",
  marginBottom: ".6rem",
  color: dark ? "white" : "#0f172a",
});

const smallBtn = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.4)" : "#e2e8f0",
  border: "none",
  borderRadius: ".5rem",
  padding: ".25rem .65rem",
  fontSize: ".65rem",
  cursor: "pointer",
  color: dark ? "white" : "#0f172a",
});

const smallDanger: React.CSSProperties = {
  background: "rgba(248,113,113,.25)",
  border: "none",
  borderRadius: ".5rem",
  padding: ".25rem .65rem",
  fontSize: ".65rem",
  cursor: "pointer",
  color: "#991b1b",
};
