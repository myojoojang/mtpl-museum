export type ArtworkDetails = Record<string, string | number | boolean>;

export function flattenArtwork(
  object: object,
  prefix = '',
  result: ArtworkDetails = {},
): ArtworkDetails {
  const entries: Array<[string, unknown]> = Object.entries(object);

  entries.forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object') {
      flattenArtwork(value, path, result);
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      if (value !== '') {
        result[path] = value;
      }
    }
  });

  return result;
}
