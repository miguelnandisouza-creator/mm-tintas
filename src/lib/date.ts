const businessTimeZone = "America/Sao_Paulo";

export function toBusinessIsoDate(
  value: string | null | undefined,
  endOfDay = false,
): string | null {
  if (!value) {
    return null;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const normalized = dateOnly
    ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}-03:00`
    : value;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toBusinessDateInput(value: unknown) {
  const text =
    value === null || value === undefined ? "" : String(value);
  if (!text) return "";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
  }

  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: businessTimeZone,
    year: "numeric",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}
