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
    <div className="space-y-16 py-12 max-w-4xl mx-auto px-4">
      {/* 1. HEADER SECTION */}
      <section className="text-center space-y-6">
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-charcoal">
          {dict.creative_page?.title || 'Saule Creative'}
        </h1>
        <p className="font-serif text-xl md:text-2xl italic text-sage-dark font-medium">
          {dict.creative_page?.subtitle || 'Adaptive intelligence for creation.'}
        </p>
        <p className="font-sans text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
          {dict.creative_page?.positioning || 'An AI creative intelligence workspace inspired by advertising, marketing, brand strategy, and creative production.'}
        </p>
      </section>

      {/* 2. LOGIN BUTTON (MOVED UP & ENLARGED) */}
      <div className="text-center py-4">
        <Link
          href="#"
          className="inline-block px-12 py-5 bg-charcoal text-sand-100 font-sans font-bold text-sm uppercase tracking-widest rounded shadow-lg hover:bg-charcoal/90 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          {dict.creative_page?.cta || 'Log in to Saule Creative'}
        </Link>
      </div>

      {/* 3. CAPABILITIES */}
      <section className="bg-sand-50/50 border border-sand-300/40 p-8 rounded-lg max-w-2xl mx-auto space-y-6">
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          {dict.creative_page?.capabilities_title || 'Capabilities'}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(dict.creative_page?.features || [
            'Brand memory', 'Campaign memory', 'Creative briefs', 'Audience insights',
            'Content ideas', 'Ad concepts', 'Creative testing', 'Performance learning',
            'AI advertising agency workflow'
          ]).map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center space-x-2 text-sm font-sans text-charcoal-muted">
              <span className="text-charcoal-muted font-bold">▹</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
