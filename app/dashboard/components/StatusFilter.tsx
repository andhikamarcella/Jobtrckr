"use client";

const STATUS_OPTIONS = ["all", "waiting", "interview", "rejected", "hired"] as const;

export type StatusFilterValue = (typeof STATUS_OPTIONS)[number];

interface StatusFilterProps {
  activeStatus: StatusFilterValue;
  onChange: (status: StatusFilterValue) => void;
}

const getLabel = (status: StatusFilterValue) =>
  status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1);

export function StatusFilter({ activeStatus, onChange }: StatusFilterProps) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(148, 163, 184, 0.4)",
            background: activeStatus === status ? "#3b82f6" : "transparent",
            color: "white",
            cursor: "pointer",
            textTransform: "capitalize"
          }}
        >
          {getLabel(status)}
        </button>
      ))}
    </div>
  );
}

export { STATUS_OPTIONS };
