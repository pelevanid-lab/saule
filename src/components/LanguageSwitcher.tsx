'use client';

import { usePathname, useRouter } from 'next/navigation';
import { isPathAvailableForLocale } from '@/lib/translation-availability';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const locales = [
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'es', label: 'Español' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const localizedPath = `/${segments.slice(2).join('/')}`.replace(/\/$/, '');
    const newPath = isPathAvailableForLocale(newLocale, localizedPath)
      ? segments.join('/')
      : `/${newLocale}/book`;

    router.push(newPath);
  };

  return (
    <label className="relative block font-sans text-xs sm:text-sm">
      <span className="sr-only">Language</span>
      <select
        value={currentLocale}
        onChange={(event) => handleLanguageChange(event.target.value)}
        className="max-w-28 sm:max-w-36 rounded-md border border-sage/25 bg-sand-100 px-2 py-1.5 font-medium text-charcoal-muted shadow-sm outline-none transition-colors hover:text-charcoal focus:border-sage"
        aria-label="Language"
      >
        {locales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </label>
  );
}
