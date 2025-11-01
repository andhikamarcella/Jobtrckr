"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { createApplicationsWorkbookBlob } from "@/lib/exportToExcel";
import type { ApplicationRecord } from "@/lib/applicationTypes";

const ArrowIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 3v10" />
    <path d="m6 7 4-4 4 4" />
    <path d="M4 13h12v3H4z" />
  </svg>
);

interface ExportButtonProps {
  applications: ApplicationRecord[];
}

export function ExportButton({ applications }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    if (!applications.length || downloading) return;
    setDownloading(true);
    try {
      const blob = createApplicationsWorkbookBlob(applications);
      saveAs(blob, "jobtrackr-applications.xlsx");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!applications.length || downloading}
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_15px_35px_rgba(14,165,233,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <ArrowIcon />
      {downloading ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
