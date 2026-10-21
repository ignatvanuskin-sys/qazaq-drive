"use client";

import { useEffect, useId, useRef, useState } from "react";
import { brand } from "@/content/brand";
import type { Dictionary } from "@/content/i18n/ru";
import type { Locale } from "@/lib/i18n";
import { maskKzPhone, normalizeKzPhone } from "@/lib/phone";
import { readAttribution } from "@/components/SourceTracker";
import { ArrowRight, Check, Close, Spinner, WhatsApp } from "@/components/Icons";

const INTENT_KEYS = ["start", "price", "consult", "schedule"] as const;
const FORMAT_KEYS = ["unspecified", "group", "individual", "online"] as const;
const WINDOW_KEYS = ["morning", "afternoon", "evening", "any"] as const;
const METHOD_KEYS = ["phone", "whatsapp", "telegram"] as const;

type IntentKey = (typeof INTENT_KEYS)[number];
type Draft = {
  intent: IntentKey | "";
  category: string;
  format: (typeof FORMAT_KEYS)[number];
  window: (typeof WINDOW_KEYS)[number];
  name: string;
  phone: string;
  method: (typeof METHOD_KEYS)[number];
  comment: string;
  consent: boolean;
};

const DRAFT_KEY = "qds_booking_draft";

const EMPTY: Draft = {
  intent: "",
  category: "help",
  format: "unspecified",
  window: "any",
  name: "",
  phone: "",
  method: "phone",
  comment: "",
  consent: false,
};

type Props = {
  locale: Locale;
  t: Dictionary;
  whatsapp?: string;
  initialIntent?: string;
  initialProgram?: string;
  initialComment?: string;
  onDone?: () => void;
  compact?: boolean;
};

