import BusinessCrmSite from '@/components/business-site/BusinessCrmSite';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    tr: 'Saule Business CRM',
    en: 'Saule Business CRM',
    ru: 'Saule Business CRM',
  };

  const descriptions: Record<string, string> = {
    tr: 'Saule Business CRM landing deneyimi: kurumsal hafıza, açık operasyonel döngüler ve öğrenen CRM yaklaşımı.',
    en: 'Saule Business CRM landing experience for company memory, open operational loops, and adaptive CRM.',
    ru: 'Landing-опыт Saule Business CRM о памяти компании, открытых операционных циклах и adaptive CRM.',
  };

  return {
    title: titles[locale] ?? 'Saule Business CRM',
    description:
      descriptions[locale] ??
      'Saule Business CRM landing experience for company memory, open operational loops, and adaptive CRM.',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <BusinessCrmSite locale={locale} page="home" />;
}
