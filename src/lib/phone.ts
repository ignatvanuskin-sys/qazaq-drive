/** Pure phone helpers — safe to import from client components. */

export function normalizeKzPhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  if (!digits) return null;
  let value = digits;
  if (value.length === 11 && value.startsWith("8")) value = "7" + value.slice(1);
  if (value.length === 10) value = "7" + value;
  if (value.length !== 11) return null;
  if (!value.startsWith("77")) return null;
  if (!/^77[0-8]\d{8}$/.test(value)) return null;
  return value;
}

export function formatKzPhone(raw: string): string {
  const n = normalizeKzPhone(raw);
  if (!n) return raw;
  return `+${n[0]} ${n.slice(1, 4)} ${n.slice(4, 7)} ${n.slice(7, 9)} ${n.slice(9, 11)}`;
}

/** Progressive input mask: "+7 708 086 10 28" */
export function maskKzPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  let rest = digits;
  if (rest.startsWith("8")) rest = "7" + rest.slice(1);
  if (!rest.startsWith("7")) rest = "7" + rest;
  rest = rest.slice(0, 11);
  const p = [rest.slice(0, 1), rest.slice(1, 4), rest.slice(4, 7), rest.slice(7, 9), rest.slice(9, 11)];
  let out = `+${p[0]}`;
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += ` ${p[2]}`;
  if (p[3]) out += ` ${p[3]}`;
  if (p[4]) out += ` ${p[4]}`;
  return out;
}
