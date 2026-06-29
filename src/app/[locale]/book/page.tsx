import { getDictionary } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import ContinuousReader from '@/components/ContinuousReader';
import { getVolumesForLocale } from '@/lib/translation-availability';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const title = dict.header.nav_book || "Saule Yaşayan Kitabı";
  const description = dict.meta.description;
  const path = `/book`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: getLocalizedAlternates(path),
    },
    openGraph: { title, description, url: `/${locale}${path}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <ContinuousReader
      locale={locale}
      initialSlug="preface"
      initialType="chapter"
      dictionary={dict}
      volumes={getVolumesForLocale(locale, volumes)}
    />
  );
}
