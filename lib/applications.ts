import type { ApplicationRecord } from "@/components/ApplicationTable";
import { supabase } from "@/lib/supabaseClient";

export async function fetchApplicationsByStatus(
  userId: string,
  status?: string
): Promise<ApplicationRecord[]> {
  let query = supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("fetchApplicationsByStatus error:", error.message);
    return [];
  }

  return (data ?? []) as ApplicationRecord[];
}
