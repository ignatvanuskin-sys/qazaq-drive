import type { Dictionary } from "@/content/i18n/ru";

type Item = { q: string; a: string; pending?: boolean };

/**
 * Native <details> accordion: works without JavaScript, is keyboard
 * operable and screen-reader friendly by default.
 */
export function FaqAccordion({
  items,
  t,
  defaultOpen = 0,
  idPrefix = "faq",
}: {
  items: readonly Item[];
  t: Dictionary;
  defaultOpen?: number;
  idPrefix?: string;
}) {
  return (
    <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
      {items.map((item, i) => (
        <details key={`${idPrefix}-${i}`} className="group" open={i === defaultOpen}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="flex items-start gap-4">
              <span className="mt-1 text-[0.68rem] font-semibold tabular text-[var(--color-faint)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.98rem] font-semibold leading-snug sm:text-[1.05rem]">
                {item.q}
                {item.pending ? (
                  <span className="ml-2 align-middle text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-soft)]">
                    {t.ui.toBeConfirmed}
                  </span>
                ) : null}
              </span>
            </span>
            <span
              aria-hidden
              className="relative mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-transform group-open:rotate-45"
            >
              <span className="absolute h-[1px] w-2.5 bg-current" />
              <span className="absolute h-2.5 w-[1px] bg-current" />
            </span>
          </summary>
          <div className="pb-6 pl-[2.35rem] pr-10">
            <p className="max-w-[46rem] text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
              {item.a}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
