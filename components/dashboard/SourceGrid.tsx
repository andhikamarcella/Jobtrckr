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
          className={`rounded-3xl border border-slate-200/70 bg-gradient-to-br p-4 shadow-lg shadow-slate-500/10 transition-colors duration-500 backdrop-blur-xl dark:border-white/10 dark:shadow-[0_18px_45px_rgba(15,23,42,0.4)] ${SOURCE_CARD_GRADIENTS[source.value]}`}
        >
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-white/70">{source.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{counts[source.value] ?? 0}</p>
        </article>
      ))}
    </section>
  );
}
