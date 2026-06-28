import { getDictionary } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNav from '@/components/MobileNav';
import EarlyAccessForm from '@/components/EarlyAccessForm';
import SauleLogo from '@/components/SauleLogo';
import Link from 'next/link';
import type { Metadata } from 'next';
import SidebarLinkClient from './SidebarLinkClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: {
        en: '/en',
        tr: '/tr',
        es: '/es',
        ru: '/ru',
      },
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
  const dict = await getDictionary(locale);

  // Prepare navigation tree for mobile selector mapping
  const navItems = volumes.flatMap((vol) => {
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
    ];
  });

  return (
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
            <span className="hidden sm:inline-block h-4 w-px bg-sand-300" />
            <span className="hidden sm:inline-block font-sans text-xs tracking-wider uppercase text-charcoal-muted/65 font-semibold">
              {dict.header.badge}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Sticky Sidebar TOC - Grouped by Volumes */}
        <aside className="hidden lg:block w-80 pr-8 py-12 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-sand-300/30">
          <nav className="space-y-8 pr-2">
            <span className="text-[10px] font-sans font-bold tracking-widest text-charcoal-muted/50 uppercase">
              {dict.common.toc}
            </span>
            <div className="space-y-6">
              {volumes.map((vol) => {
                const volTitle = getTranslationValue(dict, vol.titleKey) || '';
                return (
                  <div key={vol.id} className="space-y-2">
                    <Link
                      href={`/${locale}/volume/${vol.id}`}
                      className="font-serif text-xs font-bold text-sage-dark tracking-wide uppercase border-b border-sand-300/20 pb-1 hover:text-sage transition-colors block"
                    >
                      {volTitle}
                    </Link>
                    <ul className="space-y-1">
                      {vol.chapters.map((ch) => {
                        const chTitle = getTranslationValue(dict, ch.purposeKey.replace('.purpose', '.title')) || '';
                        const numStr = ch.chapterNumber.toString().padStart(2, '0');
                        return (
                          <li key={ch.slug}>
                            <SidebarLinkClient
                              href={`/${locale}/chapter/${ch.slug}`}
                              label={`${numStr} ${chTitle}`}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Content Wrapper */}
        <main className="flex-1 min-w-0 py-8 lg:py-12 lg:pl-12 flex flex-col justify-between">
          <div className="max-w-3xl w-full">
            {children}
          </div>

          {/* Page Footer containing the waitlist form */}
          <div className="mt-24 max-w-3xl w-full space-y-12">
            <section id="early-access" className="border-t border-sand-300/40 pt-12">
              <EarlyAccessForm dict={dict.early_access} />
            </section>
            
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
        </main>
      </div>
    </div>
  );
}

// Helper to resolve nested translations using path keys dynamically
function getTranslationValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const value = path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}
