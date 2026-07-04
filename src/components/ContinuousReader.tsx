'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslationMember, getTranslationObject, getTranslationValue } from '@/lib/translation';
import type { Volume, ChapterMetadata, AppendixMetadata } from '@/lib/book';

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

interface DraftContent {
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  open_questions: (string | OpenQuestion)[];
  design_decisions: string[];
  future_evolution: string;
  references: string[];
}

interface ReadingItem {
  type: 'chapter' | 'appendix' | 'volume';
  slug: string;
  metadata: ChapterMetadata | AppendixMetadata | Volume;
  startPage: number;
  endPage: number;
}

interface ContinuousReaderProps {
  locale: string;
  initialSlug: string;
  initialType: 'chapter' | 'appendix' | 'volume';
  dictionary: any;
  volumes: Volume[];
}

const getBookmarkTranslations = (locale: string) => {
  switch (locale) {
    case 'tr':
      return { add: 'Yer İmi Ekle', saved: 'Kaydedildi', page: 's.', jump: 'Yer İmine Git', top: 'Yukarı' };
    case 'es':
      return { add: 'Marcador', saved: 'Guardado', page: 'pág.', jump: 'Ir al Marcador', top: 'Subir' };
    case 'ru':
      return { add: 'Закладка', saved: 'Сохранено', page: 'стр.', jump: 'К Закладке', top: 'Вверх' };
    case 'zh-CN':
      return { add: '添加书签', saved: '已添加书签', page: '页', jump: '前往书签', top: '顶部' };
    case 'ja':
      return { add: 'しおり', saved: '保存済み', page: '頁', jump: 'しおりへ', top: '上へ' };
    case 'ko':
      return { add: '책갈피', saved: '저장됨', page: '쪽', jump: '책갈피로', top: '맨 위' };
    case 'en':
    default:
      return { add: 'Bookmark', saved: 'Bookmarked', page: 'p.', jump: 'Go to Bookmark', top: 'Top' };
  }
};

const getDynamicAppendixTitles = (locale: string): Record<string, string> => {
  switch (locale) {
    case 'tr':
      return {
        'open-questions': 'Açık Sorular',
        'design-decisions': 'Tasarım Kararları',
        'references': 'Kaynaklar',
      };
    case 'es':
      return {
        'open-questions': 'Preguntas Abiertas',
        'design-decisions': 'Decisiones de Diseño',
        'references': 'Referencias',
      };
    case 'ru':
      return {
        'open-questions': 'Открытые вопросы',
        'design-decisions': 'Дизайнерские решения',
        'references': 'Источники',
      };
    case 'zh-CN':
      return { 'open-questions': '开放问题', 'design-decisions': '设计决策', 'references': '参考文献' };
    case 'ja':
      return { 'open-questions': '未解決の問い', 'design-decisions': '設計上の判断', 'references': '参考文献' };
    case 'ko':
      return { 'open-questions': '열린 질문', 'design-decisions': '설계 결정', 'references': '참고문헌' };
    case 'en':
    default:
      return {
        'open-questions': 'Open Questions',
        'design-decisions': 'Design Decisions',
        'references': 'References',
      };
  }
};


