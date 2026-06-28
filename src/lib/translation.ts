export function getTranslationValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  const value = path.split('.').reduce((current: unknown, part) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

export function getTranslationObject(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  return path.split('.').reduce((current: unknown, part) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function getTranslationMember(
  obj: object,
  key: string,
  fallback: string,
): string {
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : fallback;
}
