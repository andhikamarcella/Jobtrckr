"use client";

import { useMemo, useState, useEffect } from "react";
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-600 shadow-lg shadow-slate-500/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
        Belum ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="h-80 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-400/15 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_45px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between text-slate-700 dark:text-slate-100">
        <h3 className="text-sm font-semibold">Distribusi Status</h3>
        <span className="text-xs opacity-80">{applications.length} aplikasi</span>
      </div>
      <ResponsiveContainer width="100%" height="70%">
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={60} outerRadius={100} stroke="none" paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={CHART_COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.25)",
              color: isDark ? "#f8fafc" : "#0f172a",
              boxShadow: isDark
                ? "0 18px 35px rgba(15,23,42,0.55)"
                : "0 15px 30px rgba(148,163,184,0.3)",
            }}
            formatter={(value: number, name: string) => [`${value} aplikasi`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 text-slate-700 shadow-sm transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS[item.status] }}
            />
            <span className="truncate font-medium">{item.name}</span>
            <span className="ml-auto font-semibold text-slate-900 dark:text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
