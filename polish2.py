import pathlib

# Lightbox controls to 44px
p = pathlib.Path("src/components/Gallery.tsx")
s = p.read_text(encoding="utf-8")
s = s.replace('className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"',
              'className="flex size-11 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"')
s = s.replace('className="absolute left-2 flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:left-4"',
              'className="absolute left-2 flex size-11 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:left-4"')
s = s.replace('className="absolute right-2 flex size-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:right-4"',
              'className="absolute right-2 flex size-11 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[rgba(8,9,10,0.6)] text-[var(--color-text)] sm:right-4"')
p.write_text(s, encoding="utf-8")

# Modal close button to 44px
p = pathlib.Path("src/components/booking/BookingModal.tsx")
s = p.read_text(encoding="utf-8")
s = s.replace('className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"',
              'className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"')
p.write_text(s, encoding="utf-8")

# Provenance caption under the stat strip
p = pathlib.Path("src/app/[locale]/page.tsx")
s = p.read_text(encoding="utf-8")
anchor = """            ))}
          </dl>
        </div>
      </section>"""
replacement = """            ))}
          </dl>
          <p className="pb-6 text-[0.7rem] text-[var(--color-faint)]">
            {kz ? "2GIS деректері" : "Данные 2ГИС"} · {reviewMeta.checkedAt}
          </p>
        </div>
      </section>"""
if anchor not in s:
    print("stats anchor NOT found")
s = s.replace(anchor, replacement, 1)
p.write_text(s, encoding="utf-8")
print("batch 2 done")
