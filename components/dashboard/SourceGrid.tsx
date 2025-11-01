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
          className={`relative overflow-hidden rounded-3xl border border-slate-200/80 p-5 shadow-lg shadow-slate-400/15 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:shadow-[0_18px_45px_rgba(15,23,42,0.5)] ${SOURCE_CARD_GRADIENTS[source.value]}`}
        >
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/30 blur-3xl dark:bg-white/5" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-100">{source.label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{counts[source.value] ?? 0}</p>
        </article>
      ))}
    </section>
  );
}
