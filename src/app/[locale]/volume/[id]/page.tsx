import { getDictionary, locales } from '@/lib/dictionaries';
import { volumes } from '@/lib/book';
import { getLocalizedAlternates } from '@/lib/seo';
import { getTranslationMember, getTranslationValue } from '@/lib/translation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const volumeIds = ['1', '2', '3', '4', '5'];
  
  return locales.flatMap((locale) => 
    volumeIds.map((id) => ({
      locale,
      id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const volume = volumes.find((item) => item.id === Number(id));
  if (!volume) return {};

  const dict = await getDictionary(locale);
  const title = getTranslationValue(dict, volume.titleKey) || dict.meta.title;
  const description = getTranslationValue(dict, volume.purposeKey) || dict.meta.description;
  const path = `/volume/${volume.id}`;

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
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const volId = parseInt(id, 10);
  const volume = volumes.find((v) => v.id === volId);

  if (!volume) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const volTitle = getTranslationValue(dict, volume.titleKey) || '';
  const volPurpose = getTranslationValue(dict, volume.purposeKey) || '';
  
  // Resolve intro paragraph keys
  const introP1 = getTranslationValue(dict, `volumes.v${volume.id}.intro_p1`) || '';
  const introP2 = getTranslationValue(dict, `volumes.v${volume.id}.intro_p2`) || '';
  const introP3 = getTranslationValue(dict, `volumes.v${volume.id}.intro_p3`) || '';

  const prevVol = volumes.find((v) => v.id === volId - 1);
  const nextVol = volumes.find((v) => v.id === volId + 1);

  const prevTitle = prevVol ? getTranslationValue(dict, prevVol.titleKey) : '';
  const nextTitle = nextVol ? getTranslationValue(dict, nextVol.titleKey) : '';

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in py-6">
      {/* Volume Cover Heading */}
      <header className="space-y-4 text-center max-w-2xl mx-auto pb-8 border-b border-sand-300/30">
        <span className="text-xs font-sans font-bold tracking-[0.25em] text-clay uppercase">
          {dict.common.volume} {volume.romanId}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal leading-tight">
          {volTitle.replace(/^[^:]+:\s*/, '')}
        </h1>
        <p className="font-serif text-lg italic text-sage-dark leading-relaxed">
          {volPurpose}
        </p>
      </header>

      {/* Volume Introduction Text */}
      {introP1 && (
        <section className="space-y-6 font-serif text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl mx-auto border-l border-sage/30 pl-6 py-1 italic">
          <p>{introP1}</p>
          {introP2 && <p>{introP2}</p>}
          {introP3 && <p className="font-sans text-xs sm:text-sm text-charcoal-muted/70 not-italic pt-4">{introP3}</p>}
        </section>
      )}

      {/* Chapters Index under this Volume */}
      <section className="space-y-6 max-w-2xl mx-auto pt-8 border-t border-sand-300/30">
        <h2 className="font-serif text-xl font-bold text-charcoal uppercase tracking-wider">
          {dict.common.chapters_directory}
        </h2>
        <div className="space-y-3">
          {volume.chapters.map((ch) => {
            const chTitle = getTranslationValue(dict, ch.purposeKey.replace('.purpose', '.title')) || '';
            const numStr = ch.chapterNumber.toString().padStart(2, '0');
            return (
              <Link
                key={ch.slug}
                href={`/${locale}/chapter/${ch.slug}`}
                className="p-4 bg-sand-200/20 border border-sand-300/10 hover:border-sage/20 hover:bg-sand-200/40 rounded flex items-center justify-between transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-sans text-xs font-bold text-clay uppercase tracking-wider">
                    {numStr}
                  </span>
                  <span className="font-serif text-sm font-semibold text-charcoal group-hover:text-sage-dark transition-colors">
                    {chTitle}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-sans font-semibold border bg-sand-200 text-charcoal-muted border-sand-300/40">
                  {getTranslationMember(dict.workspace, `status_${ch.status.toLowerCase()}`, ch.status)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-sand-300/40 mt-16 text-sm max-w-2xl mx-auto">
        {prevVol ? (
          <Link
            href={`/${locale}/volume/${prevVol.id}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal flex flex-col items-start gap-1 cursor-pointer"
          >
            <span className="text-[10px] text-charcoal-muted/40 font-normal uppercase">&larr; {dict.common.previous_volume}</span>
            <span className="font-serif text-xs font-bold">{prevTitle}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal flex flex-col items-start gap-1 cursor-pointer"
          >
            <span className="text-[10px] text-charcoal-muted/40 font-normal uppercase">&larr; Dashboard</span>
            <span className="font-serif text-xs font-bold">{dict.header.logo}</span>
          </Link>
        )}

        {nextVol ? (
          <Link
            href={`/${locale}/volume/${nextVol.id}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-sage hover:text-sage-dark flex flex-col items-end gap-1 text-right cursor-pointer"
          >
            <span className="text-[10px] text-sage-light/60 font-normal uppercase">{dict.common.next_volume} &rarr;</span>
            <span className="font-serif text-xs font-bold">{nextTitle}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-sage hover:text-sage-dark flex flex-col items-end gap-1 text-right cursor-pointer"
          >
            <span className="text-[10px] text-sage-light/60 font-normal uppercase">Dashboard &rarr;</span>
            <span className="font-serif text-xs font-bold">{dict.header.logo}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
