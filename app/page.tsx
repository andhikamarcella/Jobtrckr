"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const FALLBACK_SITE = "https://jobtrckr.vercel.app";
const LOCAL_REDIRECT = "http://localhost:3000/auth/callback";

function resolveSiteUrl() {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return envSite && envSite.length > 0 ? envSite : FALLBACK_SITE;
}

function resolveRedirectUrl() {
  const siteUrl = resolveSiteUrl();
  const runtimeOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : siteUrl;

  if (runtimeOrigin.startsWith("http://localhost")) {
    return LOCAL_REDIRECT;
  }

  return `${siteUrl.replace(/\/$/, "")}/auth/callback`;
}

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    const redirectTo = resolveRedirectUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: "16px"
      }}
    >
      <div
        style={{
          background: "#111827",
          padding: "32px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.45)",
          border: "1px solid rgba(148, 163, 184, 0.15)"
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "white", marginBottom: "8px" }}>
          JobTrackr
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "24px" }}>
          Sign in with Google to manage your job applications.
        </p>
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "#3b82f6",
            color: "white",
            fontWeight: 600,
            fontSize: "16px"
          }}
        >
          Continue with Google
        </button>
        {errorMessage ? (
          <p style={{ color: "#fca5a5", marginTop: "16px", fontSize: "14px" }}>{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
