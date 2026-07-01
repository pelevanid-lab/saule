import type { Volume } from './book';

export const establishedLocales = ['en', 'tr', 'es', 'ru'] as const;
export const eastAsianLocales = ['zh-CN', 'ja', 'ko'] as const;

export function isEastAsianLocale(locale: string): boolean {
  return eastAsianLocales.includes(locale as (typeof eastAsianLocales)[number]);
}

export function isChapterAvailable(locale: string, slug: string): boolean {
  return true;
}

export function isVolumeAvailable(locale: string, id: number): boolean {
  return id === 1;
}

export function isAppendixAvailable(locale: string, slug: string): boolean {
  return true;
}

export function getVolumesForLocale(locale: string, source: Volume[]): Volume[] {
  return source.filter((volume) => isVolumeAvailable(locale, volume.id));
}

export function isPathAvailableForLocale(locale: string, path = ''): boolean {
  return true;
}
