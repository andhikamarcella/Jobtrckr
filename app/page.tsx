"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

const FALLBACK_SITE = "https://jobtrackr.vercel.app";

export default function HomePage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null);

  const ensureSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = getSupabaseClient();
    }
    return supabaseRef.current;
  };

  useEffect(() => {
    const resolveSessionFromHash = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const supabase = ensureSupabase();

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("error")) {
        setAuthError("Gagal masuk. Coba lagi ya.");
      }

      if (window.location.hash.includes("access_token")) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setAuthError(error.message);
          }
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
      }
    };

    resolveSessionFromHash();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    let baseUrl = FALLBACK_SITE;
    if (siteUrl && siteUrl.length > 0) {
      baseUrl = siteUrl.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      baseUrl = window.location.origin;
    }
    const redirectTo = `${baseUrl}/auth/callback`;

    const supabase = ensureSupabase();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="glass-dark max-w-md w-full p-8 rounded-3xl text-center space-y-4">
        <h1 className="text-2xl font-bold">JobTrackr</h1>
        <p className="text-sm opacity-70">Login pakai Google untuk lanjut ke dashboard.</p>
        {authError ? (
          <p className="text-xs text-red-300">{authError}</p>
        ) : null}
        <button
          onClick={handleLogin}
          className="btn-primary w-full disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Mengalihkan…" : "Login with Google"}
        </button>
      </div>
    </main>
  );
}
