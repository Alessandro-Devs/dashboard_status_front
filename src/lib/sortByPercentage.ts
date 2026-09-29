export function sortDescendingByNumber<T>(items: T[], selector: (item: T) => number) {
  return [...items].sort((a, b) => selector(b) - selector(a));
}
