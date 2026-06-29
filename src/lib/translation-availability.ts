import type { Volume } from './book';

export const establishedLocales = ['en', 'tr', 'es', 'ru'] as const;
export const eastAsianLocales = ['zh-CN', 'ja', 'ko'] as const;

const translatedChapterSlugs = new Set([
  'why-we-are-overwhelmed',
  'mental-clutter',
  'the-attention-crisis',
  'open-loops',
  'escape-loops-and-addictions',
]);

const translatedAppendixSlugs = new Set([
  'volume-1-open-questions',
  'volume-1-design-decisions',
  'volume-1-references',
]);

export function isEastAsianLocale(locale: string): boolean {
  return eastAsianLocales.includes(locale as (typeof eastAsianLocales)[number]);
}

export function isChapterAvailable(locale: string, slug: string): boolean {
  return !isEastAsianLocale(locale) || translatedChapterSlugs.has(slug);
}

export function isVolumeAvailable(locale: string, id: number): boolean {
  return !isEastAsianLocale(locale) || id === 1;
}

export function isAppendixAvailable(locale: string, slug: string): boolean {
  return !isEastAsianLocale(locale) || translatedAppendixSlugs.has(slug);
}

export function getVolumesForLocale(locale: string, source: Volume[]): Volume[] {
  if (!isEastAsianLocale(locale)) return source;

  return source
    .filter((volume) => isVolumeAvailable(locale, volume.id))
    .map((volume) => ({
      ...volume,
      chapters: volume.chapters.filter((chapter) =>
        isChapterAvailable(locale, chapter.slug),
      ),
      appendices: (volume.appendices || []).filter((appendix) =>
        isAppendixAvailable(locale, appendix.slug),
      ),
    }));
}

export function isPathAvailableForLocale(locale: string, path = ''): boolean {
  const chapterMatch = path.match(/^\/chapter\/([^/]+)$/);
  if (chapterMatch) return isChapterAvailable(locale, chapterMatch[1]);

  const volumeMatch = path.match(/^\/volume\/(\d+)$/);
  if (volumeMatch) return isVolumeAvailable(locale, Number(volumeMatch[1]));

  const appendixMatch = path.match(/^\/appendix\/([^/]+)$/);
  if (appendixMatch) return isAppendixAvailable(locale, appendixMatch[1]);

  return true;
}
