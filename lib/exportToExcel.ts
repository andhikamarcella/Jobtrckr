import * as XLSX from "xlsx";

export type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: "waiting" | "interview" | "rejected" | "hired";
  notes?: string | null;
};

export function createApplicationsWorkbookBlob(applications: ApplicationRecord[]): Blob {
  const worksheetData = applications.map((app) => ({
    Company: app.company,
    Position: app.position,
    AppliedAt: app.applied_at,
    Status: app.status,
    Notes: app.notes ?? ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
