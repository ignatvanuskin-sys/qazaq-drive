import pathlib

# ---------- 1. Chat launcher: icon-only circle on phones -------------------
p = pathlib.Path("src/components/ChatWidget.tsx")
s = p.read_text(encoding="utf-8")
s = s.replace(
 'className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-30 flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[rgba(17,19,21,0.94)] py-2.5 pl-3 pr-3.5 text-[0.8125rem] font-semibold backdrop-blur-md transition-colors hover:border-[var(--color-accent)] sm:bottom-6 sm:right-6 sm:pr-4"',
 'className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-30 flex size-12 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(17,19,21,0.94)] text-[0.8125rem] font-semibold backdrop-blur-md transition-colors hover:border-[var(--color-accent)] sm:bottom-6 sm:right-6 sm:size-auto sm:justify-start sm:gap-2 sm:py-2.5 sm:pl-3 sm:pr-4"'
)
s = s.replace('className="flex size-8 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-text)]"',
              'className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-text)]"')
p.write_text(s, encoding="utf-8")

# ---------- 2. Analytics: sendBeacon so unloads are not lost ----------------
p = pathlib.Path("src/components/SourceTracker.tsx")
s = p.read_text(encoding="utf-8")
old = """    const controller = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      signal: controller.signal,
      body: JSON.stringify({
        path: pathname,
        locale,
        source: stored.source ?? (document.referrer ? "referral" : "direct"),
        referrer: document.referrer || undefined,
      }),
    }).catch(() => undefined);

    return () => controller.abort();"""
new = """    const payload = JSON.stringify({
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

    return () => controller.abort();"""
if old not in s:
    print("analytics block NOT found")
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")

# ---------- 3. Dictionary: error summary label -----------------------------
p = pathlib.Path("src/content/i18n/ru.ts")
s = p.read_text(encoding="utf-8")
s = s.replace('      duplicate: "Похоже, такая заявка уже отправлена. Мы свяжемся с вами.",',
              '      duplicate: "Похоже, такая заявка уже отправлена. Мы свяжемся с вами.",\n      summary: "Проверьте выделенные поля",')
p.write_text(s, encoding="utf-8")

p = pathlib.Path("src/content/i18n/kz.ts")
s = p.read_text(encoding="utf-8")
s = s.replace('      duplicate: "Мұндай өтінім бұрын жіберілген сияқты. Біз сізбен хабарласамыз.",',
              '      duplicate: "Мұндай өтінім бұрын жіберілген сияқты. Біз сізбен хабарласамыз.",\n      summary: "Белгіленген өрістерді тексеріңіз",')
p.write_text(s, encoding="utf-8")

# ---------- 4. Wizard: visible error summary + live success ----------------
p = pathlib.Path("src/components/booking/BookingWizard.tsx")
s = p.read_text(encoding="utf-8")
anchor = """          {stepTitles[step]}
        </h2>"""
summary = """          {stepTitles[step]}
        </h2>

        {Object.keys(errors).length > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-[8px] border border-[rgba(224,108,90,0.35)] bg-[rgba(224,108,90,0.08)] p-3"
          >
            <p className="text-[0.8rem] font-semibold text-[#f0937f]">{b.errors.summary}</p>
            <ul className="mt-1.5 space-y-1 pl-4 text-[0.78rem] text-[var(--color-muted)]">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key} className="list-disc">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}"""
if anchor not in s:
    print("wizard anchor NOT found")
s = s.replace(anchor, summary, 1)
s = s.replace('<div className="p-6 sm:p-8">\n        <div className="flex size-12',
              '<div className="p-6 sm:p-8" role="status" aria-live="polite">\n        <div className="flex size-12')
p.write_text(s, encoding="utf-8")
print("batch 1 done")
