import { SOURCE_CARD_GRADIENTS, SOURCE_OPTIONS, type ApplicationSource } from "@/lib/applicationTypes";

interface SourceGridProps {
  counts: Record<ApplicationSource, number>;
}

export function SourceGrid({ counts }: SourceGridProps) {
  return (
    <section className="y2k-card p-5">
      <div className="relative z-10">
        <h3 className="y2k-section-title text-slate-500">Sumber Lamaran</h3>
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex w-max gap-3">
            {SOURCE_OPTIONS.map((source) => (
              <article
                key={source.value}
                className={`relative min-w-[135px] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 text-slate-800 shadow-[0_16px_32px_rgba(148,163,184,0.22)] transition-transform duration-200 hover:-translate-y-1 ${SOURCE_CARD_GRADIENTS[source.value]}`}
              >
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/40 blur-2xl" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">{source.label}</p>
                <p className="mt-3 text-xl font-bold text-slate-900">{counts[source.value] ?? 0}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
