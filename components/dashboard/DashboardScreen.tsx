"use client";

import type { CSSProperties } from "react";
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

type StatusFilter = "all" | "waiting" | "interview" | "rejected" | "hired";

const STATUS_VALUES: StatusFilter[] = [
  "all",
  "waiting",
  "interview",
  "rejected",
  "hired"
];

export default function DashboardScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const load = async () => {
      const {
        data,
        error
      } = await supabase.auth.getUser();

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

      setApplications((appsData || []) as ApplicationRecord[]);
    };

    load();
  }, [router]);

  const filtered = filter === "all"
    ? applications
    : applications.filter((app) => app.status === filter);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleExport = async () => {
    console.log("Export clicked", filtered.length);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "24px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Hi, {email || "User"}</h1>
          <p style={{ opacity: 0.6 }}>Pantau lamaran kamu di sini.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleExport}
            style={{
              background: "#22c55e",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              color: "white"
            }}
          >
            Export (disabled)
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              color: "white"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}
      >
        {STATUS_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              background: filter === value ? "#3b82f6" : "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "9999px",
              padding: "4px 14px",
              cursor: "pointer",
              textTransform: "capitalize",
              color: "white"
            }}
          >
            {value}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "rgba(15,23,42,0.4)",
          borderRadius: "16px",
          overflow: "hidden"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)" }}>
            <tr>
              <th style={headerCellStyle}>Company</th>
              <th style={headerCellStyle}>Position</th>
              <th style={headerCellStyle}>Applied</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "18px", textAlign: "center" }}>
                  No applications.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr
                  key={app.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={cellStyle}>{app.company}</td>
                  <td style={cellStyle}>{app.position}</td>
                  <td style={cellStyle}>{app.applied_at}</td>
                  <td style={cellStyle}>{app.status}</td>
                  <td style={cellStyle}>{app.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headerCellStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontWeight: 600
};

const cellStyle: CSSProperties = {
  padding: "10px 14px",
  verticalAlign: "top"
};
