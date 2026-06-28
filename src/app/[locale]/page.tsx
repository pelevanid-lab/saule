import { getDictionary } from '@/lib/dictionaries';
import { volumes, bookConfig } from '@/lib/book';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Status mapping helper for visual classes
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Locked':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'Reviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Drafting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Deprecated':
        return 'bg-sand-300 text-charcoal-muted border-sand-300';
      case 'Researching':
      default:
        return 'bg-sand-200 text-charcoal-muted border-sand-300/40';
    }
  };

  return (
    <div className="space-y-16">
      {/* Book Dashboard Header */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-sage/15 text-sage-dark border border-sage/20">
            {dict.dashboard.living_book_badge}
          </span>
          <span className="font-sans text-[11px] text-charcoal-muted uppercase tracking-widest font-semibold">
            {dict.dashboard.version_label} {bookConfig.version}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-charcoal leading-none">
            {dict.dashboard.title}
          </h1>
          <p className="font-serif text-lg sm:text-xl italic text-sage-dark font-medium">
            {dict.dashboard.subtitle}
          </p>
        </div>
      </section>

      {/* Book Metadata Board */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-5 border-t border-b border-sand-300/40 py-8">
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.status_label}
          </span>
          <span className="font-serif text-sm font-bold text-sage-dark block mt-1 leading-snug">
            {dict.dashboard.status_desc}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.last_updated_label}
          </span>
          <span className="font-serif text-sm font-bold text-charcoal block mt-1">
            2026-06-28
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_volumes}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            5
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_chapters}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            42
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_written}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            {bookConfig.writtenChaptersCount} / 42
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_sources}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            {bookConfig.researchSourcesCount}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_questions}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            {bookConfig.openQuestionsCount}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-charcoal-muted/60">
            {dict.dashboard.metric_decisions}
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal block mt-0.5">
            {bookConfig.designDecisionsCount}
          </span>
        </div>
      </section>

      {/* The Preface */}
      <section className="space-y-4 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold text-charcoal">
          {dict.dashboard.preface_title}
        </h2>
        <div className="font-serif text-base text-charcoal-muted leading-relaxed space-y-4">
          <p className="font-semibold text-charcoal italic pl-4 border-l-2 border-sage/40">
            {dict.dashboard.preface_body_1}
          </p>
          <p>{dict.dashboard.preface_body_2}</p>
          <p className="text-sm font-sans text-charcoal-muted/90">{dict.dashboard.preface_body_3}</p>
        </div>
      </section>

      {/* Volume Directory List */}
      <section className="space-y-8 border-t border-sand-300/40 pt-12">
        <h2 className="font-serif text-2xl font-semibold text-charcoal">
          {dict.dashboard.volumes_and_chapters}
        </h2>
        <div className="space-y-10">
          {volumes.map((vol) => {
            const volTitle = getTranslationValue(dict, vol.titleKey) || '';
            const volPurpose = getTranslationValue(dict, vol.purposeKey) || '';
            return (
              <div key={vol.id} className="space-y-4">
                <div className="space-y-1.5 pb-2 border-b border-sand-300/30">
                  <h3 className="font-serif text-lg font-bold text-sage-dark">
                    {volTitle}
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-charcoal-muted italic">
                    {volPurpose}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vol.chapters.map((ch) => {
                    const chTitle = getTranslationValue(dict, ch.purposeKey.replace('.purpose', '.title')) || '';
                    const numStr = ch.chapterNumber.toString().padStart(2, '0');
                    return (
                      <Link
                        key={ch.slug}
                        href={`/${locale}/chapter/${ch.slug}`}
                        className="p-4 bg-sand-200/25 border border-sand-300/10 hover:border-sage/20 hover:bg-sand-200/50 rounded flex items-center justify-between transition-all duration-300 group cursor-pointer"
                      >
                        <div className="space-y-1 flex-1 pr-4">
                          <span className="font-sans text-[10px] font-bold text-clay uppercase tracking-wider block">
                            {dict.common.chapter || 'Chapter'} {numStr}
                          </span>
                          <span className="font-serif text-sm font-semibold text-charcoal group-hover:text-sage-dark transition-colors block">
                            {chTitle}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-semibold border ${getStatusColorClass(ch.status)}`}>
                          {dict.workspace[`status_${ch.status.toLowerCase()}`] || ch.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Helper to resolve nested translation keys dynamically
function getTranslationValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const value = path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}
