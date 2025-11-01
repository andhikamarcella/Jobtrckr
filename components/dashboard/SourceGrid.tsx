import { SOURCE_CARD_GRADIENTS, SOURCE_OPTIONS, type ApplicationSource } from "@/lib/applicationTypes";

interface SourceGridProps {
  counts: Record<ApplicationSource, number>;
}

export function SourceGrid({ counts }: SourceGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SOURCE_OPTIONS.map((source) => (
        <article
          key={source.value}
          className={`relative overflow-hidden rounded-3xl border border-slate-200/80 p-4 shadow-lg shadow-slate-500/15 backdrop-blur-xl transition dark:border-white/10 dark:shadow-[0_18px_45px_rgba(15,23,42,0.45)] ${SOURCE_CARD_GRADIENTS[source.value]}`}
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/20 blur-xl dark:bg-white/5" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-white/80">{source.label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{counts[source.value] ?? 0}</p>
        </article>
      ))}
    </section>
  );
}
