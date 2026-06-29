import { getDictionary, hasLocale, locales } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import { getLocalizedAlternates, SITE_URL } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Lora } from 'next/font/google';
import { getVolumesForLocale } from '@/lib/translation-availability';
import LocaleChrome from '@/components/LocaleChrome';
import '../globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: `%s — ${dict.header.logo}`,
    },
    description: dict.meta.description,
    icons: {
      icon: '/saule-symbol.svg',
      shortcut: '/saule-symbol.svg',
      apple: '/saule-symbol.svg',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: getLocalizedAlternates(),
    },
    openGraph: {
      type: 'website',
      url: `/${locale}`,
      siteName: dict.header.logo,
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const localizedVolumes = getVolumesForLocale(locale, volumes);

  // Prepare navigation tree for mobile selector mapping
  const navItems = localizedVolumes.flatMap((vol) => {
    const volTitle = getTranslationValue(dict, vol.titleKey) || '';
    return [
      { isHeader: true, label: volTitle, path: '' },
      ...vol.chapters.map((ch) => {
        const chTitle = getTranslationValue(dict, ch.purposeKey.replace('.purpose', '.title')) || '';
        const numStr = ch.chapterNumber.toString().padStart(2, '0');
        return {
          isHeader: false,
          label: `${numStr} ${chTitle}`,
          path: `/chapter/${ch.slug}`,
        };
      }),
      ...(vol.appendices || []).map((ap) => {
        const apTitle = getTranslationValue(dict, `appendices.${ap.slug}.title`) || '';
        const numStr = ap.appendixNumber.toString();
        const appendixLabel = dict.common.appendix || 'Appendix';
        return {
          isHeader: false,
          label: `${appendixLabel} ${numStr}: ${apTitle}`,
          path: `/appendix/${ap.slug}`,
        };
      }),
    ];
  });


  return (
    <html lang={locale} className={`${inter.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full bg-sand-100 text-charcoal">
        <LocaleChrome
          locale={locale}
          dict={dict}
          localizedVolumes={localizedVolumes}
          navItems={navItems}
        >
          {children}
        </LocaleChrome>
      </body>
    </html>
  );
}
