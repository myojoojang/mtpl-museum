export function sampleIds(
  ids: readonly number[],
  count: number,
  random: () => number = Math.random,
): number[] {
  return Array.from({ length: Math.min(count, ids.length) }, () => {
    const selectedIndex = Math.floor(random() * ids.length);

    return ids[selectedIndex];
  });
}
