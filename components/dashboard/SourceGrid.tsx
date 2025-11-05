import { SOURCE_CARD_GRADIENTS, SOURCE_OPTIONS, type ApplicationSource } from "@/lib/applicationTypes";

interface SourceGridProps {
  counts: Record<ApplicationSource, number>;
}

export function SourceGrid({ counts }: SourceGridProps) {
  return (
    <section className="rounded-4xl border border-white/60 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[520px] gap-3">
          {SOURCE_OPTIONS.map((source) => (
            <article
              key={source.value}
              className={`relative min-w-[140px] overflow-hidden rounded-3xl border border-white/70 px-3 py-4 text-slate-800 shadow-[0_14px_32px_rgba(148,163,184,0.25)] transition-transform duration-200 hover:-translate-y-1 ${SOURCE_CARD_GRADIENTS[source.value]}`}
            >
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-white/40 blur-2xl" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">{source.label}</p>
              <p className="mt-3 text-xl font-bold text-slate-900">{counts[source.value] ?? 0}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
