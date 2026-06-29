import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'tr', 'es', 'ru', 'zh-CN', 'ja', 'ko'];
const defaultLocale = 'en';

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

  // Redirect to prepend the default locale prefix
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Intercept all paths except API routes, next static assets, and basic static files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|saule-logo.png|apple-icon.png|images|assets).*)',
  ],
};
