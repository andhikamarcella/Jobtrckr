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
  return (
    <section className="rounded-4xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-500/15 transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/40 dark:shadow-[0_18px_45px_rgba(15,23,42,0.4)]">
      <div className="hidden md:grid grid-cols-[1.2fr,1.1fr,0.8fr,0.8fr,1fr,0.7fr] gap-4 border-b border-slate-200/70 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-300">
        <span>Company</span>
        <span>Position</span>
        <span>Applied</span>
        <span>Status</span>
        <span>Source</span>
        <span className="text-center">Actions</span>
      </div>
      <div className="divide-y divide-slate-200/80 dark:divide-white/5">
        {applications.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">Belum ada data lamaran.</p>
        ) : (
          applications.map((app) => (
            <article
              key={app.id}
              className="grid gap-4 px-6 py-4 transition hover:bg-slate-100/80 dark:hover:bg-white/5 md:grid-cols-[1.2fr,1.1fr,0.8fr,0.8fr,1fr,0.7fr]"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{app.company}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 md:hidden">{app.position}</p>
              </div>
              <div className="hidden text-sm text-slate-700 dark:text-slate-200 md:block">{app.position}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{app.applied_at}</div>
              <div>
                <span className={`badge ${STATUS_BADGE_STYLES[app.status]}`}>{getStatusLabel(app.status)}</span>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200">{getSourceLabel(app.source)}</div>
              <div className="flex items-center justify-start gap-2 md:justify-center">
                <button
                  type="button"
                  onClick={() => onEdit(app)}
                  className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800/80 dark:text-slate-50 dark:hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(app.id)}
                  className="rounded-full bg-rose-500/90 px-3 py-1 text-xs text-white transition hover:bg-rose-500"
                >
                  Delete
                </button>
              </div>
              {app.notes ? (
                <div className="md:col-span-6">
                  <p className="mt-2 rounded-3xl border border-slate-200/70 bg-white/90 p-3 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                    {app.notes}
                  </p>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
      <div className="space-y-4 px-4 py-6 md:hidden">
        {applications.map((app) => (
          <article
            key={app.id}
            className="rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-lg shadow-slate-500/10 transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_12px_35px_rgba(15,23,42,0.4)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{app.company}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{app.position}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{app.applied_at}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${STATUS_PILL_STYLES[app.status]}`}>
                {getStatusLabel(app.status)}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">Source: {getSourceLabel(app.source)}</p>
            {app.notes ? (
              <p className="mt-3 rounded-2xl border border-slate-200/70 bg-white/90 p-3 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {app.notes}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(app)}
                className="flex-1 rounded-full bg-slate-200 px-4 py-2 text-xs text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(app.id)}
                className="flex-1 rounded-full bg-rose-500/90 px-4 py-2 text-xs text-white transition hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
