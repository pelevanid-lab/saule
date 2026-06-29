import { getDictionary, hasLocale, locales } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import { getLocalizedAlternates, SITE_URL } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNav from '@/components/MobileNav';
import SauleLogo from '@/components/SauleLogo';
import Link from 'next/link';
import type { Metadata } from 'next';
import BookLayoutWrapper from '@/components/BookLayoutWrapper';
import { notFound } from 'next/navigation';
import { Inter, Lora } from 'next/font/google';
import { getVolumesForLocale } from '@/lib/translation-availability';
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
        <div className="flex flex-col min-h-screen bg-sand-100 selection:bg-sage/15 selection:text-sage-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-100/90 backdrop-blur-sm border-b border-sand-300/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <MobileNav
              locale={locale}
              navItems={navItems}
              tocLabel={dict.common.toc}
              logo={dict.header.logo}
              openLabel={dict.common.open_navigation}
              closeLabel={dict.common.close_navigation}
              dict={dict}
            />
            <Link
              href={`/${locale}`}
              className="flex items-center space-x-2 hover:opacity-90 transition-all"
            >
              <SauleLogo size={28} className="flex-shrink-0" />
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-sage-dark">
                {dict.header.logo}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-sans font-semibold text-charcoal-muted">
            <Link href={`/${locale}`} className="hover:text-sage-dark transition-colors">
              {dict.header.nav_home || 'Ana Sayfa'}
            </Link>
            <Link href={`/${locale}/book`} className="hover:text-sage-dark transition-colors">
              {dict.header.nav_book || 'Yaşayan Kitap'}
            </Link>
            <Link href={`/${locale}/community`} className="hover:text-sage-dark transition-colors">
              {dict.header.nav_community || 'Community'}
            </Link>
            <Link href={`/${locale}/access`} className="hover:text-sage-dark transition-colors">
              {dict.header.nav_access || 'Erken Erişim'}
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </header>

      <BookLayoutWrapper volumes={localizedVolumes} dict={dict} locale={locale}>
        {children}
        <div className="mt-24 w-full">
          <footer className="pt-8 border-t border-sand-300/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans text-charcoal-muted/65">
              <p className="font-semibold tracking-wide uppercase">
                &copy; {new Date().getFullYear()} {dict.footer.owner}
              </p>
              <p className="max-w-md text-left sm:text-right leading-relaxed italic">
                {dict.footer.warning}
              </p>
            </div>
          </footer>
        </div>
      </BookLayoutWrapper>
        </div>
      </body>
    </html>
  );
}
