export function flattenArtwork(object, prefix = '', result = {}) {
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
