import {
  STATUS_BADGE_STYLES,
  STATUS_PILL_STYLES,
  type ApplicationRecord,
  getSourceLabel,
  getStatusLabel,
} from "@/lib/applicationTypes";

interface ApplicationTableProps {
  applications: ApplicationRecord[];
  onEdit: (application: ApplicationRecord) => void;
  onDelete: (id: string) => void;
}

export function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  const hasApplications = applications.length > 0;

  return (
    <section className="rounded-4xl border border-white/60 bg-white/92 shadow-xl shadow-slate-200/60 backdrop-blur-2xl">
      <div className="hidden md:block">
        {!hasApplications ? (
          <p className="px-6 py-8 text-sm text-slate-500">Belum ada data lamaran.</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-white/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Applied</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {applications.map((app) => (
                <tr key={app.id} className="transition hover:bg-slate-100/70">
                  <td className="px-6 py-4 font-semibold text-slate-900">{app.company}</td>
                  <td className="px-4 py-4 text-slate-700">{app.position}</td>
                  <td className="px-4 py-4 text-slate-600">{app.applied_at}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${STATUS_BADGE_STYLES[app.status]}`}>{getStatusLabel(app.status)}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{getSourceLabel(app.source)}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {app.notes ? (
                      <span className="inline-block max-w-xs rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs leading-relaxed text-slate-600 shadow-sm">
                        {app.notes}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Tidak ada catatan</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(app)}
                        className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(app.id)}
                        className="rounded-full bg-rose-500/90 px-3 py-1 text-xs text-white transition hover:-translate-y-0.5 hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="space-y-4 px-4 py-6 md:hidden">
        {!hasApplications ? (
          <p className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 text-sm text-slate-500 shadow-sm">
            Belum ada data lamaran.
          </p>
        ) : (
          applications.map((app) => (
            <article
              key={app.id}
              className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-lg shadow-slate-400/25"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{app.company}</p>
                  <p className="text-sm text-slate-600">{app.position}</p>
                  <p className="mt-1 text-xs text-slate-500">{app.applied_at}</p>
                  <p className="mt-1 text-xs text-slate-500">Sumber: {getSourceLabel(app.source)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-medium shadow-sm ${STATUS_PILL_STYLES[app.status]}`}>
                  {getStatusLabel(app.status)}
                </span>
              </div>
              {app.notes ? (
                <p className="mt-3 rounded-2xl border border-slate-200/70 bg-white/95 p-3 text-xs text-slate-600 shadow-sm transition">
                  {app.notes}
                </p>
              ) : null}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(app)}
                  className="flex-1 rounded-full bg-slate-200 px-4 py-2 text-xs text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(app.id)}
                  className="flex-1 rounded-full bg-rose-500/90 px-4 py-2 text-xs text-white transition hover:-translate-y-0.5 hover:bg-rose-500"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
