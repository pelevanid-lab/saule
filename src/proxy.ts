import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'tr', 'es', 'ru', 'zh-CN', 'ja', 'ko'];
const defaultLocale = 'en';

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  const requestedLocales = acceptLanguage.split(',').map((lang) => 
    lang.split(';')[0].trim()
  );

  for (const locale of requestedLocales) {
    if (locales.includes(locale)) {
      return locale;
    }
    const shortLocale = locale.substring(0, 2).toLowerCase();
    const matchedLocale = locales.find(l => l === shortLocale || l.startsWith(`${shortLocale}-`));
    if (matchedLocale) {
      return matchedLocale;
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

  // Redirect to prepend the matched locale prefix
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Intercept all paths except API routes, next static assets, and basic static files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|saule-logo.png|apple-icon.png|images|assets).*)',
  ],
};
