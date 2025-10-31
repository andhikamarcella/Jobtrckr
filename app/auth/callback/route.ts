import { NextResponse } from "next/server";

// memastikan route ini tidak di-prerender
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);

  // jika Supabase mengirim query ?next=/..., gunakan itu sebagai tujuan
  const next = url.searchParams.get("next") || "/dashboard";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // redirect user ke dashboard atau halaman berikutnya
  return NextResponse.redirect(new URL(next, siteUrl));
}
