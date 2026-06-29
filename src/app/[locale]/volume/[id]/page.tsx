import { getDictionary, locales } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContinuousReader from '@/components/ContinuousReader';
import { getVolumesForLocale, isVolumeAvailable } from '@/lib/translation-availability';

export async function generateStaticParams() {
  const volumeIds = ['1', '2', '3', '4', '5'];
  
  return locales.flatMap((locale) => 
    volumeIds.filter((id) => isVolumeAvailable(locale, Number(id))).map((id) => ({
      locale,
      id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const volume = volumes.find((item) => item.id === Number(id));
  if (!volume) return {};

  const dict = await getDictionary(locale);
  const title = getTranslationValue(dict, volume.titleKey) || dict.meta.title;
  const description = getTranslationValue(dict, volume.purposeKey) || dict.meta.description;
  const path = `/volume/${volume.id}`;

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
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const volId = parseInt(id, 10);
  const volume = volumes.find((v) => v.id === volId);

  if (!volume || !isVolumeAvailable(locale, volId)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <ContinuousReader
      locale={locale}
      initialSlug={`volume-${id}`}
      initialType="volume"
      dictionary={dict}
      volumes={getVolumesForLocale(locale, volumes)}
    />
  );
}
