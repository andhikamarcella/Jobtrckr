'use client';

import { saveAs } from 'file-saver';
import type { ApplicationRecord } from './ApplicationTable';
import { createApplicationsWorkbookBlob } from '@/lib/exportToExcel';

interface ExportToExcelProps {
  applications: ApplicationRecord[];
}

export function ExportToExcel({ applications }: ExportToExcelProps) {
  const handleExport = () => {
    if (!applications.length) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const blob = createApplicationsWorkbookBlob(applications);
    saveAs(blob, 'jobtrackr-applications.xlsx');
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-600"
    >
      Export to Excel
    </button>
  );
}
