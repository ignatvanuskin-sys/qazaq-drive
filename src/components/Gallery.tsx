"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Close } from "@/components/Icons";

export type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

export function Gallery({
  items,
  closeLabel,
  prevLabel = "Previous",
  nextLabel = "Next",
}: {
  items: GalleryItem[];
  closeLabel: string;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    if (index === null) return;
    restore.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      restore.current?.focus?.();
    };
  }, [index, items.length, close]);

  if (items.length === 0) return null;

  const active = index === null ? null : items[index];

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={`${item.src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-left"
            aria-label={`${item.alt} — ${i + 1}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="img-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            {item.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,5,6,0.9)] to-transparent p-2.5 text-[0.7rem] text-[var(--color-muted)]">
                {item.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="lightbox-backdrop fixed inset-0 z-[90] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <span className="text-[0.75rem] tabular text-[var(--color-muted)]">
              {index! + 1} / {items.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"
              aria-label={closeLabel}
            >
              <Close size={18} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-3 pb-6 sm:px-8">
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes="100vw"
              className="max-h-[78dvh] w-auto max-w-full rounded-[10px] object-contain"
              priority
            />
            <button
              type="button"
              onClick={() => setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length))}
              className="absolute left-2 flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:left-4"
              aria-label={prevLabel}
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i === null ? i : (i + 1) % items.length))}
              className="absolute right-2 flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:right-4"
              aria-label={nextLabel}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {active.caption ? (
            <p className="px-6 pb-5 text-center text-[0.8rem] text-[var(--color-muted)]">
              {active.caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
