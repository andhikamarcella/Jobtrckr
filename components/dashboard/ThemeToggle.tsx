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
    () => (isDark ? "translate-x-[52px]" : "translate-x-0"),
    [isDark]
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-12 w-28 items-center justify-between rounded-full border px-3 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        isDark
          ? "border-white/15 bg-slate-950/70 shadow-[0_18px_40px_rgba(15,23,42,0.55)]"
          : "border-slate-200 bg-white/95 shadow-lg shadow-slate-300/30"
      } ${className}`}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      <SunIcon
        className={`z-10 h-5 w-5 transition-colors duration-300 ${
          isDark ? "text-slate-400" : "text-amber-400"
        }`}
      />
      <MoonIcon
        className={`z-10 h-5 w-5 transition-colors duration-300 ${
          isDark ? "text-sky-200" : "text-slate-500"
        }`}
      />
      <span
        className={`pointer-events-none absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 text-slate-800 shadow-[0_12px_35px_rgba(148,163,184,0.45)] transition-transform duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-amber-200 dark:shadow-[0_16px_40px_rgba(15,23,42,0.6)] ${knobPositionClass}`}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4 text-amber-200" />
        ) : (
          <SunIcon className="h-4 w-4 text-amber-400" />
        )}
      </span>
    </button>
  );
}
