import BusinessCrmSite from '@/components/business-site/BusinessCrmSite';
import type { Metadata } from 'next';

type SitePage =
  | 'crm'
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

  if (joined === 'crm') return 'crm';
  if (joined === 'platform/adaptive-ai') return 'adaptive-ai';
  if (joined === 'features/company-memory') return 'company-memory';
  if (joined === 'pricing') return 'pricing';
  if (joined === 'platform/security') return 'security';
  if (joined === 'resources/adaptive-crm-nedir') return 'resource';
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
  const page = resolvePage(slug) ?? 'crm';

  const titlesMap: Record<string, Record<SitePage, string>> = {
    tr: {
      crm: 'Saule Adaptive CRM',
      'adaptive-ai': 'Saule Öğrenen Yapay Zeka',
      'company-memory': 'Saule Kurumsal Hafıza',
      pricing: 'Saule Fiyatlandırma',
      security: 'Saule Güvenlik',
      resource: 'Adaptive CRM nedir?',
      legal: 'Saule Hukuki Bilgilendirme',
      login: 'Saule Business Giriş',
      demo: 'Saule Business Demo',
    },
    en: {
      crm: 'Saule Adaptive CRM',
      'adaptive-ai': 'Saule Adaptive AI',
      'company-memory': 'Saule Company Memory',
      pricing: 'Saule Pricing',
      security: 'Saule Security',
      resource: 'What is Adaptive CRM?',
      legal: 'Saule Legal Information',
      login: 'Saule Business Sign In',
      demo: 'Saule Business Demo',
    },
    ru: {
      crm: 'Saule Adaptive CRM',
      'adaptive-ai': 'Saule Адаптивный ИИ',
      'company-memory': 'Saule Память Компании',
      pricing: 'Saule Тарифы',
      security: 'Saule Безопасность',
      resource: 'Что такое Adaptive CRM?',
      legal: 'Saule Юридическая информация',
      login: 'Saule Business Вход',
      demo: 'Saule Business Демо',
    },
  };

  const titles = titlesMap[locale] ?? titlesMap['en'];

  return {
    title: titles[page],
    description: `${locale.toUpperCase()} business CRM experience`,
  };
}

export default async function BusinessCrmSubpage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const page = resolvePage(slug) ?? 'crm';

  return <BusinessCrmSite locale={locale} page={page} />;
}
