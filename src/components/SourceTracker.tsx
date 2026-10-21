"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export type StoredAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  referrer?: string;
  landing?: string;
  at?: number;
};

export const ATTRIBUTION_KEY = "qds_attribution";

export function readAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : {};
  } catch {
    return {};
  }
}

/**
 * Captures UTM / referrer once per session and records a page view.
 * First-touch attribution wins, so an Instagram click is not overwritten
 * by later internal navigation.
 */
export function SourceTracker({ locale }: { locale: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get("utm_source") ?? undefined,
      medium: params.get("utm_medium") ?? undefined,
      campaign: params.get("utm_campaign") ?? undefined,
      content: params.get("utm_content") ?? undefined,
    };
    const hasUtm = Object.values(utm).some(Boolean);

    let stored = readAttribution();
    if (hasUtm && !stored.source) {
      stored = {
        ...utm,
        referrer: document.referrer || undefined,
        landing: pathname,
        at: Date.now(),
      };
      try {
        window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(stored));
      } catch {
        /* storage may be blocked — attribution degrades, the site still works */
      }
    } else if (!stored.referrer && document.referrer) {
      stored = { ...stored, referrer: document.referrer, at: Date.now() };
      try {
        window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(stored));
      } catch {
        /* ignore */
      }
    }

    const payload = JSON.stringify({
      path: pathname,
      locale,
      source: stored.source ?? (document.referrer ? "referral" : "direct"),
      referrer: document.referrer || undefined,
    });

    // sendBeacon survives navigation/unload, which `fetch` with keepalive
    // can lose — otherwise part of the page views never reaches analytics.
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }

    const controller = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      signal: controller.signal,
      body: payload,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [pathname, locale]);

  return null;
}
