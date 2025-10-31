'use client';

import { useState } from 'react';

import type { ApplicationRecord } from './ApplicationTable';
import { createApplicationsWorkbookBlob } from '@/lib/exportToExcel';

interface ExportToExcelProps {
  data: ApplicationRecord[];
}

export function ExportToExcel({ data }: ExportToExcelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data.length) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    setIsExporting(true);

    try {
      const { saveAs } = await import('file-saver');
      const blob = createApplicationsWorkbookBlob(data);
      saveAs(blob, 'jobtrackr-applications.xlsx');
    } catch (error) {
      console.error('Failed to export applications:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting ? 'Exporting…' : 'Export to Excel'}
    </button>
  );
}
