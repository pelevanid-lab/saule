'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTranslationValue } from '@/lib/translation';
import type { Volume } from '@/lib/book';

interface TOCSidebarClientProps {
  volumes: Volume[];
  dict: any;
  locale: string;
}

export default function TOCSidebarClient({ volumes, dict, locale }: TOCSidebarClientProps) {
  const pathname = usePathname();
  const [activeSlug, setActiveSlug] = useState('');
  const [bookmark, setBookmark] = useState<{ slug: string; type: 'chapter' | 'appendix' } | null>(null);

  // Read initial active slug from pathname segment on load
  useEffect(() => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && lastSegment !== locale) {
      if (pathname.includes('/volume/')) {
        setActiveSlug(`volume-${lastSegment}`);
      } else {
        setActiveSlug(lastSegment);
      }
    }
  }, [pathname, locale]);

  // Listen to active section changed event from continuous reader scrollspy
  useEffect(() => {
    const handleActiveSection = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setActiveSlug(customEvent.detail);
    };

    window.addEventListener('saule-active-section', handleActiveSection);
    return () => window.removeEventListener('saule-active-section', handleActiveSection);
  }, []);

  // Sync bookmark from localStorage on mount and update
  const syncBookmark = () => {
    try {
      const saved = localStorage.getItem('saule-bookmark');
      if (saved) {
        setBookmark(JSON.parse(saved));
      } else {
        setBookmark(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    syncBookmark();
    window.addEventListener('saule-bookmark-updated', syncBookmark);
    return () => window.removeEventListener('saule-bookmark-updated', syncBookmark);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string, href: string) => {
    // Intercept click if we are already in reading mode (chapter, appendix, or volume path)
    const isReadingPage = pathname.includes('/chapter/') || pathname.includes('/appendix/') || pathname.includes('/volume/');
    if (isReadingPage) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('saule-scroll-to-section', { detail: { slug } }));
    }
  };

  const jumpToBookmark = () => {
    if (!bookmark) return;
    
    const isReadingPage = pathname.includes('/chapter/') || pathname.includes('/appendix/') || pathname.includes('/volume/');
    if (isReadingPage) {
      window.dispatchEvent(new CustomEvent('saule-scroll-to-section', { detail: { slug: bookmark.slug } }));
    } else {
      // Navigate using browser location
      window.location.href = `/${locale}/${bookmark.type}/${bookmark.slug}`;
    }
  };

  const getTranslations = (loc: string) => {
    switch (loc) {
      case 'tr':
        return { toc: 'İçindekiler', jumpBookmark: 'Yer İmine Git' };
      case 'es':
        return { toc: 'Índice', jumpBookmark: 'Ir al Marcador' };
      case 'ru':
        return { toc: 'Содержание', jumpBookmark: 'К Закладке' };
      case 'zh-CN':
        return { toc: '目录', jumpBookmark: '前往书签' };
      case 'ja':
        return { toc: '目次', jumpBookmark: 'しおりへ' };
      case 'ko':
        return { toc: '목차', jumpBookmark: '책갈피로' };
      case 'en':
      default:
        return { toc: 'Table of Contents', jumpBookmark: 'Go to Bookmark' };
    }
  };

  const getDynamicAppendixTitles = (loc: string): Record<string, string> => {
    switch (loc) {
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

  const labels = getTranslations(locale);

  return (
    <aside className="hidden lg:block w-80 pr-8 py-12 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-sand-300/30">
      <nav className="space-y-8 pr-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold tracking-widest text-charcoal-muted/50 uppercase">
            {labels.toc}
          </span>
          
          {/* Quick Bookmark Jump Ribbon */}
          {bookmark && (
            <button
              onClick={jumpToBookmark}
              className="flex items-center space-x-1 text-[10px] font-sans font-bold uppercase tracking-wider text-clay hover:text-clay/80 transition-colors cursor-pointer"
              title={labels.jumpBookmark}
            >
              <svg className="w-3.5 h-3.5 fill-currentColor text-clay" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span>{labels.jumpBookmark}</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Book Beginning Sections */}
          <div className="space-y-2">
            <span className="font-serif text-[11px] font-bold text-clay uppercase tracking-wider border-b border-sand-300/20 pb-1 block">
              {dict.common.book_start || 'Book Start'}
            </span>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/${locale}/book#preface`}
                  onClick={(e) => handleLinkClick(e, 'preface', `/${locale}/book#preface`)}
                  className={`block font-serif text-[15px] py-1.5 border-l-2 pl-3 transition-all duration-200 cursor-pointer ${
                    activeSlug === 'preface'
                      ? 'border-sage text-sage-dark font-bold bg-sand-200/40 rounded-r'
                      : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
                  }`}
                >
                  {dict.common.preface || 'Preface'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/book#how-to-read`}
                  onClick={(e) => handleLinkClick(e, 'how-to-read', `/${locale}/book#how-to-read`)}
                  className={`block font-serif text-[15px] py-1.5 border-l-2 pl-3 transition-all duration-200 cursor-pointer ${
                    activeSlug === 'how-to-read'
                      ? 'border-sage text-sage-dark font-bold bg-sand-200/40 rounded-r'
                      : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
                  }`}
                >
                  {dict.common.how_to_read || 'How should it be Read?'}
                </Link>
              </li>
            </ul>
          </div>

          {volumes.map((vol) => {
            const volTitle = getTranslationValue(dict, vol.titleKey) || '';
            return (
              <div key={vol.id} className="space-y-2">
                <Link
                  href={`/${locale}/volume/${vol.id}`}
                  onClick={(e) => handleLinkClick(e, `volume-${vol.id}`, `/${locale}/volume/${vol.id}`)}
                  className={`font-serif text-xs font-bold tracking-wide uppercase border-b pb-1 transition-colors block ${
                    activeSlug === `volume-${vol.id}`
                      ? 'border-sage text-sage-dark font-black'
                      : 'border-sand-300/20 text-sage-dark hover:text-sage'
                  }`}
                >
                  {volTitle}
                </Link>
                
                <ul className="space-y-1">
                  {vol.chapters.map((ch) => {
                    const chTitle = getTranslationValue(dict, ch.purposeKey.replace('.purpose', '.title')) || '';
                    const numStr = ch.chapterNumber.toString().padStart(2, '0');
                    const href = `/${locale}/chapter/${ch.slug}`;
                    const isActive = activeSlug === ch.slug;
                    
                    return (
                      <li key={ch.slug}>
                        <Link
                          href={href}
                          onClick={(e) => handleLinkClick(e, ch.slug, href)}
                          className={`block font-serif text-[15px] py-1.5 border-l-2 pl-3 transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'border-sage text-sage-dark font-bold bg-sand-200/40 rounded-r'
                              : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
                          }`}
                        >
                          {`${numStr} ${chTitle}`}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                
                {vol.appendices && vol.appendices.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <span className="text-[9px] font-sans font-bold tracking-wider text-clay uppercase block">
                      {dict.common.appendices || 'Appendices'}
                    </span>
                    <ul className="space-y-1">
                       {vol.appendices.map((ap) => {
                        const isDynamic = ap.slug.endsWith('-open-questions') ||
                                          ap.slug.endsWith('-design-decisions') ||
                                          ap.slug.endsWith('-references');
                        let apTitle = '';
                        if (isDynamic) {
                          const type = ap.slug.endsWith('-open-questions')
                            ? 'open-questions'
                            : ap.slug.endsWith('-design-decisions')
                            ? 'design-decisions'
                            : 'references';
                          const titles = getDynamicAppendixTitles(locale);
                          apTitle = titles[type];
                        } else {
                          apTitle = getTranslationValue(dict, `appendices.${ap.slug}.title`) || '';
                        }
                        const numStr = ap.appendixNumber.toString();
                        const href = `/${locale}/appendix/${ap.slug}`;
                        const isActive = activeSlug === ap.slug;
                        
                        return (
                          <li key={ap.slug}>
                            <Link
                              href={href}
                              onClick={(e) => handleLinkClick(e, ap.slug, href)}
                              className={`block font-serif text-[15px] py-1.5 border-l-2 pl-3 transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'border-sage text-sage-dark font-bold bg-sand-200/40 rounded-r'
                                  : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
                              }`}
                            >
                              {`${dict.common.appendix || 'Ek'} ${numStr}: ${apTitle}`}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
