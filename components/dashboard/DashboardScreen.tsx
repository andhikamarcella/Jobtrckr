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

export default function DashboardScreen() {
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

  // load user + data
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

  const analytics = useMemo(() => {
    return {
      total: apps.length,
      waiting: apps.filter((a) => a.status === "waiting").length,
      interview: apps.filter((a) => a.status === "interview").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      hired: apps.filter((a) => a.status === "hired").length,
    };
  }, [apps]);

  const isDark = theme === "dark";
  const pageBg = isDark ? "#020617" : "#edf2ff";
  const textColor = isDark ? "#ffffff" : "#0f172a";
  const cardBg = isDark ? "rgba(5,12,27,1)" : "#ffffff";
  const subText = isDark ? "rgba(255,255,255,.65)" : "rgba(15,23,42,.6)";
  const borderCol = isDark ? "rgba(148,163,184,.14)" : "rgba(15,23,42,.08)";

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
      const { data, error } = await supabase
        .from("applications")
        .insert(payload)
        .select();
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
    <div style={{ minHeight: "100vh", background: pageBg, color: textColor }}>
      {/* sticky top */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: isDark ? "rgba(2,6,23,.9)" : "rgba(237,242,255,.9)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${borderCol}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: "1.7rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Hi, {userEmail}
            </h1>
            <p style={{ color: subText, fontSize: ".78rem" }}>Pantau lamaran kamu di sini.</p>
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <button onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))} style={btnGhost(isDark)}>
              {isDark ? "Light" : "Dark"}
            </button>
            <button onClick={exportCSV} style={btnGreen(isDark)} disabled={exporting}>
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

      {/* content */}
      <div style={{ padding: "1.25rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* analytics */}
        <div style={analyticsWrap}>
          <AnalyticsCard
            title="Total Applications"
            value={analytics.total}
            desc="semua lamaran kamu"
            glowColor="#38bdf8"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Waiting"
            value={analytics.waiting}
            desc="menunggu jawaban"
            glowColor="#f97316"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Interview"
            value={analytics.interview}
            desc="siapkan dirimu"
            glowColor="#3b82f6"
            isDark={isDark}
          />
          <AnalyticsCard
            title="Hired"
            value={analytics.hired}
            desc="selamat 🎉"
            glowColor="#22c55e"
            isDark={isDark}
          />
        </div>

        {/* filter */}
        <div style={{ display: "flex", gap: ".5rem", marginTop: "1.2rem", marginBottom: ".9rem", flexWrap: "wrap" }}>
          {["all", "waiting", "interview", "rejected", "hired"].map((st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st as any)}
              style={st === activeFilter ? pillActive : pillNormal(isDark)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* desktop table */}
        <div style={tableContainer}>
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
                  <td colSpan={6} style={{ padding: "1.2rem", textAlign: "center", color: subText }}>
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
                      <span style={badge(app.status)}>{app.status}</span>
                    </td>
                    <td style={tdStyle(isDark)}>{app.notes}</td>
                    <td style={tdStyle(isDark)}>
                      <div style={{ display: "flex", gap: ".4rem" }}>
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
        <div style={mobileList} className="mobile-visible">
          {filteredApps.length === 0 ? (
            <div style={{ textAlign: "center", color: subText, padding: "1rem" }}>No applications.</div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.id} style={mobileCard(cardBg, borderCol)}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{app.company}</div>
                    <div style={{ color: subText, fontSize: ".85rem" }}>{app.position}</div>
                    <div style={{ color: subText, fontSize: ".7rem", marginTop: ".3rem" }}>
                      Applied: {app.applied_at}
                    </div>
                  </div>
                  <span style={badge(app.status)}>{app.status}</span>
                </div>
                {app.notes ? <p style={{ marginTop: ".6rem", lineHeight: 1.4 }}>{app.notes}</p> : null}
                <div style={{ display: "flex", gap: ".5rem", marginTop: ".7rem" }}>
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
            <h2 style={{ marginBottom: ".6rem", fontSize: "1rem" }}>{editingId ? "Edit Application" : "New Application"}</h2>
            <p
              style={{
                color: isDark ? "rgba(255,255,255,.4)" : "rgba(15,23,42,.5)",
                fontSize: ".72rem",
                marginBottom: ".6rem",
              }}
            >
              Isi data lamaran kerja kamu.
            </p>
            <input
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              placeholder="Company"
              style={input(isDark)}
            />
            <input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              placeholder="Position"
              style={input(isDark)}
            />
            <input
              type="date"
              value={form.applied_at}
              onChange={(e) => setForm((p) => ({ ...p, applied_at: e.target.value }))}
              style={input(isDark)}
            />
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusType }))}
              style={input(isDark)}
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
              style={{ ...input(isDark), minHeight: "70px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
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
        @media (max-width: 900px) {
          table {
            display: none;
          }
          .mobile-visible {
            display: block !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-visible {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// sub components + styles
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
        background: isDark ? "#050d1a" : "#ffffff",
        border: isDark ? "1px solid rgba(148,163,184,.15)" : "1px solid rgba(15,23,42,.04)",
        borderRadius: "1rem",
        padding: "1rem",
        boxShadow: `0 10px 35px rgba(0,0,0,.2), 0 0 20px ${glowColor}22`,
      }}
    >
      <div style={{ fontSize: ".7rem", color: isDark ? "rgba(255,255,255,.5)" : "rgba(15,23,42,.5)" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: glowColor, marginTop: ".25rem" }}>{value}</div>
      <div style={{ fontSize: ".68rem", color: isDark ? "rgba(255,255,255,.4)" : "rgba(15,23,42,.5)", marginTop: ".25rem" }}>
        {desc}
      </div>
    </div>
  );
}

const analyticsWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "1rem",
};

