'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DesktopNav({ locale, dict }: { locale: string; dict: any }) {
  const pathname = usePathname();

  const isCore = pathname === `/${locale}`;
  const isLife = pathname === `/${locale}/life`;
  const isBusiness = pathname.startsWith(`/${locale}/business`);
  const isCreative = pathname === `/${locale}/creative`;

  return (
    <nav className="hidden md:flex flex-1 items-center justify-between ml-8 mr-6">
      {/* Products (Left Side) */}
      <div className="flex items-center space-x-6 text-sm font-sans font-semibold">
        <Link 
          href={`/${locale}`} 
          className={`transition-colors ${isCore ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'}`}
        >
          {dict.header.nav_core || 'Core'}
        </Link>
        <Link 
          href={`/${locale}/life`} 
          className={`transition-colors ${isLife ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'}`}
        >
          {dict.header.nav_life || 'Life'}
        </Link>
        <Link 
          href={`/${locale}/business`} 
          className={`transition-colors ${isBusiness ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'}`}
        >
          {dict.header.nav_business || 'Business'}
        </Link>
        <Link 
          href={`/${locale}/creative`} 
          className={`transition-colors ${isCreative ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'}`}
        >
          {dict.header.nav_creative || 'Creative'}
        </Link>
      </div>

      {/* Core Links (Right Side) */}
      <div className="flex items-center space-x-6 text-sm font-sans font-semibold text-charcoal-muted">
        <Link href={`/${locale}`} className="hover:text-sage-dark transition-colors">
          {dict.header.nav_home || 'Ana Sayfa'}
        </Link>
        <Link href={`/${locale}/book`} className="hover:text-sage-dark transition-colors">
          {dict.header.nav_book || 'Yaşayan Kitap'}
        </Link>
        <Link href={`/${locale}/community`} className="hover:text-sage-dark transition-colors">
          {dict.header.nav_community || 'Topluluk'}
        </Link>
      </div>
    </nav>
  );
}
