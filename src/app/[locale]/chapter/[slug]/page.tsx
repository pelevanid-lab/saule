import { getDictionary } from '@/lib/dictionaries';
import { getChapterBySlug, getAllChapters, getVolumeByChapterSlug } from '@/lib/book';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface OpenQuestion {
  id: string;
  question: string;
  status: 'open' | 'in_research' | 'answered' | 'deprecated';
  answerSummary?: string;
  answeredInChapters?: string[];
  relatedChapters?: string[];
  decisionArea?: string;
  designDecisionId?: string;
  notes?: string;
}

interface ChapterDraft {
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  open_questions: (string | OpenQuestion)[];
  design_decisions: string[];
  future_evolution: string;
  references: string[];
}

export async function generateStaticParams() {
  const chapters = getAllChapters();
  const locales = ['en', 'tr', 'es', 'ru'];
  
  return locales.flatMap((locale) => 
    chapters.map((ch) => ({
      locale,
      slug: ch.slug,
    }))
  );
}

function getQuestionStatusBadgeClass(status: string) {
  switch (status) {
    case 'open':
      return 'bg-sand-200/60 text-charcoal border-sand-300/40';
    case 'in_research':
      return 'bg-amber-50 text-amber-800 border-amber-200/50';
    case 'answered':
      return 'bg-sage/10 text-sage-dark border-sage/20';
    case 'deprecated':
      return 'bg-red-50 text-red-800 border-red-200/50';
    default:
      return 'bg-sand-200/60 text-charcoal border-sand-300/40';
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const volume = getVolumeByChapterSlug(slug);
  const allChapters = getAllChapters();

  // Resolve related chapters and dependencies to actual titles for linking
  const resolvedDependencies = chapter.dependencies.map((depSlug) => {
    const depCh = allChapters.find((c) => c.slug === depSlug);
    const title = depCh ? getTranslationValue(dict, depCh.purposeKey.replace('.purpose', '.title')) : depSlug;
    return { slug: depSlug, title: title || depSlug };
  });

  const resolvedRelated = chapter.relatedChapters.map((relSlug) => {
    const relCh = allChapters.find((c) => c.slug === relSlug);
    const title = relCh ? getTranslationValue(dict, relCh.purposeKey.replace('.purpose', '.title')) : relSlug;
    return { slug: relSlug, title: title || relSlug };
  });

  // Resolve prev & next chapters for footer navigation
  const prevChapter = allChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
  const nextChapter = allChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);

  const prevTitle = prevChapter ? getTranslationValue(dict, prevChapter.purposeKey.replace('.purpose', '.title')) : '';
  const nextTitle = nextChapter ? getTranslationValue(dict, nextChapter.purposeKey.replace('.purpose', '.title')) : '';

  const volTitle = volume ? getTranslationValue(dict, volume.titleKey) : '';
  const chTitle = getTranslationValue(dict, chapter.purposeKey.replace('.purpose', '.title')) || '';
  const chPurpose = getTranslationValue(dict, chapter.purposeKey) || '';
  const chKeyQuestion = getTranslationValue(dict, chapter.keyQuestionKey) || '';

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

  const getConfidenceColorClass = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Experimental':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in">
      {/* Dynamic Header */}
      <header className="space-y-4">
        <div className="flex flex-col space-y-1">
          {volTitle && (
            <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase">
              {volTitle}
            </span>
          )}
          <span className="text-xs font-sans font-bold tracking-wider text-charcoal-muted/60 uppercase">
            {dict.common.chapter || 'Chapter'} {chapter.chapterNumber.toString().padStart(2, '0')}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal">
          {chTitle}
        </h1>
      </header>

      {/* Dynamic Status Notification */}
      {chapter.status === 'Researching' ? (
        <section className="p-5 bg-sand-200/50 border border-sand-300/30 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-clay/10 text-clay flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="font-serif text-sm italic text-charcoal-muted">
              {dict.workspace.not_written}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-sans font-bold uppercase text-charcoal-muted/50">
              {dict.workspace.status}:
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${getStatusColorClass(chapter.status)}`}>
              {dict.workspace[`status_${chapter.status.toLowerCase()}`] || chapter.status}
            </span>
          </div>
        </section>
      ) : (
        <section className="p-5 bg-sage/5 border border-sage/20 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-sage/10 text-sage-dark flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="font-serif text-sm italic text-sage-dark font-medium">
              {dict.workspace.draft_mode_desc || 'This chapter is currently in draft mode.'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-sans font-bold uppercase text-charcoal-muted/50">
              {dict.workspace.status}:
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${getStatusColorClass(chapter.status)}`}>
              {dict.workspace[`status_${chapter.status.toLowerCase()}`] || chapter.status}
            </span>
          </div>
        </section>
      )}

      {/* Metadata Specification Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-sand-300/40 py-8 text-sm">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
              {dict.workspace.purpose}
            </span>
            <p className="font-sans text-xs sm:text-sm text-charcoal-muted leading-relaxed mt-1">
              {chPurpose}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
              {dict.workspace.key_question}
            </span>
            <p className="font-serif text-xs sm:text-sm italic font-bold text-sage-dark leading-relaxed mt-1">
              “{chKeyQuestion}”
            </p>
          </div>
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
              {dict.workspace.dependencies}
            </span>
            {resolvedDependencies.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {resolvedDependencies.map((dep) => (
                  <Link
                    key={dep.slug}
                    href={`/${locale}/chapter/${dep.slug}`}
                    className="px-2 py-1 rounded bg-sand-200 border border-sand-300/40 text-charcoal hover:bg-sand-300/50 text-[10px] font-sans transition-all cursor-pointer"
                  >
                    {dep.title}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-xs text-charcoal-muted/40 italic block mt-1">{dict.common.none || 'None'}</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
                {dict.workspace.version}
              </span>
              <span className="font-serif text-xs sm:text-sm font-bold text-charcoal block mt-0.5">
                {chapter.version}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
                {dict.workspace.reading_time}
              </span>
              <span className="font-serif text-xs sm:text-sm font-bold text-charcoal block mt-0.5">
                {chapter.readingTime.replace('-', '–').replace('min', dict.common.minutes || 'min')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
                {dict.workspace.research_confidence}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold border mt-1 ${getConfidenceColorClass(chapter.researchConfidence)}`}>
                {dict.workspace[`confidence_${chapter.researchConfidence.toLowerCase()}`] || chapter.researchConfidence}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
                {dict.workspace.last_updated}
              </span>
              <span className="font-serif text-xs sm:text-sm font-bold text-charcoal block mt-0.5">
                {chapter.lastUpdated}
              </span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-muted/50 block">
              {dict.workspace.related_chapters}
            </span>
            {resolvedRelated.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {resolvedRelated.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/${locale}/chapter/${rel.slug}`}
                    className="px-2 py-1 rounded bg-sand-200 border border-sand-300/40 text-charcoal hover:bg-sand-300/50 text-[10px] font-sans transition-all cursor-pointer"
                  >
                    {rel.title}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-xs text-charcoal-muted/40 italic block mt-1">{dict.common.none || 'None'}</span>
            )}
          </div>
        </div>
      </section>

      {/* Conditionally Render Draft Content or Research Workspace */}
      {(() => {
        const chDraft = getTranslationObject(dict, `chapters.${chapter.slug}.draft`);
        if (chDraft && typeof chDraft === 'object') {
          const draft = chDraft as unknown as ChapterDraft;
          return (
            <div className="space-y-12 sm:space-y-16">
              {/* Narrative Sections */}
              {Array.isArray(draft.sections) &&
                draft.sections.map((sec, sIdx) => (
                  <section key={sIdx} className="space-y-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal">
                      {sec.heading}
                    </h2>
                    <div className="space-y-4 font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
                      {Array.isArray(sec.paragraphs) &&
                        sec.paragraphs.map((p: string, pIdx: number) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                    </div>
                  </section>
                ))}

              {/* Open Questions & Design Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-sand-300/40 py-10">
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.open_questions}
                  </h3>
                  {dict.workspace.open_questions_intro && (
                    <p className="text-xs text-charcoal-muted/70 italic leading-relaxed mb-4">
                      {dict.workspace.open_questions_intro}
                    </p>
                  )}
                  <div className="space-y-4">
                    {Array.isArray(draft.open_questions) &&
                      draft.open_questions.map((q, qIdx) => {
                        if (typeof q === 'string') {
                          return (
                            <div key={qIdx} className="p-4 rounded border border-sand-300/30 bg-sand-100/20 font-serif text-sm leading-relaxed text-charcoal-muted">
                              {q}
                            </div>
                          );
                        }
                        
                        const item = q as OpenQuestion;
                        return (
                          <div key={item.id || qIdx} className="p-4 rounded border border-sand-300/40 bg-sand-100/30 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-serif text-sm font-medium text-charcoal leading-relaxed">
                                {item.question}
                              </span>
                              <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${getQuestionStatusBadgeClass(item.status)}`}>
                                {dict.workspace[`status_${item.status}`] || item.status}
                              </span>
                            </div>
                            
                            {(item.decisionArea || (item.answeredInChapters && item.answeredInChapters.length > 0)) && (
                              <div className="pt-2 border-t border-sand-300/25 space-y-2 text-xs font-sans">
                                {item.decisionArea && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider">
                                      {dict.workspace.decision_area}:
                                    </span>
                                    <span className="text-charcoal-muted font-medium text-[11px]">{item.decisionArea}</span>
                                  </div>
                                )}
                                {item.answeredInChapters && item.answeredInChapters.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider block">
                                      {dict.workspace.will_be_answered_in}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                      {item.answeredInChapters.map((ch, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-sand-200/50 text-[10px] text-charcoal-muted border border-sand-300/20">
                                          {ch}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.design_decisions}
                  </h3>
                  <ul className="space-y-2 pl-4 list-disc text-sm text-charcoal-muted">
                    {Array.isArray(draft.design_decisions) &&
                      draft.design_decisions.map((d, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">{d}</li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Future evolution and formal references */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.future_evolution}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    {draft.future_evolution}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.references}
                  </h3>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-charcoal-muted">
                    {Array.isArray(draft.references) &&
                      draft.references.map((ref, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">{ref}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        }

        return (
          <section className="space-y-8">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal pb-2 border-b border-sand-300/20">
              Research Workspace
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notes & Insights */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.notes}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.insights}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.experiments}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
              </div>

              {/* Academic references, Design decisions & Rejected ideas */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.books} &amp; {dict.workspace.academic_papers}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.design_decisions}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-sage-dark">
                    {dict.workspace.rejected_ideas}
                  </h3>
                  <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                    {dict.workspace.no_data}
                  </p>
                </div>
              </div>
            </div>

            {/* Future evolution and formal references */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-sand-300/20 pt-8">
              <div className="space-y-2">
                <h3 className="font-serif text-base font-bold text-sage-dark">
                  {dict.workspace.future_evolution}
                </h3>
                <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                  {dict.workspace.no_data}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-base font-bold text-sage-dark">
                  {dict.workspace.references}
                </h3>
                <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                  {dict.workspace.no_data}
                </p>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Chapter Footer Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-sand-300/40 mt-16 text-sm">
        {prevChapter ? (
          <Link
            href={`/${locale}/chapter/${prevChapter.slug}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal flex flex-col items-start gap-1 cursor-pointer"
          >
            <span className="text-[10px] text-charcoal-muted/40 font-normal uppercase">&larr; {dict.common.prev_chapter}</span>
            <span className="font-serif text-xs font-bold">{prevTitle}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal flex flex-col items-start gap-1 cursor-pointer"
          >
            <span className="text-[10px] text-charcoal-muted/40 font-normal uppercase">&larr; {dict.common.dashboard || 'Dashboard'}</span>
            <span className="font-serif text-xs font-bold">{dict.header.logo}</span>
          </Link>
        )}

        {nextChapter ? (
          <Link
            href={`/${locale}/chapter/${nextChapter.slug}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-sage hover:text-sage-dark flex flex-col items-end gap-1 text-right cursor-pointer"
          >
            <span className="text-[10px] text-sage-light/60 font-normal uppercase">{dict.common.next_chapter} &rarr;</span>
            <span className="font-serif text-xs font-bold">{nextTitle}</span>
          </Link>
        ) : (
          <Link
            href={`/${locale}`}
            className="text-xs font-sans font-bold uppercase tracking-wider text-sage hover:text-sage-dark flex flex-col items-end gap-1 text-right cursor-pointer"
          >
            <span className="text-[10px] text-sage-light/60 font-normal uppercase">{dict.common.dashboard || 'Dashboard'} &rarr;</span>
            <span className="font-serif text-xs font-bold">{dict.header.logo}</span>
          </Link>
        )}
      </div>
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

// Helper to resolve nested object translation keys dynamically (e.g. drafts)
function getTranslationObject(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}
