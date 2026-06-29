import { getDictionary, locales } from '@/lib/dictionaries';
import { getAppendixBySlug, getAllAppendices, volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContinuousReader from '@/components/ContinuousReader';
import { getVolumesForLocale, isAppendixAvailable } from '@/lib/translation-availability';

const getDynamicAppendixTitles = (loc: string): Record<string, string> => {
  switch (loc) {
    case 'tr':
      return {
        'open-questions': 'Açık Sorular',
        'design-decisions': 'Tasarım Kararları',
        'references': 'Kaynaklar',
      };
    case 'es':
      return {
        'open-questions': 'Preguntas Abiertas',
        'design-decisions': 'Decisiones de Diseño',
        'references': 'Referencias',
      };
    case 'ru':
      return {
        'open-questions': 'Открытые вопросы',
        'design-decisions': 'Дизайнерские решения',
        'references': 'Источники',
      };
    case 'zh-CN':
      return {
        'open-questions': '开放问题',
        'design-decisions': '设计决策',
        'references': '参考文献',
      };
    case 'ja':
      return {
        'open-questions': '未解決の問い',
        'design-decisions': '設計上の判断',
        'references': '参考文献',
      };
    case 'ko':
      return {
        'open-questions': '열린 질문',
        'design-decisions': '설계 결정',
        'references': '참고문헌',
      };
    case 'en':
    default:
      return {
        'open-questions': 'Open Questions',
        'design-decisions': 'Design Decisions',
        'references': 'References',
      };
  }
};

export async function generateStaticParams() {
  const appendices = getAllAppendices();
  
  return locales.flatMap((locale) => 
    appendices.filter((ap) => isAppendixAvailable(locale, ap.slug)).map((ap) => ({
      locale,
      slug: ap.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const appendix = getAppendixBySlug(slug);
  if (!appendix) return {};

  const dict = await getDictionary(locale);
  const isDynamic = slug.endsWith('-open-questions') ||
                    slug.endsWith('-design-decisions') ||
                    slug.endsWith('-references');
  
  let title = '';
  let description = '';
  
  if (isDynamic) {
    const type = slug.endsWith('-open-questions')
      ? 'open-questions'
      : slug.endsWith('-design-decisions')
      ? 'design-decisions'
      : 'references';
    const titles = getDynamicAppendixTitles(locale);
    const dynamicTitle = titles[type] || '';
    const appendixLabel = dict.common.appendix || 'Appendix';
    title = `${appendixLabel} ${appendix.appendixNumber}: ${dynamicTitle}`;
    description = `${dynamicTitle} for Volume ${appendix.volumeId}.`;
  } else {
    title = getTranslationValue(dict, `appendices.${slug}.title`) || dict.meta.title;
    description = getTranslationValue(dict, `appendices.${slug}.purpose`) || dict.meta.description;
  }
  
  const path = `/appendix/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: getLocalizedAlternates(path),
    },
    openGraph: { title, description, url: `/${locale}${path}`, type: 'article' },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const appendix = getAppendixBySlug(slug);

  if (!appendix || !isAppendixAvailable(locale, slug)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <ContinuousReader
      locale={locale}
      initialSlug={slug}
      initialType="appendix"
      dictionary={dict}
      volumes={getVolumesForLocale(locale, volumes)}
    />
  );
}
