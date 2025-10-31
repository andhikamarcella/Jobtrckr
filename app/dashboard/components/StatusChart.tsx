"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
      <div style={{ width: "100%", height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#cbd5f5" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="#cbd5f5" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.15)" }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
