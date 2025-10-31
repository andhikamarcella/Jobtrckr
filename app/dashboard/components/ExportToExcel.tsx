"use client";

import { useState } from "react";

import {
  createApplicationsWorkbookBlob,
  type ApplicationRecord
} from "@/lib/exportToExcel";

type ExportToExcelProps = {
  applications: ApplicationRecord[];
};

export function ExportToExcel({ applications }: ExportToExcelProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const { saveAs } = await import("file-saver");
      const blob = createApplicationsWorkbookBlob(applications);
      saveAs(blob, "jobtrackr-applications.xlsx");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={downloading || applications.length === 0}
      className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:bg-gray-400"
    >
      {downloading ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