const getDynamicAppendixContent = (
  volumeId: number,
  slug: string,
  volumes: Volume[],
  dictionary: any
) => {
  const volume = volumes.find((v) => v.id === volumeId);
  if (!volume) return null;

  const sections: { heading: string; items?: any[] }[] = [];
  const type = slug.endsWith('-open-questions')
    ? 'open-questions'
    : slug.endsWith('-design-decisions')
    ? 'design-decisions'
    : 'references';

  const processDraft = (headerText: string, draft: any) => {
    if (!draft) return;

    if (type === 'open-questions' && draft.open_questions && draft.open_questions.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.open_questions,
      });
    } else if (type === 'design-decisions' && draft.design_decisions && draft.design_decisions.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.design_decisions,
      });
    } else if (type === 'references' && draft.references && draft.references.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.references,
      });
    }
  };

  // 1. Chapters
  for (const ch of volume.chapters) {
    const chTitle = getTranslationValue(dictionary, ch.purposeKey.replace('.purpose', '.title')) || ch.slug;
    const numStr = ch.chapterNumber.toString().padStart(2, '0');
    const chHeader = `${dictionary.common.chapter || 'Bölüm'} ${numStr}: ${chTitle}`;
    const draft = getTranslationObject(dictionary, `chapters.${ch.slug}.draft`);
    processDraft(chHeader, draft);
  }

  // 2. Static Appendices
  const staticAppendices = (volume.appendices || []).filter(
    (ap) =>
      !ap.slug.endsWith('-open-questions') &&
      !ap.slug.endsWith('-design-decisions') &&
      !ap.slug.endsWith('-references')
  );

  for (const ap of staticAppendices) {
    const apTitle = getTranslationValue(dictionary, `appendices.${ap.slug}.title`) || ap.slug;
    const apHeader = `${dictionary.common.appendix || 'Ek'} ${ap.appendixNumber}: ${apTitle}`;
    const draft = getTranslationObject(dictionary, `appendices.${ap.slug}.draft`);
    processDraft(apHeader, draft);
  }

  return sections;
};

