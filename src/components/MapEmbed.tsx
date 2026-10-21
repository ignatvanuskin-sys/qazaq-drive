"use client";

import { useState } from "react";
import { brand } from "@/content/brand";
import { MapPin, Route } from "@/components/Icons";

/**
 * Click-to-load map. Nothing is requested from a third party until the
 * visitor asks for it, which keeps the page fast and avoids setting
 * third-party cookies on first paint.
 */
export function MapEmbed({
  title,
  label,
  note,
  openLabel,
  routeLabel,
  address,
}: {
  title: string;
  label: string;
  note: string;
  openLabel: string;
  routeLabel: string;
  address: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const embed = `https://yandex.kz/map-widget/v1/?ll=${brand.address.lng}%2C${brand.address.lat}&z=16&pt=${brand.address.lng},${brand.address.lat},pm2rdm`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)]">
      <div className="relative aspect-[16/10] w-full bg-[var(--color-surface-2)] sm:aspect-[16/8]">
        {loaded ? (
          <iframe
            src={embed}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div
              aria-hidden
              className="grid-texture absolute inset-0 opacity-40"
            />
            <span className="relative flex size-11 items-center justify-center rounded-full border border-[rgba(207,133,81,0.35)] bg-[rgba(207,133,81,0.1)] text-[var(--color-accent-soft)]">
              <MapPin size={20} />
            </span>
            <div className="relative">
              <p className="text-[0.9rem] font-semibold">{label}</p>
              <p className="mt-1 text-[0.8rem] text-[var(--color-muted)]">{address}</p>
              <p className="mt-2 max-w-[24rem] text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
                {note}
              </p>
            </div>
            <div className="relative flex flex-wrap items-center justify-center gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLoaded(true)}>
                {openLabel}
              </button>
              <a
                href={brand.links.gis2Route}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-quiet btn-sm"
              >
                <Route size={15} />
                {routeLabel}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
