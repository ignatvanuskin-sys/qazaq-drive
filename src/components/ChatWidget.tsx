"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/content/i18n/ru";
import type { Locale } from "@/lib/i18n";
import { useBooking } from "@/components/booking/context";
import { ArrowRight, Chat, Close, Send, Spinner } from "@/components/Icons";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "qds_chat_session";

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export function ChatWidget({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [launcherVisible, setLauncherVisible] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { open: openBooking } = useBooking();

  /* The booking screen is already the conversion surface: a floating
     launcher there would sit on top of the form's own buttons. */
  const hideLauncher = Boolean(pathname?.endsWith("/booking"));

  /* Keep the floating launcher off the hero: it appears once the visitor
     has scrolled past the first screen. */
  useEffect(() => {
    const onScroll = () => setLauncherVisible(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || sending) return;
    setError(null);
    const history = messages.slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), locale, message: value, history }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        leadPublicId?: string;
        disabled?: boolean;
        code?: string;
      };

      if (data.disabled || res.status === 503) {
        setDisabled(true);
        return;
      }
      if (res.status === 429) {
        setError(t.chat.error);
        return;
      }
      if (res.ok && data.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
        if (data.leadPublicId) setLeadId(data.leadPublicId);
      } else {
        setError(t.chat.error);
      }
    } catch {
      setError(t.chat.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        hidden={open || !launcherVisible || hideLauncher}
        aria-label={t.chat.launcher}
        className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-30 flex size-12 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(17,19,21,0.94)] text-[0.8125rem] font-semibold backdrop-blur-md transition-colors hover:border-[var(--color-accent)] sm:bottom-6 sm:right-6 sm:size-auto sm:justify-start sm:gap-2 sm:py-2.5 sm:pl-3 sm:pr-4"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-[rgba(207,133,81,0.16)] text-[var(--color-accent-soft)]">
          <Chat size={15} />
        </span>
        <span className="hidden sm:inline">AI</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t.chat.title}
          className="chat-panel fixed bottom-[calc(4.4rem+env(safe-area-inset-bottom))] right-3 z-[70] flex h-[min(560px,75dvh)] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-[18px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] sm:bottom-6 sm:right-6"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-[rgba(207,133,81,0.14)] text-[var(--color-accent-soft)]">
                <Chat size={16} />
              </span>
              <div>
                <div className="text-[0.85rem] font-semibold leading-tight">{t.chat.title}</div>
                <div className="text-[0.68rem] text-[var(--color-faint)]">
                  QAZAQ DRIVE SCHOOL
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.chat.minimized}
              className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              <Close size={15} />
            </button>
          </div>

          <div ref={listRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="max-w-[92%] rounded-[12px] rounded-tl-[4px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 text-[0.86rem] leading-relaxed text-[var(--color-muted)]">
              {t.chat.greeting}
            </div>

            {messages.length === 0 && !disabled ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.chat.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="chip text-left transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[88%] rounded-[12px] rounded-tr-[4px] bg-[var(--color-accent)] px-3.5 py-2.5 text-[0.86rem] leading-relaxed text-[var(--color-accent-ink)]"
                    : "max-w-[92%] rounded-[12px] rounded-tl-[4px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 text-[0.86rem] leading-relaxed whitespace-pre-wrap text-[var(--color-text)]"
                }
              >
                {m.content}
              </div>
            ))}

            {sending ? (
              <div className="flex items-center gap-2 text-[0.78rem] text-[var(--color-faint)]">
                <Spinner />
                <span>…</span>
              </div>
            ) : null}

            {error ? (
              <p className="text-[0.78rem] text-[#f0937f]" role="alert">
                {error}
              </p>
            ) : null}

            {disabled ? (
              <div className="rounded-[12px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.03)] p-3.5">
                <p className="text-[0.82rem] leading-relaxed text-[var(--color-muted)]">
                  {t.chat.unavailable}
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm mt-3 w-full"
                  onClick={() => {
                    setOpen(false);
                    openBooking({ intent: "consult" });
                  }}
                >
                  {t.chat.fallbackCta}
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : null}

            {leadId ? (
              <div className="rounded-[10px] border border-[rgba(207,133,81,0.35)] bg-[rgba(207,133,81,0.08)] px-3 py-2 text-[0.78rem]">
                <span className="text-[var(--color-muted)]">
                  {t.booking.success.idLabel}:{" "}
                </span>
                <span className="font-semibold tabular">{leadId}</span>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-[var(--color-line)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="chat-input">
                {t.chat.placeholder}
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                className="field !min-h-11 !py-2.5 text-[0.875rem]"
                placeholder={t.chat.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
                disabled={sending || disabled}
                autoComplete="off"
              />
              <button
                type="submit"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] disabled:opacity-40"
                disabled={sending || disabled || !input.trim()}
                aria-label={t.chat.send}
              >
                {sending ? <Spinner /> : <Send size={17} />}
              </button>
            </div>
            <p className="mt-2 text-[0.66rem] leading-snug text-[var(--color-faint)]">
              {t.chat.disclaimer}
            </p>
          </form>
        </div>
      ) : null}
    </>
  );
}
