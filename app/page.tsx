"use client";

import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="glass-dark max-w-md w-full p-8 rounded-3xl text-center space-y-4">
        <h1 className="text-2xl font-bold">JobTrackr</h1>
        <p className="text-sm opacity-70">Login pakai Google untuk lanjut ke dashboard.</p>
        <button onClick={handleLogin} className="btn-primary w-full">Login with Google</button>
      </div>
    </main>
  );
}
