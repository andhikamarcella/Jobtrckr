"use client";

import { useMemo } from "react";
import { Box, Heading } from "@chakra-ui/react";
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
    <Box borderWidth="1px" borderColor="gray.700" rounded="lg" bg="gray.800" p={6} shadow="lg">
      <Heading size="md" color="gray.100">
        Status Overview
      </Heading>
      <Box mt={6} h="260px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#cbd5f5" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
            <YAxis
              allowDecimals={false}
              stroke="#cbd5f5"
              tick={{ fill: "#cbd5f5", fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.15)" }} />
            <Bar dataKey="value" fill="#4299e1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
