import { getDictionary } from '@/lib/dictionaries';
import Image from 'next/image';
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
      {/* 1. HERO */}
      <section className="relative z-0 text-center flex flex-col items-center justify-center min-h-[70vh] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-clay/10 border border-sand-300/40 mt-2 md:mt-6">
        {/* Background Image */}
        <Image 
          src="/saule_hero.png" 
          alt="Saule Semantic Memory Layer" 
          fill
          className="object-cover object-center absolute inset-0 z-0 animate-fade-in transition-transform duration-[2000ms] hover:scale-105"
          priority
        />
        
        {/* Gradient and Blur Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-sand-100 via-sand-100/70 to-sand-100/10 z-10" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-3xl mx-auto w-full space-y-10 px-6 pt-32 pb-12 flex flex-col items-center">
          <div className="space-y-4">
            <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight text-charcoal leading-none drop-shadow-sm">
              {dict.home_page?.hero_title || 'Saule'}
            </h1>
            <p className="font-serif text-xl md:text-3xl italic text-sage-dark font-medium leading-relaxed drop-shadow-sm">
              {dict.home_page?.hero_subtitle}
            </p>
          </div>

          {/* 2. CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full">
            <Link
              href={`/${locale}/book`}
              className="w-full sm:w-auto px-8 py-4 bg-sage text-sand-100 font-sans font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:bg-sage-dark hover:shadow-lg transition-all duration-300 cursor-pointer text-center"
            >
              {dict.home_page?.cta_book || dict.header.nav_book}
            </Link>
            <Link
              href={`/${locale}/access`}
              className="w-full sm:w-auto px-8 py-4 bg-white/60 backdrop-blur-sm border border-clay/30 text-clay hover:bg-clay/10 font-sans font-bold text-xs uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer text-center shadow-sm hover:shadow"
            >
              {dict.header.nav_access || 'Erken Erişim'}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM DEFINITION */}
      <section className="py-12 max-w-5xl mx-auto border-t border-sand-300/30 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase block">
              {dict.home_page?.problem_title}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal leading-snug">
              {dict.home_page?.problem_desc}
            </h2>
          </div>
          
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-sand-300/40">
            <Image 
              src="/memory_crisis.png" 
              alt="Memory Crisis" 
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. SOLUTION DEFINITION */}
      <section className="space-y-12 py-6 max-w-3xl mx-auto">
        <div className="p-8 sm:p-12 border border-sand-300/40 rounded-lg bg-white/50 space-y-6 text-center">
          <h3 className="font-serif text-2xl font-bold text-charcoal">
            {dict.home_page?.solution_title}
          </h3>
          <p className="font-sans text-base text-charcoal-muted leading-relaxed">
            {dict.home_page?.solution_desc}
          </p>
        </div>
      </section>

      {/* 5. DESIGN PRINCIPLES */}
      <section className="space-y-8 py-16 border-t border-sand-300/30 max-w-3xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold text-charcoal leading-snug">
            {dict.home_page?.section_principles_title}
          </h2>
          <p className="font-sans text-base text-charcoal-muted leading-relaxed">
            {dict.home_page?.principles_desc}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-sans text-charcoal-muted">
          {(dict.home_page?.principles || []).map((principle: string, i: number) => (
            <li key={i} className="flex items-start space-x-3 p-4 bg-sand-200/30 rounded border border-sand-300/20">
              <span className="text-sage mt-0.5">▹</span>
              <span className="leading-relaxed">{principle}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. FOOTER CTA */}
      <section className="py-24 text-center space-y-8 border-t border-sand-300/30">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-sage-dark italic">
          {dict.home_page?.footer_cta}
        </h2>
        <div>
          <Link
            href={`/${locale}/book`}
            className="inline-block px-8 py-4 bg-sage text-sand-100 font-sans font-bold text-sm uppercase tracking-widest rounded shadow-md hover:bg-sage-dark transition-all duration-300 cursor-pointer"
          >
            {dict.home_page?.cta_book || dict.header.nav_book}
          </Link>
        </div>
      </section>
    </div>
  );
}
