'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DesktopNav({ locale, dict }: { locale: string; dict: any }) {
  const pathname = usePathname();

  const isHome = pathname === `/${locale}`;
  const isBook =
    pathname === `/${locale}/book` ||
    pathname.includes('/chapter/') ||
    pathname.includes('/appendix/') ||
    pathname.includes('/volume/');

  const isAccess = pathname === `/${locale}/app`;

  return (
    <nav className="hidden md:flex flex-1 items-center justify-end ml-8 mr-6">
      <div className="flex items-center space-x-6 text-sm font-sans font-semibold text-charcoal-muted">
        <Link
          href={`/${locale}`}
          className={`transition-colors ${isHome ? 'text-sage-dark font-bold' : 'hover:text-sage-dark'}`}
        >
          {dict.header.nav_home || 'Ana Sayfa'}
        </Link>
        <Link
          href={`/${locale}/book`}
          className={`transition-colors ${isBook ? 'text-sage-dark font-bold' : 'hover:text-sage-dark'}`}
        >
          {dict.header.nav_book || 'White Paper'}
        </Link>

        <Link
          href={`/${locale}/app`}
          className={`transition-colors ${isAccess ? 'text-sage-dark font-bold' : 'hover:text-sage-dark'}`}
        >
          {dict.header.nav_dashboard || 'Destek Paneli'}
        </Link>
      </div>
    </nav>
  );
}
