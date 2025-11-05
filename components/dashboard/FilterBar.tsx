"use client";

import type { ApplicationStatus } from "@/lib/applicationTypes";
import { STATUS_OPTIONS } from "@/lib/applicationTypes";

interface FilterBarProps {
  value: ApplicationStatus | "all";
  onChange: (status: ApplicationStatus | "all") => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const baseClasses =
    "group relative inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  return (
    <div className="flex w-full snap-x gap-2 overflow-x-auto pb-1">
      <FilterButton
        label="All"
        active={value === "all"}
        className={baseClasses}
        onClick={() => onChange("all")}
      />
      {STATUS_OPTIONS.map((option) => (
        <FilterButton
          key={option.value}
          label={option.label}
          active={value === option.value}
          className={baseClasses}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className: string;
}

function FilterButton({ label, active, onClick, className }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} ${
        active
          ? "border-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.4)]"
          : "border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-[1px] hover:border-slate-400"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
          active
            ? "border-slate-900/20 bg-white/70 text-slate-900"
            : "border-slate-300 bg-white text-slate-600"
        }`}
      >
        {label.charAt(0)}
      </span>
      <span className="capitalize tracking-wide">{label}</span>
      <svg
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-300 ${active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-60"}`}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M7 5l5 5-5 5"
          stroke={active ? "#0f172a" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
