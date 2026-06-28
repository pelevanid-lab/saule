'use client';

import { useState, useEffect } from 'react';
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
}

export default function MobileNav({ locale, navItems, tocLabel, logo }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-sand-300 bg-sand-50 hover:bg-sand-200/50 text-charcoal text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer"
        aria-label="Open Chapters Navigation"
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
        <span className="font-sans font-medium uppercase text-[10px] sm:text-xs">
          {tocLabel}
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-sand-100 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-sand-300 bg-sand-50">
            <span className="font-serif text-lg tracking-wider font-semibold text-sage-dark">
              {logo}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-charcoal hover:bg-sand-200 rounded transition-all cursor-pointer"
              aria-label="Close Chapters Navigation"
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
          <nav className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 flex flex-col space-y-4">
            <span className="text-[10px] font-sans font-bold tracking-widest text-charcoal-muted/50 uppercase px-2 mb-2">
              {tocLabel}
            </span>
            <ul className="flex flex-col space-y-1">
              {navItems.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <li key={`h-${idx}`} className="pt-5 pb-1 border-b border-sand-300/20 px-2 first:pt-0">
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
                      onClick={() => setIsOpen(false)}
                      className={`block font-serif text-[15px] py-2 border-l-2 pl-3 transition-all ${
                        isActive
                          ? 'border-sage text-sage-dark font-semibold bg-sand-200/40 rounded-r'
                          : 'border-transparent text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
