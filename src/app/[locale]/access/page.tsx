import { getDictionary } from '@/lib/dictionaries';
import { getLocalizedAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import AccessForm from '@/components/AccessForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const title = dict.access_page.title || 'Saule Erken Erişim';
  const description = dict.access_page.subtitle;
  const path = '/access';

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: getLocalizedAlternates(path),
    },
    openGraph: { title, description, url: `/${locale}${path}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-16 py-6 max-w-3xl mx-auto px-4">
      <header className="space-y-4 text-center md:text-left">
        <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase">
          Saule
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-charcoal leading-tight">
          {dict.access_page.title}
        </h1>
        <p className="font-serif text-lg italic text-sage-dark leading-relaxed max-w-2xl">
          {dict.access_page.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-sand-300/30">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal">
            {dict.access_page.why_title}
          </h2>
          <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
            {dict.access_page.why_text}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal">
            {dict.access_page.process_title}
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 font-sans text-sm text-charcoal-muted">
            <li>{dict.access_page.process_item1}</li>
            <li>{dict.access_page.process_item2}</li>
            <li>{dict.access_page.process_item3}</li>
            <li>{dict.access_page.process_item4}</li>
            <li>{dict.access_page.process_item5}</li>
          </ol>
        </section>

        <section className="space-y-3 md:col-span-2 pt-6 border-t border-sand-300/20">
          <h2 className="font-serif text-lg font-bold text-charcoal">
            {dict.access_page.expectations_title}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc pl-5 font-sans text-sm text-charcoal-muted">
            <li>{dict.access_page.expectations_item1}</li>
            <li>{dict.access_page.expectations_item2}</li>
            <li>{dict.access_page.expectations_item3}</li>
            <li>{dict.access_page.expectations_item4}</li>
            <li>{dict.access_page.expectations_item5}</li>
          </ul>
        </section>
      </div>

      <AccessForm dict={dict.access_page} />

      {/* Gizli uygulama bağlantısı (Sadece yerini bilenler için) */}
      <div className="flex justify-center mt-8 pb-8">
        <a 
          href={`/${locale}/app`}
          className="text-[10px] text-sand-300 hover:text-sage transition-colors select-none cursor-pointer"
          title="Gizli Giriş"
        >
          ● SML Terminal
        </a>
      </div>
    </div>
  );
}
