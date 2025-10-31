'use client';

import type { ApplicationPayload } from './ApplicationForm';

export interface ApplicationRecord extends ApplicationPayload {
  id: string;
  created_at?: string | null;
}

interface ApplicationTableProps {
  applications: ApplicationRecord[];
  onEdit: (application: ApplicationRecord) => void;
  onDelete: (application: ApplicationRecord) => void;
}

export function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Belum ada data lamaran. Tambahkan data baru untuk mulai melacak.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-lg bg-white shadow">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Position</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Applied</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">{application.company}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{application.position}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {new Date(application.applied_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-slate-600">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                  {application.status}
                </span>
              </td>
              <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                <p className="whitespace-pre-line text-sm text-slate-500">
                  {application.notes ?? '-'}
                </p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(application)}
                    className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(application)}
                    className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
