import BusinessPlatformSite from '@/components/business-site/BusinessPlatformSite';
import type { Metadata } from 'next';

type SitePage =
  | 'intelligence'
  | 'adaptive-ai'
  | 'company-memory'
  | 'pricing'
  | 'security'
  | 'resource'
  | 'legal'
  | 'login'
  | 'demo';

function resolvePage(slug: string[]): SitePage | null {
  const joined = slug.join('/');

  if (joined === 'intelligence') return 'intelligence';
  if (joined === 'platform/adaptive-ai') return 'adaptive-ai';
  if (joined === 'features/company-memory') return 'company-memory';
  if (joined === 'pricing') return 'pricing';
  if (joined === 'platform/security') return 'security';
  if (joined === 'resources/uyumlanabilir-zeka-nedir') return 'resource';
  if (joined === 'legal') return 'legal';
  if (joined === 'login') return 'login';
  if (joined === 'demo') return 'demo';

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = resolvePage(slug) ?? 'intelligence';

  const titlesMap: Record<string, Record<SitePage, string>> = {
    tr: {
      intelligence: 'Saule Uyumlanabilir Zeka',
      'adaptive-ai': 'Saule Öğrenen Yapay Zeka',
      'company-memory': 'Saule Kurumsal Hafıza',
      pricing: 'Saule Fiyatlandırma',
      security: 'Saule Güvenlik',
      resource: 'Uyumlanabilir Zeka Nedir?',
      legal: 'Saule Hukuki Bilgilendirme',
      login: 'Saule Business Giriş',
      demo: 'Saule Business Demo',
    },
    en: {
      intelligence: 'Saule Uyumlanabilir Zeka',
      'adaptive-ai': 'Saule Adaptive AI',
      'company-memory': 'Saule Company Memory',
      pricing: 'Saule Pricing',
      security: 'Saule Security',
      resource: 'What is Adaptive Intelligence?',
      legal: 'Saule Legal Information',
      login: 'Saule Business Sign In',
      demo: 'Saule Business Demo',
    },
    ru: {
      intelligence: 'Saule Uyumlanabilir Zeka',
      'adaptive-ai': 'Saule Адаптивный ИИ',
      'company-memory': 'Saule Память Компании',
      pricing: 'Saule Тарифы',
      security: 'Saule Безопасность',
      resource: 'Что такое Адаптивный ИИ?',
      legal: 'Saule Юридическая информация',
      login: 'Saule Business Вход',
      demo: 'Saule Business Демо',
    },
  };

  const titles = titlesMap[locale] ?? titlesMap['en'];

  return {
    title: titles[page],
    description: `${locale.toUpperCase()} business intelligence platform`,
  };
}

export default async function BusinessCrmSubpage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const page = resolvePage(slug) ?? 'intelligence';

  return <BusinessPlatformSite locale={locale} page={page} />;
}
