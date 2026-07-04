import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'tr', 'es', 'ru', 'zh-CN', 'ja', 'ko'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  const preferredLocales = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, qValue] = lang.split(';q=');
      return {
        locale: locale.trim().split('-')[0],
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const preferred of preferredLocales) {
    if (locales.includes(preferred.locale)) {
      return preferred.locale;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files with extensions (e.g. .png, .ico, .svg) from being intercepted as locales
  if (pathname.includes('.') || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return;
  }

  // Check if pathname already contains one of the supported locale prefixes
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to prepend the negotiated locale prefix
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Intercept all paths except API routes, next static assets, and basic static files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|saule-logo.png|saule-logo.webp|apple-icon.png|images|assets).*)',
  ],
};
