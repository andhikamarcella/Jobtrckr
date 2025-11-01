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
          className={`rounded-3xl border border-white/10 bg-gradient-to-br ${SOURCE_CARD_GRADIENTS[source.value]} p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.4)] backdrop-blur-xl`}
        >
          <p className="text-xs uppercase tracking-wide text-white/70">{source.label}</p>
          <p className="mt-2 text-3xl font-semibold">{counts[source.value] ?? 0}</p>
        </article>
      ))}
    </section>
  );
}