export default function ContinuousReader({
  locale,
  initialSlug,
  initialType,
  dictionary,
  volumes,
}: ContinuousReaderProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [pageNumber, setPageNumber] = useState(1);
  const [bookmark, setBookmark] = useState<{ slug: string; type: 'chapter' | 'appendix' | 'volume' } | null>(null);

  const currentUrlSlugRef = useRef(initialSlug);
  const isInitialScrollDone = useRef(false);
  const t = getBookmarkTranslations(locale);

  // Precompute list of reading items and page boundaries
  const readingItems: ReadingItem[] = [];
  let currentPage = 1;

  // 1. Volumes loop
  for (const vol of volumes) {
    // Volume Cover Item
    readingItems.push({
      type: 'volume',
      slug: `volume-${vol.id}`,
      metadata: vol,
      startPage: currentPage,
      endPage: currentPage + 1, // 2 pages for volume cover
    });
    currentPage += 2;

    // Chapters
    for (const ch of vol.chapters) {
      const mins = parseInt(ch.readingTime, 10) || 8;
      const pageCount = ch.status === 'Researching' ? 4 : Math.max(4, mins * 2);
      readingItems.push({
        type: 'chapter',
        slug: ch.slug,
        metadata: ch,
        startPage: currentPage,
        endPage: currentPage + pageCount - 1,
      });
      currentPage += pageCount;
    }

    // Appendices
    if (vol.appendices) {
      for (const ap of vol.appendices) {
        const mins = parseInt(ap.readingTime, 10) || 10;
        const pageCount = ap.status === 'Researching' ? 4 : Math.max(4, mins * 2);
        readingItems.push({
          type: 'appendix',
          slug: ap.slug,
          metadata: ap,
          startPage: currentPage,
          endPage: currentPage + pageCount - 1,
        });
        currentPage += pageCount;
      }
    }
  }
  const totalPages = currentPage - 1;

  // Retrieve bookmark from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saule-bookmark');
      if (saved) {
        setBookmark(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Perform initial scroll to active element
  useEffect(() => {
    if (!isInitialScrollDone.current) {
      const element = document.getElementById(initialSlug);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
          isInitialScrollDone.current = true;
        }, 100);
      }
    }
  }, [initialSlug]);

  // Handle local scroll requests from sidebar quick clicks
  useEffect(() => {
    const handleLocalScrollRequest = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const element = document.getElementById(customEvent.detail.slug);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('saule-scroll-to-section', handleLocalScrollRequest);
    return () => window.removeEventListener('saule-scroll-to-section', handleLocalScrollRequest);
  }, []);

  // Monitor scroll behavior to detect active item and page number
  useEffect(() => {
    const handleScroll = () => {
      let activeItem = readingItems[0];

      for (const item of readingItems) {
        const el = document.getElementById(item.slug);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.35) {
            activeItem = item;
          }
        }
      }

      if (activeItem) {
        setActiveSlug(activeItem.slug);

        const activeEl = document.getElementById(activeItem.slug);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          const height = activeEl.offsetHeight;
          const scrolled = Math.max(0, -rect.top);
          const progress = height > 0 ? scrolled / height : 0;
          const pagesInItem = activeItem.endPage - activeItem.startPage;
          const computedPage = Math.min(
            activeItem.endPage,
            Math.max(activeItem.startPage, Math.round(activeItem.startPage + progress * pagesInItem))
          );
          setPageNumber(computedPage);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [readingItems]);

  // Sync state to URL, page title, and sidebar
  useEffect(() => {
    const activeItem = readingItems.find((item) => item.slug === activeSlug);
    if (activeItem && activeSlug !== currentUrlSlugRef.current) {
      currentUrlSlugRef.current = activeSlug;
      
      const newPath = activeItem.type === 'volume'
        ? `/${locale}/volume/${(activeItem.metadata as Volume).id}`
        : (activeSlug === 'summary')
        ? `/${locale}/book`
        : `/${locale}/${activeItem.type}/${activeSlug}`;
      
      window.history.replaceState(null, '', newPath);

      // Update page title
      let itemTitle = '';
      if (activeItem.type === 'volume') {
        const vol = activeItem.metadata as Volume;
        itemTitle = getTranslationValue(dictionary, vol.titleKey) || '';
      } else {
        const isDynamic = activeSlug.endsWith('-open-questions') ||
                          activeSlug.endsWith('-design-decisions') ||
                          activeSlug.endsWith('-references');
        
        if (isDynamic) {
          const type = activeSlug.endsWith('-open-questions')
            ? 'open-questions'
            : activeSlug.endsWith('-design-decisions')
            ? 'design-decisions'
            : 'references';
          const titles = getDynamicAppendixTitles(locale);
          itemTitle = `${dictionary.common.appendix || 'Ek'} ${(activeItem.metadata as AppendixMetadata).appendixNumber}: ${titles[type]}`;
        } else {
          itemTitle = getTranslationValue(
            dictionary,
            activeItem.type === 'chapter'
              ? (activeItem.metadata as ChapterMetadata).purposeKey.replace('.purpose', '.title')
              : `appendices.${activeSlug}.title`
          ) || '';
        }
      }

      document.title = `${itemTitle} — ${dictionary.header.logo}`;
      window.dispatchEvent(new CustomEvent('saule-active-section', { detail: activeSlug }));
    }
  }, [activeSlug, locale, dictionary, readingItems]);

  const toggleBookmark = () => {
    const activeItem = readingItems.find((item) => item.slug === activeSlug);
    if (!activeItem) return;

    if (bookmark?.slug === activeSlug) {
      localStorage.removeItem('saule-bookmark');
      setBookmark(null);
    } else {
      const value = { slug: activeSlug, type: activeItem.type };
      localStorage.setItem('saule-bookmark', JSON.stringify(value));
      setBookmark(value);
    }
    window.dispatchEvent(new CustomEvent('saule-bookmark-updated'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Locked':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'Reviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Drafting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Deprecated':
        return 'bg-red-50 text-red-800 border-red-200';
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

  const getQuestionStatusBadgeClass = (status: string) => {
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
  };

  return (
    <div className="relative pb-24 space-y-24 sm:space-y-32">
      {readingItems.map((item, idx) => {
        const isVolume = item.type === 'volume';
        const isChapter = item.type === 'chapter';
        const isAppendix = item.type === 'appendix';
        const ch = (isChapter ) ? (item.metadata as ChapterMetadata) : null;
        const ap = isAppendix ? (item.metadata as AppendixMetadata) : null;
        const vol = isVolume
          ? (item.metadata as Volume)
          : volumes.find((v) => v.id === (item.metadata as ChapterMetadata | AppendixMetadata).volumeId);

        const volTitle = vol ? getTranslationValue(dictionary, vol.titleKey) : '';
        const isDynamicAppendix = isAppendix && (
          item.slug.endsWith('-open-questions') ||
          item.slug.endsWith('-design-decisions') ||
          item.slug.endsWith('-references')
        );

        let itemTitle = '';
        if (isVolume) {
          itemTitle = volTitle || '';
        } else if (isDynamicAppendix) {
          const type = item.slug.endsWith('-open-questions')
            ? 'open-questions'
            : item.slug.endsWith('-design-decisions')
            ? 'design-decisions'
            : 'references';
          const titles = getDynamicAppendixTitles(locale);
          itemTitle = titles[type];
        } else {
          itemTitle = getTranslationValue(
            dictionary,
            isChapter ? ch!.purposeKey.replace('.purpose', '.title') : `appendices.${item.slug}.title`
          ) || '';
        }

        const itemPurpose = !isVolume && !isDynamicAppendix 
          ? getTranslationValue(dictionary, isChapter ? ch!.purposeKey : `appendices.${item.slug}.purpose`) || ''
          : '';
        const itemKeyQuestion = !isVolume && !isDynamicAppendix 
          ? getTranslationValue(dictionary, isChapter ? ch!.keyQuestionKey : `appendices.${item.slug}.key_question`) || ''
          : '';

        const resolvedDependencies = (isChapter && !isDynamicAppendix )
          ? ch!.dependencies.map((depSlug) => {
              const depCh = readingItems.find((c) => c.slug === depSlug)?.metadata;
              const title = depCh ? getTranslationValue(dictionary, (depCh as ChapterMetadata).purposeKey.replace('.purpose', '.title')) : depSlug;
              return { slug: depSlug, title: title || depSlug };
            })
          : [];

        const resolvedRelated = (isChapter && !isDynamicAppendix )
          ? ch!.relatedChapters.map((relSlug) => {
              const relCh = readingItems.find((c) => c.slug === relSlug)?.metadata;
              const title = relCh ? getTranslationValue(dictionary, (relCh as ChapterMetadata).purposeKey.replace('.purpose', '.title')) : relSlug;
              return { slug: relSlug, title: title || relSlug };
            })
          : [];

        const draftData = (!isVolume && !isDynamicAppendix )
          ? getTranslationObject(dictionary, isChapter ? `chapters.${item.slug}.draft` : `appendices.${item.slug}.draft`) as DraftContent
          : null;

        const meta = (!isVolume ) ? (item.metadata as ChapterMetadata | AppendixMetadata) : null;

        return (
          <article
            key={item.slug}
            id={item.slug}
            data-reading-section
            className={`border-t border-sand-300/20 first:border-t-0 first:pt-0 relative space-y-12 sm:space-y-16 scroll-mt-20 ${
              item.slug === 'how-to-read'
                ? 'pt-0 !mt-0 sm:!mt-0'
                : 'pt-16'
            }`}
          >
            {bookmark?.slug === item.slug && (
              <div className="absolute top-0 right-0 w-8 h-12 bg-clay text-sand-100 flex items-center justify-center shadow-md rounded-b animate-fade-in" title={t.saved}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
            )}

            {isVolume ? (
              /* VOLUME COVER VIEW */
              <div className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-8 py-12">
                <div className="space-y-4 max-w-2xl">
                  <span className="text-base sm:text-lg font-sans font-bold tracking-[0.25em] text-clay uppercase">
                    {volumes.length > 1 ? `${dictionary.common.volume || 'Volume'} ${vol!.romanId}` : (dictionary.header.nav_book || 'White Paper')}
                  </span>
                  <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-charcoal leading-tight">
                    {itemTitle.replace(/^[^:]+:\s*/, '')}
                  </h1>
                  <p className="font-serif text-lg sm:text-xl italic text-sage-dark font-medium leading-relaxed">
                    {getTranslationValue(dictionary, vol!.purposeKey)}
                  </p>
                </div>

                {/* Introduction Paragraphs */}
                {(() => {
                  const introParams = getTranslationObject(dictionary, `volumes.v${vol!.id}.intro_paragraphs`) as string[];
                  if (!Array.isArray(introParams) || introParams.length === 0) {
                    const introP1 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p1`) || '';
                    const introP2 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p2`) || '';
                    const introP3 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p3`) || '';
                    if (!introP1) return null;
                    return (
                      <div className="space-y-6 font-serif text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl mx-auto border-l-2 border-sage/40 pl-6 py-1 italic text-left mt-8">
                        <p>{introP1}</p>
                        {introP2 && <p>{introP2}</p>}
                        {introP3 && <p className="font-sans text-xs sm:text-sm text-charcoal-muted/70 not-italic pt-4">{introP3}</p>}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 text-left max-w-2xl mx-auto mt-8 font-sans">
                      {introParams.map((p, pIdx) => {
                        if (p.startsWith('###')) {
                          return (
                            <h3 key={pIdx} className="font-serif text-lg sm:text-xl font-bold text-charcoal pt-6 border-b border-sand-300/30 pb-2">
                              {p.replace('###', '').trim()}
                            </h3>
                          );
                        }
                        if (p.startsWith('•') || p.startsWith('*')) {
                          return (
                            <div key={pIdx} className="pl-4 py-1 text-sm sm:text-base text-charcoal-muted leading-relaxed flex items-start space-x-2">
                              <span className="text-clay select-none">•</span>
                              <span>{p.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        if (p.startsWith('>')) {
                          return (
                            <blockquote key={pIdx} className="border-l-4 border-clay pl-4 py-2 italic my-4 text-sage-dark bg-clay/5 rounded-r">
                              {p.substring(1).trim()}
                            </blockquote>
                          );
                        }
                        return (
                          <p key={pIdx} className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
                            {p}
                          </p>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* STANDARD READING VIEW (Chapters, Appendices) */
              <>
                <header className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    {volTitle && (
                      <span className="text-xs sm:text-sm font-sans font-bold tracking-widest text-clay uppercase">
                        {volTitle}
                      </span>
                    )}
                    {!isChapter && (
                      <span className="text-xs font-sans font-bold tracking-wider text-charcoal-muted/60 uppercase">
                        {`${dictionary.common.appendix || 'Appendix'} ${ap!.appendixNumber.toString()}`}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal leading-tight">
                    {itemTitle}
                  </h2>
                </header>

                {!isDynamicAppendix && (
                  <div className="space-y-4 my-8 pb-8 border-b border-sand-300/30">
                    {itemKeyQuestion && (
                      <p className="font-serif text-lg sm:text-xl italic font-bold text-sage-dark leading-relaxed">
                        “{itemKeyQuestion}”
                      </p>
                    )}
                    {itemPurpose && (
                      <p className="font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
                        {itemPurpose}
                      </p>
                    )}
                  </div>
                )}

                {isDynamicAppendix ? (
                  <div className="space-y-12 sm:space-y-16">
                    {(() => {
                      const dynamicSections = getDynamicAppendixContent((item.metadata as AppendixMetadata).volumeId, item.slug, volumes, dictionary);
                      if (!dynamicSections || dynamicSections.length === 0) {
                        return (
                          <p className="text-sm font-sans text-charcoal-muted/50 italic">
                            {dictionary.workspace.no_data || 'No entries available.'}
                          </p>
                        );
                      }

                      const isQuestions = item.slug.endsWith('-open-questions');
                      const isDecisions = item.slug.endsWith('-design-decisions');
                      const isRefs = item.slug.endsWith('-references');

                      return dynamicSections.map((sec, sIdx) => (
                        <section key={sIdx} className="space-y-4">
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal pb-1 border-b border-sand-300/20">
                            {sec.heading}
                          </h3>

                          {isQuestions && sec.items && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {sec.items.map((q, qIdx) => {
                                if (typeof q === 'string') {
                                  return (
                                    <div key={qIdx} className="p-4 rounded border border-sand-300/30 bg-sand-100/20 font-serif text-sm leading-relaxed text-charcoal-muted">
                                      {q}
                                    </div>
                                  );
                                }
                                const qItem = q as OpenQuestion;
                                return (
                                  <div key={qItem.id || qIdx} className="p-4 rounded border border-sand-300/40 bg-sand-100/30 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="font-serif text-sm font-medium text-charcoal leading-relaxed">
                                        {qItem.question}
                                      </span>
                                      <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${getQuestionStatusBadgeClass(qItem.status)}`}>
                                        {getTranslationMember(dictionary.workspace, `status_${qItem.status}`, qItem.status)}
                                      </span>
                                    </div>
                                    {(qItem.decisionArea || (!['zh-CN', 'ja', 'ko'].includes(locale) && qItem.answeredInChapters && qItem.answeredInChapters.length > 0)) && (
                                      <div className="pt-2 border-t border-sand-300/25 space-y-2 text-xs font-sans">
                                        {qItem.decisionArea && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider">
                                              {dictionary.workspace.decision_area}:
                                            </span>
                                            <span className="text-charcoal-muted font-medium text-[11px]">{qItem.decisionArea}</span>
                                          </div>
                                        )}
                                        {!['zh-CN', 'ja', 'ko'].includes(locale) && qItem.answeredInChapters && qItem.answeredInChapters.length > 0 && (
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider block">
                                              {dictionary.workspace.will_be_answered_in}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                                              {qItem.answeredInChapters.map((answeredCh, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 rounded bg-sand-200/50 text-[10px] text-charcoal-muted border border-sand-300/20">
                                                  {answeredCh}
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
                          )}

                          {(isDecisions || isRefs) && sec.items && (
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-charcoal-muted">
                              {sec.items.map((d: string, dIdx: number) => (
                                <li key={dIdx} className="leading-relaxed">
                                  {d}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      ));
                    })()}
                  </div>
                ) : (
                  draftData && typeof draftData === 'object' ? (
                    <div className="space-y-12 sm:space-y-16">
                      {Array.isArray(draftData.sections) &&
                        draftData.sections.map((sec, sIdx) => (
                          <section key={sIdx} className="space-y-4">
                            {sec.heading && (
                              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal">
                                {sec.heading}
                              </h3>
                            )}
                            <div className="space-y-4 font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
                              {Array.isArray(sec.paragraphs) &&
                                sec.paragraphs.map((p, pIdx) => {
                                  if (p.startsWith('```')) {
                                    const cleanText = p.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/```\s*$/, '');
                                    return (
                                      <pre key={pIdx} className="font-mono text-xs bg-sand-100/60 border border-sand-300/40 p-4 rounded-lg overflow-x-auto whitespace-pre my-4 text-charcoal-muted shadow-sm">
                                        {cleanText}
                                      </pre>
                                    );
                                  }
                                  if (p.startsWith('>')) {
                                    const cleanText = p.replace(/^>\s*/, '');
                                    return (
                                      <blockquote key={pIdx} className="border-l-4 border-clay/60 pl-4 py-1.5 my-6 italic text-charcoal/90 font-serif text-lg sm:text-xl leading-relaxed bg-sand-100/30 rounded-r-md">
                                        {cleanText}
                                      </blockquote>
                                    );
                                  }
                                  return <p key={pIdx}>{p}</p>;
                                })}
                            </div>
                          </section>
                        ))}


                    </div>
                  ) : (
                    <section className="space-y-8">
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal pb-2 border-b border-sand-300/20">
                        {dictionary.common.research_workspace}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="font-serif text-base font-bold text-sage-dark">
                              {dictionary.workspace.notes}
                            </h4>
                            <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                              {dictionary.workspace.no_data}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                )}
              </>
            )}
          </article>
        );
      })}

      {/* Floating Premium Book Controls Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full px-4 sm:px-0">
        <div className="bg-sand-100/80 border border-sand-300/40 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center justify-between text-xs sm:text-sm font-sans font-semibold text-charcoal-muted">
          <button
            onClick={toggleBookmark}
            className="flex items-center space-x-1.5 hover:text-clay transition-colors cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${bookmark?.slug === activeSlug ? 'text-clay' : 'text-charcoal-muted/65'}`}
              fill={bookmark?.slug === activeSlug ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className={bookmark?.slug === activeSlug ? 'text-clay font-bold' : ''}>
              {bookmark?.slug === activeSlug ? t.saved : t.add}
            </span>
          </button>
          <span className="h-4 w-px bg-sand-300/60" />
          <span className="font-serif italic text-charcoal">
            {t.page} {pageNumber} / {totalPages}
          </span>
          <span className="h-4 w-px bg-sand-300/60" />
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 hover:text-sage-dark transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{t.top}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
