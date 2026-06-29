import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Desteklenen diller
const locales = ['tr', 'en', 'es', 'ru', 'ja', 'ko', 'zh-CN'];
// Varsayılan dil
const defaultLocale = 'tr';

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  const requestedLocales = acceptLanguage.split(',').map((lang) => 
    lang.split(';')[0].trim()
  );

  for (const locale of requestedLocales) {
    // Tam eşleşme kontrolü (örn: 'zh-CN')
    if (locales.includes(locale)) {
      return locale;
    }
    // Sadece ilk iki harfe göre eşleşme kontrolü (örn: 'en-US' -> 'en', 'zh' -> 'zh-CN')
    const shortLocale = locale.substring(0, 2).toLowerCase();
    const matchedLocale = locales.find(l => l === shortLocale || l.startsWith(`${shortLocale}-`));
    if (matchedLocale) {
      return matchedLocale;
    }
  }
  
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Zaten desteklenen dillerden birini içeriyorsa yönlendirme yapma
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Next.js dahili yolları, API rotaları ve statik dosyaları atla
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Kullanıcının sistem dilini al
  const locale = getLocale(request);
  
  // URL'yi yeniden oluştur ve yönlendir (basePath='/life' otomatik olarak hesaba katılır)
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Tüm yollarda middleware'i çalıştır, ancak _next, API ve public dosyaları atla
  matcher: [
    '/((?!_next|api|favicon.ico).*)',
  ],
}
