"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

      // Aktifkan Google OAuth di Supabase Console:
      // Authentication -> Providers -> Google, isi Client ID & Secret lalu tambahkan redirect URL
      // http://localhost:3000/auth/callback dan https://my-vercel-app.vercel.app/auth/callback
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memulai proses login.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="rounded-xl bg-white/10 p-10 text-center shadow-xl backdrop-blur">
        <h1 className="text-4xl font-bold">JobTrackr</h1>
        <p className="mt-4 max-w-lg text-lg text-white/80">
          Kelola dan lacak semua lamaran pekerjaan Anda dari satu dashboard yang rapi.
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 shadow hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Redirecting..." : "Sign in with Google"}
        </button>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>
    </main>
  );
}
