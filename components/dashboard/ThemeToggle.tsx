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

  const knobPositionClass = useMemo(
    () => (isDark ? "translate-x-[56px]" : "translate-x-0"),
    [isDark]
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-12 w-[6.75rem] items-center rounded-full border px-4 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        isDark
          ? "border-white/15 bg-slate-950/70 shadow-[0_18px_40px_rgba(15,23,42,0.55)]"
          : "border-slate-200 bg-white/95 shadow-lg shadow-slate-300/30"
      } ${className}`}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      <span className="pointer-events-none absolute left-4 flex h-5 w-5 items-center justify-center">
        <SunIcon
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-slate-500" : "text-amber-400"
          }`}
        />
      </span>
      <span className="pointer-events-none absolute right-4 flex h-5 w-5 items-center justify-center">
        <MoonIcon
          className={`h-5 w-5 transition-colors duration-300 ${
            isDark ? "text-sky-200" : "text-slate-500"
          }`}
        />
      </span>
      <span
        className={`pointer-events-none absolute left-1 top-1 h-10 w-10 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-[0_12px_35px_rgba(148,163,184,0.45)] transition-transform duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_16px_40px_rgba(15,23,42,0.6)] ${knobPositionClass}`}
      />
    </button>
  );
}