export function BookingWizard({
  locale,
  t,
  whatsapp = brand.contact.whatsapp,
  initialIntent,
  initialProgram,
  initialComment,
  onDone,
  compact = false,
}: Props) {
  const b = t.booking;
  const uid = useId();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY,
    intent: (INTENT_KEYS as readonly string[]).includes(initialIntent ?? "")
      ? (initialIntent as IntentKey)
      : "",
    category: initialProgram ?? "help",
    comment: initialComment ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [publicId, setPublicId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(Date.now());
  const restored = useRef(false);

  /* Restore an in-progress draft (language switch, accidental close). */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Draft> & { step?: number };
      if (saved.intent) {
        setDraft((prev) => ({
          ...prev,
          ...saved,
          intent: prev.intent || (saved.intent as IntentKey),
          phone: saved.phone ?? prev.phone,
        }));
        if (typeof saved.step === "number" && saved.step > 0 && saved.step < 4) setStep(saved.step);
      }
    } catch {
      /* ignore malformed drafts */
    }
  }, []);

  useEffect(() => {
    if (status === "done") return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step }));
    } catch {
      /* storage might be disabled */
    }
  }, [draft, step, status]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const patch = (values: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...values }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(values)) delete next[key];
      return next;
    });
  };

  const validateStep = (index: number): boolean => {
    const next: Record<string, string> = {};
    if (index === 0 && !draft.intent) next.intent = b.errors.intent;
    if (index === 2) {
      if (draft.name.trim().length < 2) next.name = b.errors.name;
      if (!normalizeKzPhone(draft.phone)) next.phone = b.errors.phone;
      if (!draft.consent) next.consent = b.errors.consent;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    setStatus("sending");
    setServerError(null);
    const attribution = readAttribution();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          phone: draft.phone,
          intent: draft.intent,
          programSlug: draft.category === "help" ? null : draft.category,
          format: draft.format,
          contactMethod: draft.method,
          contactWindow: draft.window,
          comment: draft.comment.trim() || null,
          consent: draft.consent,
          locale,
          utm: {
            source: attribution.source,
            medium: attribution.medium,
            campaign: attribution.campaign,
            content: attribution.content,
          },
          referrer: attribution.referrer ?? null,
          pagePath: window.location.pathname,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        publicId?: string;
        code?: string;
      };

      if (res.ok && data.ok && data.publicId) {
        setPublicId(data.publicId);
        setStatus("done");
        try {
          window.sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        return;
      }

      if (res.status === 429) setServerError(b.errors.rate);
      else if (data.code === "duplicate_recent") setServerError(b.errors.duplicate);
      else setServerError(b.errors.generic);
      setStatus("error");
    } catch {
      setServerError(b.errors.network);
      setStatus("error");
    }
  };

  if (status === "done" && publicId) {
    const waText = encodeURIComponent(
      `${locale === "ru" ? "Здравствуйте! Я оставил заявку" : "Сәлеметсіз бе! Мен өтінім қалдырдым"} ${publicId} ${
        locale === "ru" ? "на сайте" : "сайтта"
      }.`,
    );
    return (
      <div className="p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-[rgba(207,133,81,0.14)] text-[var(--color-accent-soft)]">
          <Check size={22} />
        </div>
        <h2 className="display-m mt-5">{b.success.title}</h2>
        <p className="body-muted mt-3 text-sm">{b.success.text}</p>
        <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="eyebrow">{b.success.idLabel}</div>
          <div className="mt-1 text-xl font-semibold tracking-[0.06em] tabular">{publicId}</div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            className="btn btn-primary w-full sm:w-auto"
            href={`https://wa.me/${whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsApp size={17} />
            {b.success.whatsapp}
          </a>
          <button
            type="button"
            className="btn btn-ghost w-full sm:w-auto"
            onClick={() => {
              setStatus("idle");
              setPublicId(null);
              setDraft({ ...EMPTY });
              setStep(0);
              startedAt.current = Date.now();
              onDone?.();
            }}
          >
            {b.success.again}
          </button>
        </div>
      </div>
    );
  }

  const stepTitles = [b.step1.title, b.step2.title, b.step3.title, b.step4.title];
  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="flex max-h-[inherit] flex-col">
      {/* progress */}
      <div className="border-b border-[var(--color-line)] px-5 pb-4 pt-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-faint)]">
            <span className="text-[var(--color-accent-soft)]">{b.steps[step]}</span>
            <span aria-hidden>/</span>
            <span>
              {t.ui.step} {step + 1} {t.ui.of} 4
            </span>
          </div>
          <div className="hidden gap-1.5 sm:flex" aria-hidden>
            {b.steps.map((label, i) => (
              <span
                key={label}
                className="h-[3px] w-8 rounded-full transition-colors"
                style={{
                  background: i <= step ? "var(--color-accent)" : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)] sm:hidden">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="display-m text-[1.35rem] outline-none sm:text-[1.6rem]"
        >
          {stepTitles[step]}
        </h2>

        {/* Step 1 — intent */}
        {step === 0 ? (
          <fieldset className="mt-5">
            <legend className="sr-only">{stepTitles[0]}</legend>
            <p className="mb-4 text-sm text-[var(--color-muted)]">{b.step1.hint}</p>
            <div className="grid gap-2.5" role="radiogroup" aria-label={stepTitles[0]}>
              {INTENT_KEYS.map((key) => {
                const opt = b.step1.options[key];
                const id = `${uid}-intent-${key}`;
                return (
                  <label
                    key={key}
                    className="choice"
                    data-selected={draft.intent === key}
                    htmlFor={id}
                  >
                    <input
                      id={id}
                      type="radio"
                      name="intent"
                      value={key}
                      checked={draft.intent === key}
                      onChange={() => patch({ intent: key })}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor:
                          draft.intent === key ? "var(--color-accent)" : "rgba(255,255,255,0.28)",
                      }}
                    >
                      {draft.intent === key ? (
                        <span className="size-2 rounded-full bg-[var(--color-accent)]" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-[0.95rem] font-semibold">{opt.label}</span>
                      <span className="mt-0.5 block text-[0.8rem] text-[var(--color-muted)]">
                        {opt.desc}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.intent ? (
              <p className="field-error" role="alert">
                {errors.intent}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {/* Step 2 — program */}
        {step === 1 ? (
          <div className="mt-5 space-y-6">
            <div>
              <label className="field-label" htmlFor={`${uid}-category`}>
                {b.step2.category}
              </label>
              <select
                id={`${uid}-category`}
                className="field"
                value={draft.category}
                onChange={(e) => patch({ category: e.target.value })}
              >
                <option value="help">{b.step2.helpChoose}</option>
                {brand.categories.map((c) => (
                  <option key={c} value={c}>
                    {b.step2.category} {c}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[0.8rem] text-[var(--color-faint)]">{b.step2.categoryHint}</p>
            </div>

            <fieldset>
              <legend className="field-label">{b.step2.format}</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FORMAT_KEYS.map((key) => (
                  <label
                    key={key}
                    className="choice py-3"
                    data-selected={draft.format === key}
                    htmlFor={`${uid}-fmt-${key}`}
                  >
                    <input
                      id={`${uid}-fmt-${key}`}
                      type="radio"
                      name="format"
                      value={key}
                      checked={draft.format === key}
                      onChange={() => patch({ format: key })}
                      className="sr-only"
                    />
                    <span className="text-[0.875rem] font-medium">{b.step2.formats[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="field-label">{b.step2.window}</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {WINDOW_KEYS.map((key) => (
                  <label
                    key={key}
                    className="choice py-3"
                    data-selected={draft.window === key}
                    htmlFor={`${uid}-win-${key}`}
                  >
                    <input
                      id={`${uid}-win-${key}`}
                      type="radio"
                      name="window"
                      value={key}
                      checked={draft.window === key}
                      onChange={() => patch({ window: key })}
                      className="sr-only"
                    />
                    <span className="text-[0.875rem] font-medium">{b.step2.windows[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {/* Step 3 — contacts */}
        {step === 2 ? (
          <div className="mt-5 space-y-5">
            <div>
              <label className="field-label" htmlFor={`${uid}-name`}>
                {b.step3.name}
              </label>
              <input
                id={`${uid}-name`}
                className="field"
                type="text"
                name="name"
                autoComplete="name"
                placeholder={b.step3.namePlaceholder}
                value={draft.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                onChange={(e) => patch({ name: e.target.value })}
                maxLength={80}
              />
              {errors.name ? (
                <p className="field-error" id={`${uid}-name-err`} role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor={`${uid}-phone`}>
                {b.step3.phone}
              </label>
              <input
                id={`${uid}-phone`}
                className="field tabular"
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder={b.step3.phonePlaceholder}
                value={draft.phone}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={`${uid}-phone-hint${errors.phone ? ` ${uid}-phone-err` : ""}`}
                onChange={(e) => patch({ phone: maskKzPhone(e.target.value) })}
                onFocus={() => {
                  if (!draft.phone) patch({ phone: "+7 " });
                }}
                maxLength={20}
              />
              <p id={`${uid}-phone-hint`} className="mt-1.5 text-[0.78rem] text-[var(--color-faint)]">
                {b.step3.phoneHint}
              </p>
              {errors.phone ? (
                <p className="field-error" id={`${uid}-phone-err`} role="alert">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <fieldset>
              <legend className="field-label">{b.step3.method}</legend>
              <div className="flex flex-wrap gap-2">
                {METHOD_KEYS.map((key) => (
                  <label
                    key={key}
                    className="choice w-auto px-4 py-2"
                    data-selected={draft.method === key}
                    htmlFor={`${uid}-m-${key}`}
                  >
                    <input
                      id={`${uid}-m-${key}`}
                      type="radio"
                      name="method"
                      value={key}
                      checked={draft.method === key}
                      onChange={() => patch({ method: key })}
                      className="sr-only"
                    />
                    <span className="text-[0.85rem] font-medium">{b.step3.methods[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="field-label" htmlFor={`${uid}-comment`}>
                {b.step3.comment}{" "}
                <span className="font-normal text-[var(--color-faint)]">
                  ({t.ui.optional})
                </span>
              </label>
              <textarea
                id={`${uid}-comment`}
                className="field"
                name="comment"
                rows={3}
                maxLength={500}
                placeholder={b.step3.commentPlaceholder}
                value={draft.comment}
                onChange={(e) => patch({ comment: e.target.value })}
              />
            </div>

            {/* honeypot — hidden from users, bots fill it */}
            <div aria-hidden className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
              <label htmlFor={`${uid}-company`}>Company</label>
              <input id={`${uid}-company`} type="text" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-relaxed text-[var(--color-muted)]">
                <input
                  type="checkbox"
                  name="consent"
                  checked={draft.consent}
                  onChange={(e) => patch({ consent: e.target.checked })}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
                />
                <span>
                  {b.step3.consent}{" "}
                  <a
                    href={`/${locale}/privacy`}
                    className="link-underline text-[var(--color-text)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {b.step3.consentLink}
                  </a>
                  .
                </span>
              </label>
              {errors.consent ? (
                <p className="field-error" id={`${uid}-consent-err`} role="alert">
                  {errors.consent}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Step 4 — review */}
        {step === 3 ? (
          <div className="mt-5">
            <p className="mb-4 text-sm text-[var(--color-muted)]">{b.step4.hint}</p>
            <dl className="divide-y divide-[var(--color-line)] rounded-[var(--radius-sm)] border border-[var(--color-line)]">
              {[
                {
                  label: b.step4.intent,
                  value: draft.intent ? b.step1.options[draft.intent].label : b.step4.empty,
                  to: 0,
                },
                {
                  label: b.step4.program,
                  value:
                    draft.category === "help"
                      ? b.step2.helpChoose
                      : `${b.step4.program} ${draft.category}`,
                  to: 1,
                },
                { label: b.step4.format, value: b.step2.formats[draft.format], to: 1 },
                { label: b.step4.window, value: b.step2.windows[draft.window], to: 1 },
                { label: b.step4.name, value: draft.name, to: 2 },
                { label: b.step4.phone, value: draft.phone, to: 2 },
                { label: b.step4.method, value: b.step3.methods[draft.method], to: 2 },
                ...(draft.comment.trim()
                  ? [{ label: b.step4.comment, value: draft.comment.trim(), to: 2 }]
                  : []),
              ].map((row, i) => (
                <div key={`${row.label}-${i}`} className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-[0.78rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                    {row.label}
                  </dt>
                  <dd className="flex items-start gap-3 text-right text-[0.9rem]">
                    <span className="max-w-[15rem] break-words">{row.value || b.step4.empty}</span>
                    <button
                      type="button"
                      className="shrink-0 text-[0.75rem] text-[var(--color-accent-soft)] underline-offset-4 hover:underline"
                      onClick={() => setStep(row.to)}
                    >
                      {t.ui.change}
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--color-faint)]">
              {b.summaryNote}
            </p>
            {serverError ? (
              <p className="field-error mt-3" role="alert">
                {serverError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* footer */}
      <div className="border-t border-[var(--color-line)] px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={step === 0 ? onDone : back}
            disabled={status === "sending" && step === 3}
          >
            {step === 0 ? (compact ? t.cta.close : t.cta.back) : t.cta.back}
          </button>
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={next}>
              {t.cta.next}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <>
                  <Spinner />
                  {t.cta.sending}
                </>
              ) : (
                <>
                  {t.cta.submit}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
