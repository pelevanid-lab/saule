import { getDictionary, locales } from '@/lib/dictionaries';
import { getChapterBySlug, getAllChapters, volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContinuousReader from '@/components/ContinuousReader';
import { getVolumesForLocale, isChapterAvailable } from '@/lib/translation-availability';

export async function generateStaticParams() {
  const chapters = getAllChapters();
  
  return locales.flatMap((locale) => 
    chapters.filter((ch) => isChapterAvailable(locale, ch.slug)).map((ch) => ({
      locale,
      slug: ch.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return {};

  const dict = await getDictionary(locale);
  const title = getTranslationValue(dict, chapter.purposeKey.replace('.purpose', '.title')) || dict.meta.title;
  const description = getTranslationValue(dict, chapter.purposeKey) || dict.meta.description;
  const path = `/chapter/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: getLocalizedAlternates(path),
    },
    openGraph: { title, description, url: `/${locale}${path}`, type: 'article' },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter || !isChapterAvailable(locale, slug)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <ContinuousReader
      locale={locale}
      initialSlug={slug}
      initialType="chapter"
      dictionary={dict}
      volumes={getVolumesForLocale(locale, volumes)}
    />
  );
}
