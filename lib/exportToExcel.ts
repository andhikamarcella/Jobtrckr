import { utils, write } from 'xlsx';

import type { ApplicationRecord } from '@/app/dashboard/components/ApplicationTable';

const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

export function createApplicationsWorkbookBlob(data: ApplicationRecord[]): Blob {
  const rows = data.map((application) => ({
    Company: application.company,
    Position: application.position,
    AppliedAt: application.applied_at,
    Status: application.status,
    Notes: application.notes ?? ''
  }));

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Applications');

  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: EXCEL_MIME_TYPE });
}
