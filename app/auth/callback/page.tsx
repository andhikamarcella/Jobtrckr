"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Signing you in…");

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data.session) {
        const errorDescription =
          searchParams.get("error_description") ?? error?.message;
        if (errorDescription) {
          setStatusMessage(
            `Authentication failed: ${decodeURIComponent(errorDescription)}`
          );
        } else {
          setStatusMessage("Authentication failed. Redirecting to sign in…");
        }
        router.replace("/");
        return;
      }

      setStatusMessage("Redirecting to your dashboard…");
      router.replace("/dashboard");
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-8 py-10 text-center shadow-lg">
        <p className="text-base font-semibold">{statusMessage}</p>
        <p className="mt-3 text-sm text-slate-400">
          {"This window will close automatically once the process completes."}
        </p>
        {code && (
          <p className="mt-4 text-xs text-slate-500">
            Processing code: <span className="font-mono">{codeSnippet(code)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function codeSnippet(value: string) {
  if (value.length <= 8) {
    return value;
  }
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-8 py-10 text-center shadow-lg">
            <p className="text-base font-semibold">Loading auth…</p>
            <p className="mt-3 text-sm text-slate-400">
              Please wait while we verify your session.
            </p>
          </div>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
