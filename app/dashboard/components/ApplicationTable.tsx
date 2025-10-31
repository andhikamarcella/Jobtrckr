"use client";

import type { CSSProperties } from "react";
import type { ApplicationPayload } from "./ApplicationForm";

export interface ApplicationRecord extends ApplicationPayload {
  id: string;
  user_id?: string | null;
  created_at?: string | null;
}

interface ApplicationTableProps {
  applications: ApplicationRecord[];
  onEdit: (application: ApplicationRecord) => void;
  onDelete: (application: ApplicationRecord) => void;
}

export function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  if (applications.length === 0) {
    return (
      <div
        style={{
          border: "1px dashed rgba(148, 163, 184, 0.4)",
          background: "rgba(15, 23, 42, 0.5)",
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          color: "rgba(255,255,255,0.7)"
        }}
      >
        Belum ada data lamaran. Tambahkan data baru untuk mulai melacak.
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: "14px",
        overflow: "hidden",
        background: "rgba(15, 23, 42, 0.45)"
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
        <thead style={{ background: "rgba(148, 163, 184, 0.15)" }}>
          <tr>
            <th style={headerStyle}>Company</th>
            <th style={headerStyle}>Position</th>
            <th style={headerStyle}>Applied</th>
            <th style={headerStyle}>Status</th>
            <th style={headerStyle}>Notes</th>
            <th style={{ ...headerStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr
              key={application.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <td style={{ ...cellStyle, fontWeight: 600 }}>{application.company}</td>
              <td style={cellStyle}>{application.position}</td>
              <td style={cellStyle}>
                {new Date(application.applied_at).toLocaleDateString()}
              </td>
              <td style={cellStyle}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    background: statusBackground[application.status] ?? "rgba(148, 163, 184, 0.2)",
                    color: "#0f172a",
                    fontWeight: 600,
                    textTransform: "capitalize"
                  }}
                >
                  {application.status}
                </span>
              </td>
              <td style={{ ...cellStyle, maxWidth: "280px" }}>
                <span style={{ whiteSpace: "pre-wrap", opacity: 0.8 }}>
                  {application.notes ?? "-"}
                </span>
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "8px" }}>
                  <button
                    onClick={() => onEdit(application)}
                    style={actionButtonStyle("#3b82f6")}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(application)}
                    style={actionButtonStyle("#ef4444")}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const headerStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.85)",
  textTransform: "uppercase",
  letterSpacing: "0.08em"
};

const cellStyle: CSSProperties = {
  padding: "14px 16px",
  fontSize: "15px",
  color: "rgba(255,255,255,0.9)",
  verticalAlign: "top"
};

const statusBackground: Record<string, string> = {
  waiting: "rgba(253, 224, 71, 0.9)",
  interview: "rgba(96, 165, 250, 0.9)",
  rejected: "rgba(248, 113, 113, 0.9)",
  hired: "rgba(52, 211, 153, 0.9)"
};

function actionButtonStyle(color: string): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    color: "white",
    background: color,
    transition: "transform 0.2s ease",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.35)"
  };
}
