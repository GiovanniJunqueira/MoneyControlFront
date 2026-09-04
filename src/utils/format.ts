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
