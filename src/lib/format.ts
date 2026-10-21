export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  contacted: "В работе",
  scheduled: "Записан",
  enrolled: "Обучается",
  done: "Обработана",
  spam: "Спам",
};

export const STATUS_TONE: Record<string, string> = {
  new: "border-[rgba(207,133,81,0.45)] bg-[rgba(207,133,81,0.12)] text-[#e5a777]",
  contacted: "border-[rgba(120,170,255,0.35)] bg-[rgba(120,170,255,0.1)] text-[#9cc0ff]",
  scheduled: "border-[rgba(140,200,150,0.35)] bg-[rgba(140,200,150,0.1)] text-[#a5d8b0]",
  enrolled: "border-[rgba(140,200,150,0.35)] bg-[rgba(140,200,150,0.1)] text-[#a5d8b0]",
  done: "border-[var(--color-line)] bg-[rgba(255,255,255,0.05)] text-[var(--color-muted)]",
  spam: "border-[rgba(224,108,90,0.4)] bg-[rgba(224,108,90,0.1)] text-[#f0937f]",
};

export const INTENT_LABELS: Record<string, string> = {
  start: "Начать обучение",
  price: "Узнать стоимость",
  consult: "Консультация",
  schedule: "Уточнить расписание",
};

export const FORMAT_LABELS: Record<string, string> = {
  unspecified: "Не указан",
  group: "Групповые",
  individual: "Индивидуальные",
  online: "Онлайн-теория",
};

export const WINDOW_LABELS: Record<string, string> = {
  morning: "Утро 09:00–12:00",
  afternoon: "День 12:00–17:00",
  evening: "Вечер 17:00–20:00",
  any: "Любое",
};

export const METHOD_LABELS: Record<string, string> = {
  phone: "Звонок",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};

export function percent(part: number, total: number): string {
  if (!total) return "0%";
  const value = (part / total) * 100;
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}
