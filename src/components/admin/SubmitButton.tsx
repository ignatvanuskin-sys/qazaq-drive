"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/Icons";

export function SubmitButton({
  children,
  className = "btn btn-primary btn-sm",
  pendingLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? "…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