const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
  border: "none",
  borderRadius: ".6rem",
  padding: ".5rem 1rem",
  color: "white",
  cursor: "pointer",
  fontWeight: 500,
  boxShadow: "0 0 15px rgba(99,102,241,.45)",
};

const btnGreen = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#22c55e" : "#16a34a",
  border: "none",
  borderRadius: ".6rem",
  padding: ".5rem 1rem",
  color: "white",
  cursor: "pointer",
  fontWeight: 500,
});

const btnGhost = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.5)" : "transparent",
  border: dark ? "1px solid rgba(148,163,184,.35)" : "1px solid rgba(15,23,42,.08)",
  borderRadius: ".6rem",
  padding: ".5rem 1rem",
  color: dark ? "white" : "#0f172a",
  cursor: "pointer",
});

const pillActive: React.CSSProperties = {
  background: "rgba(59,130,246,1)",
  border: "none",
  color: "white",
  borderRadius: "9999px",
  padding: ".35rem 1rem",
  fontWeight: 500,
  boxShadow: "0 0 12px rgba(59,130,246,.55)",
};

const pillNormal = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.4)" : "rgba(255,255,255,1)",
  border: dark ? "1px solid rgba(148,163,184,.15)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: "9999px",
  padding: ".35rem 1rem",
  color: dark ? "white" : "#0f172a",
  cursor: "pointer",
});

const tableContainer: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: "1rem",
  border: "1px solid rgba(148,163,184,.08)",
  background: "rgba(5,12,27,.5)",
  display: "block",
};

const tableStyle = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "720px",
  color: dark ? "white" : "#0f172a",
});

const thStyle = (dark: boolean): React.CSSProperties => ({
  textAlign: "left",
  padding: "0.75rem 1rem",
  background: dark ? "rgba(2,6,23,1)" : "rgba(226,232,255,1)",
  borderBottom: dark ? "1px solid rgba(148,163,184,.12)" : "1px solid rgba(15,23,42,.08)",
  fontSize: ".7rem",
  textTransform: "uppercase",
  letterSpacing: ".08em",
});

const tdStyle = (dark: boolean): React.CSSProperties => ({
  padding: ".65rem 1rem",
  borderBottom: dark ? "1px solid rgba(148,163,184,.035)" : "1px solid rgba(15,23,42,.035)",
  fontSize: ".78rem",
});

const badge = (status: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: ".25rem .7rem",
    borderRadius: "9999px",
    fontSize: ".65rem",
    textTransform: "capitalize",
    fontWeight: 500,
  };
  switch (status) {
    case "waiting":
      return { ...base, background: "rgba(250,204,21,.14)", color: "#fde68a" };
    case "interview":
      return { ...base, background: "rgba(59,130,246,.16)", color: "#bfdbfe" };
    case "rejected":
      return { ...base, background: "rgba(248,113,113,.12)", color: "#fecaca" };
    case "hired":
      return { ...base, background: "rgba(34,197,94,.12)", color: "#bbf7d0" };
    default:
      return base;
  }
};

const smallBtn = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(15,23,42,.4)" : "rgba(226,232,255,1)",
  border: dark ? "1px solid rgba(148,163,184,.35)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: ".5rem",
  padding: ".25rem .65rem",
  fontSize: ".65rem",
  cursor: "pointer",
  color: dark ? "white" : "#0f172a",
});

const smallDanger: React.CSSProperties = {
  background: "rgba(248,113,113,.25)",
  border: "1px solid rgba(248,113,113,.45)",
  borderRadius: ".5rem",
  padding: ".25rem .65rem",
  fontSize: ".65rem",
  cursor: "pointer",
  color: "white",
};

const mobileList: React.CSSProperties = {
  display: "none",
  gap: ".9rem",
  marginTop: "1rem",
};

const mobileCard = (bg: string, border: string): React.CSSProperties => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: "1.2rem",
  padding: ".9rem .9rem 1rem",
  boxShadow: "0 14px 30px rgba(0,0,0,.18)",
});

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  zIndex: 50,
};

const modal = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#020617" : "#ffffff",
  border: dark ? "1px solid rgba(148,163,184,.22)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: "1rem",
  padding: "1rem",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 0 25px rgba(0,0,0,.25)",
});

const input = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  background: dark ? "rgba(15,23,42,.5)" : "rgba(237,242,255,1)",
  border: dark ? "1px solid rgba(148,163,184,.3)" : "1px solid rgba(15,23,42,.05)",
  borderRadius: ".6rem",
  padding: ".45rem .55rem",
  marginBottom: ".6rem",
  color: dark ? "white" : "#0f172a",
  outline: "none",
});
