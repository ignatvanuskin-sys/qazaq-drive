"use client";

import { useBooking } from "./context";

type Props = {
  children: React.ReactNode;
  className?: string;
  intent?: string;
  program?: string;
  comment?: string;
  ariaLabel?: string;
};

export function BookButton({ children, className, intent, program, comment, ariaLabel }: Props) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      className={className ?? "btn btn-primary"}
      aria-label={ariaLabel}
      onClick={() => open({ intent, program, comment })}
      data-booking-trigger
    >
      {children}
    </button>
  );
}
