import { locales } from './dictionaries';

export const SITE_URL = 'https://www.getsaule.com';

export function getLocalizedAlternates(path = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]),
    ),
    'x-default': `${SITE_URL}/en${path}`,
  };
}
