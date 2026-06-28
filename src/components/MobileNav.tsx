'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  isHeader: boolean;
  label: string;
  path: string;
}

interface MobileNavProps {
  locale: string;
  navItems: NavItem[];
  tocLabel: string;
  logo: string;
  openLabel: string;
  closeLabel: string;
  dict: any;
}

export default function MobileNav({
  locale,
  navItems,
  tocLabel,
  logo,
  openLabel,
  closeLabel,
  dict,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isBookPage = pathname.endsWith('/book') ||
                     pathname.includes('/chapter/') ||
                     pathname.includes('/appendix/') ||
                     pathname.includes('/volume/');

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div className="md:hidden flex items-center">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded border border-sand-300 bg-sand-50 hover:bg-sand-200/50 text-charcoal text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer"
        aria-label={openLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-chapter-navigation"
      >
        <svg
          className="w-4 h-4 text-charcoal-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span className="font-sans font-medium uppercase text-xs">
          Menu
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex animate-fade-in">
          {/* Backdrop Mask */}
          <div
            onClick={closeMenu}
            className="fixed inset-0 bg-charcoal/30 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Content container */}
          <div
            id="mobile-chapter-navigation"
            className="relative flex flex-col w-full max-w-xs h-full bg-sand-100 shadow-2xl animate-slide-in z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-300 bg-sand-50">
              <span className="font-serif text-lg tracking-wider font-semibold text-sage-dark">
                {logo}
              </span>
              <button
                ref={closeRef}
                onClick={closeMenu}
                className="p-1.5 text-charcoal hover:bg-sand-200 rounded transition-all cursor-pointer"
                aria-label={closeLabel}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col space-y-6">
              {/* Main Website Navigation */}
              <div className="space-y-3">
                <span className="text-[10px] font-sans font-bold tracking-widest text-charcoal-muted/50 uppercase block">
                  Saule
                </span>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href={`/${locale}`}
                      onClick={closeMenu}
                      className={`block font-sans text-sm font-semibold py-1.5 ${
                        pathname === `/${locale}` ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {dict.header.nav_home || 'Ana Sayfa'}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/book`}
                      onClick={closeMenu}
                      className={`block font-sans text-sm font-semibold py-1.5 ${
                        pathname.includes('/book') || pathname.includes('/chapter/') || pathname.includes('/appendix/') || pathname.includes('/volume/')
                          ? 'text-sage-dark font-bold'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {dict.header.nav_book || 'Yaşayan Kitap'}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/community`}
                      onClick={closeMenu}
                      className={`block font-sans text-sm font-semibold py-1.5 ${
                        pathname === `/${locale}/community` ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {dict.header.nav_community || 'Community'}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/access`}
                      onClick={closeMenu}
                      className={`block font-sans text-sm font-semibold py-1.5 ${
                        pathname === `/${locale}/access` ? 'text-sage-dark font-bold' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {dict.header.nav_access || 'Erken Erişim'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Book TOC List (Only if on a book page) */}
              {isBookPage && (
                <div className="space-y-3 pt-6 border-t border-sand-300/40">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-charcoal-muted/50 uppercase block">
                    {tocLabel}
                  </span>
                  <ul className="flex flex-col space-y-1">
                    {navItems.map((item, idx) => {
                      if (item.isHeader) {
                        return (
                          <li key={`h-${idx}`} className="pt-4 pb-1 border-b border-sand-300/20 px-2 first:pt-0">
                            <span className="font-serif text-xs font-bold text-sage-dark tracking-wide uppercase">
                              {item.label}
                            </span>
                          </li>
                        );
                      }

                      const href = `/${locale}${item.path}`;
                      const isActive = pathname === href;

                      return (
                        <li key={`item-${idx}`} className="px-2">
                          <Link
                            href={href}
                            onClick={closeMenu}
                            className={`block font-serif text-sm py-2 border-l-2 pl-3 transition-all ${
                              isActive
                                ? 'border-sage text-sage-dark font-bold bg-sand-200/50'
                                : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
