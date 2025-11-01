"use client";

import type { ApplicationStatus } from "@/lib/applicationTypes";
import { STATUS_OPTIONS } from "@/lib/applicationTypes";

interface FilterBarProps {
  value: ApplicationStatus | "all";
  onChange: (status: ApplicationStatus | "all") => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="flex w-full snap-x gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
          value === "all"
            ? "border-sky-400 bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 shadow-[0_15px_35px_rgba(14,165,233,0.35)]"
            : "border-white/10 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
        }`}
      >
        All
      </button>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
            value === option.value
              ? "border-sky-400 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-slate-50 shadow-[0_18px_40px_rgba(99,102,241,0.4)]"
              : "border-white/10 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
