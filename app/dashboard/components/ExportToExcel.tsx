"use client";

import { useState } from "react";
import { Button } from "@chakra-ui/react";

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
    <Button
      onClick={handleExport}
      isLoading={downloading}
      loadingText="Exporting..."
      colorScheme="green"
      variant="solid"
      isDisabled={applications.length === 0}
    >
      Export to Excel
    </Button>
  );
}
