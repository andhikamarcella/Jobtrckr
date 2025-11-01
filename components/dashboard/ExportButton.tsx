"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { createApplicationsWorkbookBlob } from "@/lib/exportToExcel";
import type { ApplicationRecord } from "@/lib/applicationTypes";

const ArrowIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 4v11" />
    <path d="M8 8.5 12 4l4 4.5" />
    <path d="M6 15.5c3.5 1.2 8.5 1.2 12 0" />
    <path d="M6 18.5c3.5 1.2 8.5 1.2 12 0" opacity={0.65} />
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
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(14,165,233,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <ArrowIcon />
      {downloading ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
