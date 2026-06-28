import { getDictionary } from '@/lib/dictionaries';
import { getLocalizedAlternates } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const title = dict.community_page.title || "Saule Community";
  const description = dict.community_page.subtitle;
  const path = `/community`;

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
    <div className="space-y-16 py-6 max-w-3xl mx-auto">
      <header className="space-y-4 text-center md:text-left">
        <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase">
          Saule
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-charcoal leading-tight">
          {dict.community_page.title}
        </h1>
        <p className="font-serif text-lg italic text-sage-dark leading-relaxed max-w-2xl">
          {dict.community_page.subtitle}
        </p>
      </header>

      {/* 1. WHY COMMUNITY */}
      <section className="space-y-4 pt-8 border-t border-sand-300/30">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          {dict.community_page.why_title}
        </h2>
        <p className="font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
          {dict.community_page.why_text}
        </p>
      </section>

      {/* 2. THE COMMUNITY'S ROLE */}
      <section className="space-y-4 pt-8 border-t border-sand-300/30">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          {dict.community_page.role_title}
        </h2>
        <ul className="list-disc pl-5 space-y-2 font-sans text-sm sm:text-base text-charcoal-muted">
          <li>{dict.community_page.role_item1}</li>
          <li>{dict.community_page.role_item2}</li>
          <li>{dict.community_page.role_item3}</li>
          <li>{dict.community_page.role_item4}</li>
          <li>{dict.community_page.role_item5}</li>
        </ul>
      </section>

      {/* 3. COMMUNITY PRINCIPLE */}
      <section className="p-6 bg-sage/5 border border-sage/20 rounded max-w-2xl">
        <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-sage-dark mb-1">
          {dict.community_page.principle_title}
        </h3>
        <p className="font-serif text-base italic text-sage-dark font-semibold">
          “{dict.community_page.principle_text}”
        </p>
      </section>

      {/* 4. SUSTAINABILITY NOTE */}
      <section className="space-y-4 pt-8 border-t border-sand-300/30">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          {dict.community_page.sustainability_title}
        </h2>
        <p className="font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
          {dict.community_page.sustainability_text}
        </p>
      </section>
    </div>
  );
}
