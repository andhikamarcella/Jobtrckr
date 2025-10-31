import { utils, write } from 'xlsx';

export interface ExportableApplication {
  id?: string;
  company: string;
  position: string;
  applied_at: string;
  status: string;
  notes?: string | null;
  created_at?: string | null;
}

export const buildApplicationsWorksheet = (applications: ExportableApplication[]) => {
  const sanitized = applications.map((application) => ({
    ID: application.id ?? '-',
    Company: application.company,
    Position: application.position,
    Applied_At: application.applied_at,
    Status: application.status,
    Notes: application.notes ?? ''
  }));

  return utils.json_to_sheet(sanitized);
};

export const createApplicationsWorkbookBlob = (
  applications: ExportableApplication[],
  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
) => {
  const worksheet = buildApplicationsWorksheet(applications);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Applications');

  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: fileType });
};
