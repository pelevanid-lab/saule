import { locales } from './dictionaries';
import { isPathAvailableForLocale } from './translation-availability';

export const SITE_URL = 'https://www.getsaule.com';

export function getLocalizedAlternates(path = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales
        .filter((locale) => isPathAvailableForLocale(locale, path))
        .map((locale) => [locale, `${SITE_URL}/${locale}${path}`]),
    ),
    'x-default': `${SITE_URL}/en${path}`,
  };
}
