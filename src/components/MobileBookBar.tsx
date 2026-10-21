"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/booking/context";
import { ArrowRight } from "@/components/Icons";

/** Routes that already are the conversion surface must not get a second CTA. */
const SELF_SERVE = ["/booking"];

/**
 * Compact fixed CTA for phones.
 *
 * It only appears after the visitor has scrolled past the hero, so it can
 * never cover the primary hero buttons on short screens (320×568) or sit on
 * top of hero copy. Hidden while a dialog is open.
 */
export function MobileBookBar({ label }: { label: string }) {
  const { open, isOpen } = useBooking();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (isOpen || !visible || SELF_SERVE.some((path) => pathname?.endsWith(path))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[rgba(8,9,10,0.94)] px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:hidden">
      <button type="button" className="btn btn-primary w-full" onClick={() => open()}>
        {label}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
