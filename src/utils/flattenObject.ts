export type FlattenedValues = Record<string, string | number | boolean>;

export function flattenObject(
  object: object,
  prefix = '',
  result: FlattenedValues = {},
): FlattenedValues {
  const entries: Array<[string, unknown]> = Object.entries(object);

  for (const [key, value] of entries) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object') {
      flattenObject(value, path, result);
      continue;
    }

    if (value === '') {
      continue;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[path] = value;
    }
  }

  return result;
}
