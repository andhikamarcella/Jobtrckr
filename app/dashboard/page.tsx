"use client";

import DashboardScreen from "@/components/dashboard/DashboardScreen";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardScreen />;
}
