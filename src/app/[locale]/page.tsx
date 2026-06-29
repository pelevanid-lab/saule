import { getDictionary } from '@/lib/dictionaries';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-24 py-6 max-w-5xl mx-auto px-4">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 py-12 md:py-20 border-b border-sand-300/30">
        <div className="space-y-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-charcoal leading-tight">
            {dict.core_homepage?.hero_title || 'Saule'}
          </h1>
          <p className="font-serif text-lg md:text-2xl italic text-sage-dark font-medium leading-relaxed max-w-2xl mx-auto">
            {dict.core_homepage?.hero_subtitle || 'Adaptive Intelligence Platform'}
          </p>
        </div>
        
        <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed max-w-3xl mx-auto">
          {dict.core_homepage?.hero_desc}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href={`/${locale}/life`}
            className="w-full sm:w-auto px-6 py-3 bg-sage text-sand-100 font-sans font-bold text-xs uppercase tracking-widest rounded shadow-md hover:bg-sage-dark transition-all duration-300 cursor-pointer text-center"
          >
            {dict.core_homepage?.cta_life}
          </Link>
          <Link
            href={`/${locale}/business`}
            className="w-full sm:w-auto px-6 py-3 border border-clay text-clay hover:bg-clay/5 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
          >
            {dict.core_homepage?.cta_business}
          </Link>
          <Link
            href={`/${locale}/creative`}
            className="w-full sm:w-auto px-6 py-3 border border-sand-400 text-charcoal-muted hover:bg-sand-200/50 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
          >
            {dict.core_homepage?.cta_creative}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 pt-4 text-xs font-sans font-medium text-charcoal-muted uppercase tracking-widest">
          <Link href={`/${locale}/book`} className="hover:text-sage transition-colors">
            {dict.core_homepage?.cta_book}
          </Link>
          <span className="hidden sm:inline text-sand-300">•</span>
          <Link href={`/${locale}/community`} className="hover:text-sage transition-colors">
            {dict.core_homepage?.cta_community}
          </Link>
        </div>
      </section>

      {/* 2. ONE CORE, THREE APPLICATIONS */}
      <section className="space-y-12 py-6 border-b border-sand-300/30">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.core_homepage?.section_core_title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-sand-300/40 rounded bg-sand-50/50 hover:bg-sand-100 transition-colors">
            <h3 className="font-serif text-xl font-bold text-sage-dark mb-4">{dict.core_homepage?.card_life_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.core_homepage?.card_life_desc}
            </p>
          </div>
          <div className="p-8 border border-sand-300/40 rounded bg-sand-50/50 hover:bg-sand-100 transition-colors">
            <h3 className="font-serif text-xl font-bold text-clay mb-4">{dict.core_homepage?.card_business_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.core_homepage?.card_business_desc}
            </p>
          </div>
          <div className="p-8 border border-sand-300/40 rounded bg-sand-50/50 hover:bg-sand-100 transition-colors">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{dict.core_homepage?.card_creative_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.core_homepage?.card_creative_desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE ECOSYSTEM */}
      <section className="space-y-12 py-6 border-b border-sand-300/30 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.core_homepage?.section_eco_title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border border-sand-300/40 rounded hover:border-sage-dark/30 transition-colors">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{dict.core_homepage?.eco_book_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.core_homepage?.eco_book_desc}
            </p>
          </div>
          <div className="p-8 border border-sand-300/40 rounded hover:border-sage-dark/30 transition-colors">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{dict.core_homepage?.eco_community_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.core_homepage?.eco_community_desc}
            </p>
          </div>
        </div>
      </section>

      {/* 4. CORE TECHNOLOGY */}
      <section className="space-y-8 py-6 max-w-3xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.core_homepage?.section_tech_title}
          </h2>
          <p className="font-sans text-base text-charcoal-muted leading-relaxed">
            {dict.core_homepage?.tech_desc}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans text-charcoal-muted">
          {(dict.core_homepage?.tech_list || []).map((tech: string, i: number) => (
            <li key={i} className="flex items-center space-x-2">
              <span className="text-sage">▹</span>
              <span>{tech}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
