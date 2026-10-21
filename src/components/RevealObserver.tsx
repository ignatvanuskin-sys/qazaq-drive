"use client";

import { useEffect } from "react";

/**
 * One observer for the whole page. Any element with [data-reveal] fades in
 * once. CSS handles prefers-reduced-motion, and if JS never runs the
 * `.no-js` fallback keeps content visible.
 */
export function RevealObserver() {
  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.setAttribute("data-revealed", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return null;
}
