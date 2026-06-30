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
      <section className="relative z-0 text-center flex flex-col items-center py-12 md:py-24">
        <div className="max-w-3xl mx-auto w-full space-y-8 px-4">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-charcoal leading-tight">
              {dict.home_page?.hero_title || 'Saule'}
            </h1>
            <p className="font-serif text-lg md:text-2xl italic text-sage-dark font-medium leading-relaxed">
              {dict.home_page?.hero_subtitle || 'Yaşam için uyumlanabilir zekâ.'}
            </p>
          </div>

          <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
            {dict.home_page?.hero_desc}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full">
            <Link
              href={`/${locale}/book`}
              className="w-full sm:w-auto px-6 py-3 bg-sage text-sand-100 font-sans font-bold text-xs uppercase tracking-widest rounded shadow-md hover:bg-sage-dark transition-all duration-300 cursor-pointer text-center"
            >
              {dict.home_page?.cta_book || dict.header.nav_book}
            </Link>
            <Link
              href={`/${locale}/access`}
              className="w-full sm:w-auto px-6 py-3 border border-clay text-clay hover:bg-clay/5 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
            >
              {dict.header.nav_access || 'Erken Erişim'}
            </Link>
            <Link
              href={`/${locale}/community`}
              className="w-full sm:w-auto px-6 py-3 border border-sand-400 text-charcoal-muted hover:bg-sand-200/50 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
            >
              {dict.home_page?.cta_community || dict.header.nav_community}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-12 py-6">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.home_page?.section_saule_title}
          </h2>
          <p className="font-sans text-base text-charcoal-muted leading-relaxed">
            {dict.home_page?.section_saule_desc}
          </p>
        </div>
      </section>

      <section className="space-y-12 py-6 border-b border-sand-300/30 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.home_page?.section_ecosystem_title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border border-sand-300/40 rounded hover:border-sage-dark/30 transition-colors">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{dict.home_page?.book_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.home_page?.book_desc}
            </p>
          </div>
          <div className="p-8 border border-sand-300/40 rounded hover:border-sage-dark/30 transition-colors">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">{dict.home_page?.community_title}</h3>
            <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
              {dict.home_page?.community_desc}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8 py-6 max-w-3xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.home_page?.section_principles_title}
          </h2>
          <p className="font-sans text-base text-charcoal-muted leading-relaxed">
            {dict.home_page?.principles_desc}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans text-charcoal-muted">
          {(dict.home_page?.principles || []).map((principle: string, i: number) => (
            <li key={i} className="flex items-center space-x-2">
              <span className="text-sage">▹</span>
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
