import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabaseServer";
import { normalizeSource, normalizeStatus } from "@/lib/applicationTypes";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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

  const { data, error } = await supabase
    .from("applications")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ application: data?.[0] ?? null });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createRouteClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
