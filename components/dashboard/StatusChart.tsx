"use client";

import { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/applicationTypes";
import { STATUS_OPTIONS } from "@/lib/applicationTypes";

const CHART_COLORS: Record<ApplicationStatus, string> = {
  waiting: "#fbbf24",
  screening: "#38bdf8",
  mcu: "#f472b6",
  "interview-user": "#60a5fa",
  psikotes: "#c084fc",
  "tes-online": "#22d3ee",
  training: "#bef264",
  "tes-kesehatan": "#34d399",
  offering: "#fb923c",
  rejected: "#f87171",
  hired: "#4ade80",
};

interface StatusChartProps {
  applications: ApplicationRecord[];
}

export function StatusChart({ applications }: StatusChartProps) {
  const data = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = Object.fromEntries(
      STATUS_OPTIONS.map((item) => [item.value, 0])
    ) as Record<ApplicationStatus, number>;

    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    });

    return STATUS_OPTIONS.filter((item) => counts[item.value] > 0).map((item) => ({
      name: item.label,
      value: counts[item.value],
      status: item.value,
    }));
  }, [applications]);

  if (!data.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200/70 bg-white/95 p-6 text-sm text-slate-600 shadow-sm shadow-slate-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
        Belum ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-sm shadow-slate-500/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/40">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Distribusi Status</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={60} outerRadius={100} stroke="none" paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={CHART_COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.9)",
              borderRadius: "14px",
              border: "1px solid rgba(148,163,184,0.2)",
              color: "#f8fafc",
            }}
            formatter={(value: number, name: string) => [`${value} aplikasi`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
