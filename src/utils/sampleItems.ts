export function sampleItems<T>(
  items: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  return Array.from({ length: Math.min(count, items.length) }, () => {
    const selectedIndex = Math.floor(random() * items.length);

    return items[selectedIndex];
  });
}
