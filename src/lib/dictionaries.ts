import 'server-only';

export const locales = ['en', 'tr', 'es', 'ru'] as const;
export type Locale = (typeof locales)[number];

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  tr: () => import('../dictionaries/tr.json').then((module) => module.default),
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  ru: () => import('../dictionaries/ru.json').then((module) => module.default),
} as const;

export type Dictionary = typeof import('../dictionaries/en.json');

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

function mergeDictionaries(fallback: unknown, target: unknown): unknown {
  if (typeof fallback !== 'object' || fallback === null) {
    return target !== undefined ? target : fallback;
  }
  if (typeof target !== 'object' || target === null) {
    return fallback;
  }

  if (Array.isArray(fallback)) {
    if (Array.isArray(target) && target.length > 0) {
      return target.map((item, index) => 
        fallback[index] !== undefined ? mergeDictionaries(fallback[index], item) : item
      );
    }
    return fallback;
  }

  if (Array.isArray(target)) {
    return target;
  }

  const fallbackObj = fallback as Record<string, unknown>;
  const targetObj = target as Record<string, unknown>;

  const result: Record<string, unknown> = { ...fallbackObj };
  for (const key of Object.keys(fallbackObj)) {
    if (targetObj[key] !== undefined) {
      result[key] = mergeDictionaries(fallbackObj[key], targetObj[key]);
    }
  }
  for (const key of Object.keys(targetObj)) {
    if (result[key] === undefined) {
      result[key] = targetObj[key];
    }
  }
  return result;
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const enDict = await dictionaries.en();
  if (locale === 'en') return enDict;

  const loadDictionary = hasLocale(locale) ? dictionaries[locale] : undefined;
  if (!loadDictionary) return enDict;

  try {
    const localeDict = await loadDictionary();
    return mergeDictionaries(enDict, localeDict) as Dictionary;
  } catch {
    return enDict;
  }
};
