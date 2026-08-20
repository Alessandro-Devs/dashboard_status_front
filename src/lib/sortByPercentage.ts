export function sortDescendingByNumber<T>(items: T[], selector: (item: T) => number) {
  return [...items].sort((a, b) => selector(b) - selector(a));
}

export function parsePercentageValue(value: number | string) {
  if (typeof value === "number") return value;
  const normalized = value.replace("%", "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
