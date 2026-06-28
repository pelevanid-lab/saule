import type { MetadataRoute } from 'next';
import { bookConfig, getAllChapters, volumes } from '@/lib/book';
import { locales } from '@/lib/dictionaries';
import { getLocalizedAlternates, SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: bookConfig.lastUpdated,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages: getLocalizedAlternates() },
  }));

  const volumeEntries: MetadataRoute.Sitemap = volumes.flatMap((volume) => {
    const path = `/volume/${volume.id}`;
    const lastModified = volume.chapters.reduce(
      (latest, chapter) => (chapter.lastUpdated > latest ? chapter.lastUpdated : latest),
      '',
    );

    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages: getLocalizedAlternates(path) },
    }));
  });

  const chapterEntries: MetadataRoute.Sitemap = getAllChapters().flatMap((chapter) => {
    const path = `/chapter/${chapter.slug}`;
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: chapter.lastUpdated,
      changeFrequency: chapter.status === 'Locked' ? ('monthly' as const) : ('weekly' as const),
      priority: chapter.status === 'Researching' ? 0.5 : 0.7,
      alternates: { languages: getLocalizedAlternates(path) },
    }));
  });

  return [...homeEntries, ...volumeEntries, ...chapterEntries];
}
