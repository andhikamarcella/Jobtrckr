'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ApplicationRecord } from './ApplicationTable';

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

    const statuses: ChartData[] = [
      { name: 'Waiting', value: statusCounts.waiting ?? 0 },
      { name: 'Interview', value: statusCounts.interview ?? 0 },
      { name: 'Rejected', value: statusCounts.rejected ?? 0 },
      { name: 'Hired', value: statusCounts.hired ?? 0 }
    ];

    return statuses;
  }, [applications]);

  return (
    <div className="h-72 w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700">Status Overview</h3>
      <div className="mt-6 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
