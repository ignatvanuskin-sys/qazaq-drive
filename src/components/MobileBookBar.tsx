"use client";

import { useBooking } from "@/components/booking/context";
import { ArrowRight } from "@/components/Icons";

/**
 * Compact fixed CTA for phones. It sits above the safe-area inset and is
 * hidden while a dialog is open so it never covers form controls.
 */
export function MobileBookBar({ label }: { label: string }) {
  const { open, isOpen } = useBooking();
  if (isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[rgba(8,9,10,0.94)] px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:hidden">
      <button type="button" className="btn btn-primary w-full" onClick={() => open()}>
        {label}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
