'use client';

import { usePathname } from 'next/navigation';
import TOCSidebarClient from './TOCSidebarClient';
import type { Volume } from '@/lib/book';

interface BookLayoutWrapperProps {
  volumes: Volume[];
  dict: any;
  locale: string;
  children: React.ReactNode;
}

export default function BookLayoutWrapper({
  volumes,
  dict,
  locale,
  children,
}: BookLayoutWrapperProps) {
  const pathname = usePathname();
  
  // A page is considered part of the book reading shell if path ends in /book, /chapter/[slug], or /appendix/[slug]
  const isBookPage = pathname.endsWith('/book') ||
                     pathname.includes('/chapter/') ||
                     pathname.includes('/appendix/') ||
                     pathname.includes('/volume/');

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">
      {isBookPage && (
        <TOCSidebarClient volumes={volumes} dict={dict} locale={locale} />
      )}
      <main
        className={`flex-1 min-w-0 py-8 lg:py-12 flex flex-col justify-between w-full ${
          isBookPage ? 'lg:pl-12 max-w-3xl' : 'max-w-7xl mx-auto'
        }`}
      >
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
