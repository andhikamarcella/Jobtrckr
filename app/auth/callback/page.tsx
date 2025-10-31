"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Menyelesaikan proses autentikasi...");

  useEffect(() => {
    let isMounted = true;

    const processSession = async () => {
      const { error, data } = await supabase.auth.getSession();

      if (error) {
        setStatusMessage(`Autentikasi gagal: ${error.message}`);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) {
          return;
        }

        if (session) {
          router.replace("/dashboard");
        } else if (event === "SIGNED_OUT") {
          router.replace("/");
        }
      });

      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setStatusMessage(`Autentikasi gagal: ${decodeURIComponent(errorDescription)}`);
      }

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    const cleanupPromise = processSession();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="rounded-xl bg-white/10 p-8 text-center shadow-xl backdrop-blur">
        <p className="text-lg font-semibold">{statusMessage}</p>
        <p className="mt-2 text-sm text-white/70">Mohon tunggu sebentar...</p>
      </div>
    </main>
  );
}
