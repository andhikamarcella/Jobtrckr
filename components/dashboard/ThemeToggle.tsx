"use client";

import { useEffect, useMemo, useState } from "react";
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

  const knobClass = useMemo(
    () => (isDark ? "translate-x-10" : "translate-x-0"),
    [isDark]
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-10 w-20 items-center overflow-hidden rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        isDark
          ? "border-white/15 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-[0_20px_45px_rgba(15,23,42,0.6)]"
          : "border-slate-200 bg-gradient-to-r from-white via-slate-100 to-white shadow-[0_18px_45px_rgba(148,163,184,0.35)]"
      } ${className}`}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <SunIcon
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-slate-500" : "text-amber-400"
          }`}
        />
        <MoonIcon
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-sky-200" : "text-slate-500"
          }`}
        />
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1 top-1 h-8 w-8 rounded-full bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-[0_12px_30px_rgba(148,163,184,0.5)] transition-transform duration-300 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:shadow-[0_18px_38px_rgba(15,23,42,0.65)] ${knobClass}`}
      />
    </button>
  );
}
