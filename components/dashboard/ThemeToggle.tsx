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

  const buttonClasses = isDark
    ? "border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-slate-900/70 text-white shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
    : "border-slate-300 bg-white/90 text-slate-800 shadow-lg shadow-slate-400/20";

  const thumbClasses = isDark
    ? "bg-slate-950/80 shadow-[0_8px_20px_rgba(99,102,241,0.45)]"
    : "bg-slate-100 shadow-[0_8px_20px_rgba(148,163,184,0.45)]";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-11 w-20 items-center justify-between rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${buttonClasses} ${className}`}
      aria-label="Toggle theme"
    >
      <span>{isDark ? "Dark" : "Light"}</span>
      <span className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform ${thumbClasses}`}>
        {isDark ? <SunIcon className="h-4 w-4 text-amber-300" /> : <MoonIcon className="h-4 w-4 text-slate-900" />}
      </span>
    </button>
  );
}
