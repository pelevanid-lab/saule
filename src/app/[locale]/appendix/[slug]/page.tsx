import { getDictionary, locales } from '@/lib/dictionaries';
import { getAppendixBySlug, getAllAppendices, volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import { getTranslationValue } from '@/lib/translation';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContinuousReader from '@/components/ContinuousReader';

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
    appendices.map((ap) => ({
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

  if (!appendix) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <ContinuousReader
      locale={locale}
      initialSlug={slug}
      initialType="appendix"
      dictionary={dict}
      volumes={volumes}
    />
  );
}
