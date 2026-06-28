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
    <div className="space-y-24 py-6 max-w-4xl mx-auto">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 py-12 md:py-20 border-b border-sand-300/30">
        <div className="space-y-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-charcoal leading-tight">
            {dict.homepage.hero_title}
          </h1>
          <p className="font-serif text-lg md:text-2xl italic text-sage-dark font-medium leading-relaxed max-w-2xl mx-auto">
            {dict.homepage.hero_subtitle}
          </p>
        </div>
        
        <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed max-w-2xl mx-auto">
          {dict.homepage.hero_desc}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href={`/${locale}/book`}
            className="w-full sm:w-auto px-6 py-3 bg-sage text-sand-100 font-sans font-bold text-xs uppercase tracking-widest rounded shadow-md hover:bg-sage-dark transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.cta_read_book}
          </Link>
          <Link
            href={`/${locale}/access`}
            className="w-full sm:w-auto px-6 py-3 border border-clay text-clay hover:bg-clay/5 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.cta_request_access}
          </Link>
          <Link
            href={`/${locale}/community`}
            className="w-full sm:w-auto px-6 py-3 border border-sand-400 text-charcoal-muted hover:bg-sand-200/50 font-sans font-bold text-xs uppercase tracking-widest rounded transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.cta_join_community}
          </Link>
        </div>
      </section>

      {/* 2. PROBLEM AREA */}
      <section className="space-y-6 max-w-3xl mx-auto py-6 border-b border-sand-300/30">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal leading-snug">
          {dict.homepage.problem_title}
        </h2>
        <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
          {dict.homepage.problem_text}
        </p>
      </section>

      {/* 3. OPEN BOOK, CLOSED APPLICATION */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-6 border-b border-sand-300/30">
        <div className="md:col-span-8 space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal leading-snug">
            {dict.homepage.open_book_title}
          </h2>
          <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
            {dict.homepage.open_book_text}
          </p>
        </div>
        <div className="md:col-span-4 md:pt-12">
          <Link
            href={`/${locale}/book`}
            className="block w-full px-5 py-3 border border-sage text-sage-dark font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-sage/10 transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.open_book_cta}
          </Link>
        </div>
      </section>

      {/* 4. COMMUNITY */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-6 border-b border-sand-300/30">
        <div className="md:col-span-8 space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal leading-snug">
            {dict.homepage.community_title}
          </h2>
          <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
            {dict.homepage.community_text}
          </p>
        </div>
        <div className="md:col-span-4 md:pt-12">
          <Link
            href={`/${locale}/community`}
            className="block w-full px-5 py-3 border border-sand-400 text-charcoal-muted font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-sand-200/50 transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.community_cta}
          </Link>
        </div>
      </section>

      {/* 5. EARLY ACCESS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-6 border-b border-sand-300/30">
        <div className="md:col-span-8 space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal leading-snug">
            {dict.homepage.access_title}
          </h2>
          <p className="font-sans text-sm md:text-base text-charcoal-muted leading-relaxed">
            {dict.homepage.access_text}
          </p>
        </div>
        <div className="md:col-span-4 md:pt-12">
          <Link
            href={`/${locale}/access`}
            className="block w-full px-5 py-3 border border-clay text-clay font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-clay/5 transition-all duration-300 cursor-pointer text-center"
          >
            {dict.homepage.access_cta}
          </Link>
        </div>
      </section>

      {/* 6. WHAT SAULE IS NOT */}
      <section className="p-6 bg-sand-200/40 border border-sand-300/30 rounded max-w-3xl mx-auto">
        <p className="font-sans text-xs md:text-sm text-charcoal-muted leading-relaxed italic text-center">
          {dict.homepage.what_saule_is_not}
        </p>
      </section>
    </div>
  );
}
