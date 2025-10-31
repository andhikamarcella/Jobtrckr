import * as XLSX from "xlsx";

export type ApplicationRecord = {
  id: string;
  user_id?: string | null;
  company: string;
  position: string;
  applied_at: string;
  status: "waiting" | "interview" | "rejected" | "hired";
  notes?: string | null;
  created_at?: string | null;
};

export function createApplicationsWorkbookBlob(
  applications: ApplicationRecord[]
): Blob {
  const worksheetData = applications.map((application) => ({
    Company: application.company,
    Position: application.position,
    AppliedAt: application.applied_at,
    Status: application.status,
    Notes: application.notes ?? ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
