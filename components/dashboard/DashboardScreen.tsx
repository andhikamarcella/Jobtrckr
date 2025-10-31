"use client";

import type { ChangeEvent, CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: string;
  notes?: string | null;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [filter, setFilter] = useState<
    "all" | "waiting" | "interview" | "rejected" | "hired"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState({
    company: "",
    position: "",
    applied_at: "",
    status: "waiting",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // load data
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/");
        return;
      }
      setEmail(data.user.email ?? "");

      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", data.user.id)
        .order("applied_at", { ascending: false });

      setApps((appsData || []) as ApplicationRecord[]);
    };
    load();
  }, [router]);

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const onExport = () => {
    // masih dummy supaya gak perlu file-saver
    console.log("export clicked");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setNewApp({ ...newApp, [e.target.name]: e.target.value });
  };

  const createApplication = async () => {
    setIsSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      setIsSaving(false);
      return;
    }

    await supabase.from("applications").insert([
      {
        user_id: user.user.id,
        company: newApp.company,
        position: newApp.position,
        applied_at: newApp.applied_at || new Date().toISOString().slice(0, 10),
        status: newApp.status,
        notes: newApp.notes,
      },
    ]);

    setIsSaving(false);
    setShowForm(false);
    setNewApp({
      company: "",
      position: "",
      applied_at: "",
      status: "waiting",
      notes: "",
    });

    // reload list
    const { data: appsData } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.user.id)
      .order("applied_at", { ascending: false });
    setApps((appsData || []) as ApplicationRecord[]);
  };

  return (
    <div style={pageWrap}>
      {/* top bar */}
      <div style={topBar}>
        <div>
          <h1 style={title}>Hi, {email}</h1>
          <p style={subtitle}>Pantau lamaran kamu di sini.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onExport} style={exportBtn}>
            Export (disabled)
          </button>
          <button onClick={() => setShowForm(true)} style={primaryBtn}>
            + Add Application
          </button>
          <button onClick={onLogout} style={ghostBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* filters */}
      <div style={filterBar}>
        {["all", "waiting", "interview", "rejected", "hired"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={filter === f ? filterBtnActive : filterBtn}
          >
            {f}
          </button>
        ))}
      </div>

      {/* table */}
      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Applied</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={emptyTd}>
                  No applications.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} style={trStyle}>
                  <td style={tdStyle}>{app.company}</td>
                  <td style={tdStyle}>{app.position}</td>
                  <td style={tdStyle}>{app.applied_at}</td>
                  <td style={tdStyle}>
                    <span
                      style={{ ...statusBadge, ...statusColor(app.status) }}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{app.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* modal add */}
      {showForm && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginBottom: 12, fontSize: 20, fontWeight: 700 }}>
              Add New Application
            </h2>

            <input
              name="company"
              value={newApp.company}
              onChange={handleChange}
              placeholder="Company"
              style={input}
            />
            <input
              name="position"
              value={newApp.position}
              onChange={handleChange}
              placeholder="Position"
              style={input}
            />
            <input
              type="date"
              name="applied_at"
              value={newApp.applied_at}
              onChange={handleChange}
              style={input}
            />
            <select
              name="status"
              value={newApp.status}
              onChange={handleChange}
              style={input}
            >
              <option value="waiting">waiting</option>
              <option value="interview">interview</option>
              <option value="rejected">rejected</option>
              <option value="hired">hired</option>
            </select>
            <textarea
              name="notes"
              value={newApp.notes}
              onChange={handleChange}
              placeholder="Notes..."
              style={{ ...input, height: 80, resize: "vertical" }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}
            >
              <button onClick={() => setShowForm(false)} style={ghostSmall}>
                Cancel
              </button>
              <button onClick={createApplication} style={primarySmall} disabled={isSaving}>
                {isSaving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// styles (web3-ish, glossy)
// ============================================================

const pageWrap: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #172554 0%, #020617 55%, #020617 100%)",
  color: "white",
  padding: "22px",
};

const topBar: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  marginBottom: 22,
};

const title: CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
};

const subtitle: CSSProperties = {
  opacity: 0.6,
};

const filterBar: CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 18,
};

const filterBtn: CSSProperties = {
  background: "rgba(15,23,42,.25)",
  border: "1px solid rgba(148,163,184,.2)",
  borderRadius: 9999,
  padding: "4px 14px",
  cursor: "pointer",
  textTransform: "capitalize",
  backdropFilter: "blur(4px)",
};

const filterBtnActive: CSSProperties = {
  ...filterBtn,
  background: "rgba(59,130,246,.9)",
  boxShadow: "0 0 18px rgba(59,130,246,.55)",
};

const tableWrap: CSSProperties = {
  background: "rgba(2,6,23,.4)",
  border: "1px solid rgba(148,163,184,.12)",
  borderRadius: 14,
  overflow: "hidden",
  backdropFilter: "blur(6px)",
  boxShadow: "0 10px 35px rgba(0,0,0,.25)",
};

const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  background: "rgba(15,23,42,.55)",
  borderBottom: "1px solid rgba(148,163,184,.14)",
};

const tdStyle: CSSProperties = {
  padding: "10px 16px",
  borderBottom: "1px solid rgba(148,163,184,.03)",
  verticalAlign: "top",
};

const trStyle: CSSProperties = {
  transition: "background .15s ease",
};

const emptyTd: CSSProperties = {
  padding: "20px 16px",
  textAlign: "center",
  opacity: 0.6,
};

const primaryBtn: CSSProperties = {
  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 40%, #a855f7 100%)",
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer",
  fontWeight: 500,
  boxShadow: "0 0 20px rgba(99,102,241,.35)",
};

const exportBtn: CSSProperties = {
  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer",
  fontWeight: 500,
  boxShadow: "0 0 18px rgba(34,197,94,.35)",
};

const ghostBtn: CSSProperties = {
  background: "rgba(15,23,42,.25)",
  border: "1px solid rgba(148,163,184,.35)",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer",
};

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,.55)",
  backdropFilter: "blur(7px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

const modal: CSSProperties = {
  background:
    "radial-gradient(circle at top, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 80%)",
  border: "1px solid rgba(148,163,184,.3)",
  borderRadius: 14,
  padding: 18,
  width: "100%",
  maxWidth: 420,
  boxShadow: "0 0 35px rgba(59,130,246,.35)",
};

const input: CSSProperties = {
  width: "100%",
  background: "rgba(15,23,42,.45)",
  border: "1px solid rgba(148,163,184,.25)",
  borderRadius: 8,
  padding: "8px 10px",
  marginBottom: 10,
  color: "white",
  outline: "none",
};

const ghostSmall: CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(148,163,184,.35)",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
  color: "white",
};

const primarySmall: CSSProperties = {
  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
  border: "none",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
  color: "white",
  fontWeight: 500,
};

const statusBadge: CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  textTransform: "capitalize",
};

function statusColor(status: string): CSSProperties {
  switch (status) {
    case "waiting":
      return {
        background: "rgba(234,179,8,.14)",
        border: "1px solid rgba(234,179,8,.4)",
      };
    case "interview":
      return {
        background: "rgba(59,130,246,.14)",
        border: "1px solid rgba(59,130,246,.4)",
      };
    case "rejected":
      return {
        background: "rgba(248,113,113,.14)",
        border: "1px solid rgba(248,113,113,.4)",
      };
    case "hired":
      return {
        background: "rgba(34,197,94,.14)",
        border: "1px solid rgba(34,197,94,.4)",
      };
    default:
      return {};
  }
}
