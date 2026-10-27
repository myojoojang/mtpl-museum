export function sampleIds(ids, count, random = Math.random) {
  const pool = [...new Set(ids)];
  const size = Math.min(count, pool.length);
  for (let index = 0; index < size; index += 1) {
    const selected = index + Math.floor(random() * (pool.length - index));
    [pool[index], pool[selected]] = [pool[selected], pool[index]];
  }
  return pool.slice(0, size);
}
