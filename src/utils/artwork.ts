import type { MetadataRecord, MetadataValue } from '../types/museum';

export type ArtworkDetails = Record<string, string | number | boolean>;

export function flattenArtwork(
  object: MetadataRecord | MetadataValue[],
  prefix = '',
  result: ArtworkDetails = {},
): ArtworkDetails {
  Object.entries(object || {}).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      flattenArtwork(value, path, result);
    } else if (value !== null && value !== undefined && value !== '') {
      result[path] = value;
    }
  });
  return result;
}
