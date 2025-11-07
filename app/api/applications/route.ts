import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabaseServer";
import { normalizeSource, normalizeStatus } from "@/lib/applicationTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  const supabase = createRouteClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", normalizeStatus(status));
  }

  if (startDate) {
    query = query.gte("applied_at", startDate);
  }

  if (endDate) {
    query = query.lte("applied_at", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
    source: normalizeSource(item.source),
  }));

  return NextResponse.json({
    applications: normalized,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createRouteClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = {
    user_id: user.id,
    company: (body.company ?? "").trim(),
    position: (body.position ?? "").trim(),
    applied_at: body.applied_at,
    status: normalizeStatus(body.status),
    source: normalizeSource(body.source),
    notes: body.notes ? String(body.notes).trim() : null,
  };

  if (!payload.company || !payload.position || !payload.applied_at) {
    return NextResponse.json({ error: "Harap lengkapi data" }, { status: 400 });
  }

  const { data, error } = await supabase.from("applications").insert(payload).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ application: data?.[0] ?? null }, { status: 201 });
}
