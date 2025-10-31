"use client";

import { useMemo } from "react";
import type { ApplicationRecord } from "./ApplicationTable";

interface StatusChartProps {
  applications: ApplicationRecord[];
}

type ChartData = {
  name: string;
  value: number;
};

export function StatusChart({ applications }: StatusChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    const statusCounts = applications.reduce<Record<string, number>>((acc, application) => {
      acc[application.status] = (acc[application.status] ?? 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Waiting", value: statusCounts.waiting ?? 0 },
      { name: "Interview", value: statusCounts.interview ?? 0 },
      { name: "Rejected", value: statusCounts.rejected ?? 0 },
      { name: "Hired", value: statusCounts.hired ?? 0 }
    ];
  }, [applications]);

  const maxValue = chartData.reduce((max, { value }) => (value > max ? value : max), 0) || 1;

  return (
    <div
      style={{
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: "14px",
        background: "rgba(15, 23, 42, 0.55)",
        padding: "24px",
        color: "white"
      }}
    >
      <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Status Overview</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {chartData.map(({ name, value }) => {
          const percentage = Math.round((value / maxValue) * 100);

          return (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.8 }}>
                <span>{name}</span>
                <span>{value}</span>
              </div>
              <div
                style={{
                  height: "10px",
                  borderRadius: "9999px",
                  background: "rgba(59, 130, 246, 0.2)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    borderRadius: "9999px",
                    background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
