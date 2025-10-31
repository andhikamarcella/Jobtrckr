import { NextResponse } from "next/server";

// memastikan route ini tidak di-prerender
export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_SITE = "https://jobtrckr.vercel.app";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // jika Supabase mengirim query ?next=/..., gunakan itu sebagai tujuan
  const next = url.searchParams.get("next") || "/dashboard";

  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = envSite && envSite.length > 0 ? envSite : FALLBACK_SITE;

  // redirect user ke dashboard atau halaman berikutnya
  return NextResponse.redirect(new URL(next, siteUrl));
}
