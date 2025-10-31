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
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: downloading || applications.length === 0 ? "not-allowed" : "pointer",
        background: downloading ? "#4d7c0f" : "#22c55e",
        color: "white",
        fontWeight: 600
      }}
    >
      {downloading ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
