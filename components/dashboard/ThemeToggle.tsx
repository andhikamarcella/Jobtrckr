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
      className={`relative inline-flex h-11 w-24 items-center rounded-full border px-2 transition duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        isDark
          ? "border-white/10 bg-slate-900/70 shadow-[0_18px_40px_rgba(15,23,42,0.45)]"
          : "border-slate-300 bg-white/90 shadow-lg shadow-slate-400/20"
      } ${className}`}
      aria-label="Toggle theme"
    >
      <SunIcon className={`h-4 w-4 transition ${isDark ? "text-white/40" : "text-amber-400"}`} />
      <span
        className={`absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 ${
          isDark
            ? "translate-x-12 bg-slate-950/90 shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
            : "translate-x-0 bg-white shadow-[0_10px_25px_rgba(148,163,184,0.4)]"
        }`}
      >
        {isDark ? <SunIcon className="h-4 w-4 text-amber-300" /> : <MoonIcon className="h-4 w-4 text-slate-800" />}
      </span>
      <MoonIcon className={`h-4 w-4 transition ${isDark ? "text-white" : "text-slate-400"}`} />
    </button>
  );
}
