"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const run = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error || errorDescription) {
        console.error("Supabase OAuth error", errorDescription || error);
        router.replace("/?error=oauth");
        return;
      }

      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          router.replace("/dashboard");
          return;
        }

        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          try {
            const params = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (sessionError) {
                throw sessionError;
              }
              router.replace("/dashboard");
              return;
            }
          } catch (hashError) {
            console.error("Failed to parse access token hash", hashError);
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/dashboard");
        } else {
          router.replace("/");
        }
      } catch (callbackError) {
        console.error("Auth callback handling error", callbackError);
        router.replace("/");
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="glass-dark max-w-sm w-full p-6 rounded-3xl text-center space-y-3">
        <h2 className="text-lg font-semibold">Memproses login…</h2>
        <p className="text-sm opacity-70">Sedang menyelesaikan autentikasi Google kamu.</p>
      </div>
    </div>
  );
}

export default function CallbackClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="glass-dark max-w-sm w-full p-6 rounded-3xl text-center space-y-3">
            <h2 className="text-lg font-semibold">Memuat…</h2>
            <p className="text-sm opacity-70">Tunggu sebentar ya.</p>
          </div>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
