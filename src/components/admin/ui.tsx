import type { ReactNode } from "react";

export function AdminCard({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)]">
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-[0.9rem] font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--color-faint)]">
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
  hint,
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field !min-h-10 !py-2 text-[0.875rem]"
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
      />
      {hint ? <span className="mt-1 block text-[0.7rem] text-[var(--color-faint)]">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        className="field !min-h-0 !py-2 text-[0.875rem]"
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
      />
      {hint ? <span className="mt-1 block text-[0.7rem] text-[var(--color-faint)]">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-[0.8rem] text-[var(--color-muted)]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select
        className="field !min-h-10 !py-2 text-[0.875rem]"
        name={name}
        defaultValue={defaultValue ?? ""}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium ${
        tone ?? "border-[var(--color-line)] bg-[rgba(255,255,255,0.04)] text-[var(--color-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-faint)]">{label}</p>
      <p className="mt-2 text-[1.6rem] font-semibold leading-none tabular">{value}</p>
      {hint ? <p className="mt-2 text-[0.72rem] text-[var(--color-faint)]">{hint}</p> : null}
    </div>
  );
}
