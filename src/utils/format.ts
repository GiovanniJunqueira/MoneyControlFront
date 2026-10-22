export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatUnits(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} un`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/** Formata uma period key "YYYY-MM" como "Setembro de 2026". */
export function formatMonthName(periodKey: string): string {
  const [year, month] = periodKey.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Data de hoje no fuso do dispositivo (toISOString converteria pra UTC e viraria o dia cedo demais à noite). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2031-05-10" → "maio de 2031". */
export function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
