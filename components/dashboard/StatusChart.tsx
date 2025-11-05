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
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-white/60 bg-white/90 p-6 text-sm text-slate-600 shadow-lg shadow-slate-300/30 backdrop-blur-xl">
        Belum ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="y2k-card h-80 p-5">
      <div className="relative z-10 flex items-center justify-between text-slate-700">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">Distribusi Status</h3>
        <span className="text-xs font-semibold text-slate-500">{applications.length} aplikasi</span>
      </div>
      <div className="relative z-10 h-[70%]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={data} innerRadius={60} outerRadius={100} stroke="none" paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={CHART_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.97)",
                borderRadius: "16px",
                border: "1px solid rgba(148,163,184,0.25)",
                color: "#0f172a",
                boxShadow: "0 18px 34px rgba(148,163,184,0.28)",
              }}
              formatter={(value: number, name: string) => [`${value} aplikasi`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-slate-700 shadow-[0_12px_26px_rgba(148,163,184,0.18)]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/80"
              style={{ backgroundColor: CHART_COLORS[item.status] }}
            />
            <span className="truncate font-medium text-slate-700">{item.name}</span>
            <span className="ml-auto font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
