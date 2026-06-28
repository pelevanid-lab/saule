'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const locales = [
    { code: 'en', label: 'EN' },
    { code: 'tr', label: 'TR' },
    { code: 'es', label: 'ES' },
    { code: 'ru', label: 'RU' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-1 text-xs sm:text-sm font-sans tracking-wide">
      {locales.map((locale) => (
        <button
          key={locale.code}
          onClick={() => handleLanguageChange(locale.code)}
          className={`px-2 py-1 rounded transition-all duration-200 border text-xs sm:text-sm font-medium ${
            currentLocale === locale.code
              ? 'border-sage/30 text-sage-dark bg-sand-200 shadow-sm font-semibold'
              : 'border-transparent text-charcoal-muted hover:text-charcoal hover:bg-sand-200/60'
          }`}
          aria-label={`Switch language to ${locale.label}`}
        >
          {locale.label}
        </button>
      ))}
    </div>
  );
}
