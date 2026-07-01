'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileNav from '@/components/MobileNav';
import SauleLogo from '@/components/SauleLogo';
import BookLayoutWrapper from '@/components/BookLayoutWrapper';
import DesktopNav from '@/components/DesktopNav';
import type { Volume } from '@/lib/book';

interface NavItem {
  isHeader: boolean;
  label: string;
  path: string;
}

interface LocaleChromeProps {
  children: React.ReactNode;
  locale: string;
  dict: any;
  localizedVolumes: Volume[];
  navItems: NavItem[];
}

export default function LocaleChrome({
  children,
  locale,
  dict,
  localizedVolumes,
  navItems,
}: LocaleChromeProps) {
  const pathname = usePathname();
  const isBookPage = pathname.endsWith('/book') || 
                     pathname.includes('/chapter/') || 
                     pathname.includes('/appendix/') || 
                     pathname.includes('/volume/');
  return (
    <div className="flex flex-col min-h-screen bg-sand-100 selection:bg-sage/15 selection:text-sage-dark">
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

          <DesktopNav locale={locale} dict={dict} />

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
              {isBookPage && (
                <p className="max-w-md text-left sm:text-right leading-relaxed italic">
                  {dict.footer.warning}
                </p>
              )}
            </div>
          </footer>
        </div>
      </BookLayoutWrapper>
    </div>
  );
}
