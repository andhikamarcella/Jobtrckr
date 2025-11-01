"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/lib/heroicons-sun-moon";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobtrackr-theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextIsDark = stored ? stored === "dark" : prefersDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("jobtrackr-theme", next ? "dark" : "light");
      }
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-11 w-20 items-center justify-between rounded-full border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-slate-900/70 px-3 py-1 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition hover:scale-[1.02] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${className}`}
      aria-label="Toggle theme"
    >
      <span className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wide">
        {isDark ? "Dark" : "Light"}
      </span>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 shadow-[0_8px_20px_rgba(99,102,241,0.45)] transition-transform">
        {isDark ? (
          <SunIcon className="h-4 w-4 text-amber-300" />
        ) : (
          <MoonIcon className="h-4 w-4 text-slate-900" />
        )}
      </span>
    </button>
  );
}
