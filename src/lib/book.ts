export interface ChapterMetadata {
  slug: string;
  chapterNumber: number;
  volumeId: number;
  status: 'Researching' | 'Drafting' | 'Reviewing' | 'Locked' | 'Deprecated';
  readingTime: string;
  version: string;
  lastUpdated: string;
  purposeKey: string; // Translation dictionary key path (e.g. "chapters.why-we-are-overwhelmed.purpose")
  keyQuestionKey: string; // Translation dictionary key path
  dependencies: string[]; // slugs
  relatedChapters: string[]; // slugs
  researchConfidence: 'High' | 'Medium' | 'Experimental';
}

export interface AppendixMetadata {
  slug: string;
  appendixNumber: number;
  volumeId: number;
  status: 'Researching' | 'Drafting' | 'Reviewing' | 'Locked' | 'Deprecated';
  readingTime: string;
  version: string;
  lastUpdated: string;
  purposeKey: string;
  keyQuestionKey: string;
  dependencies: string[];
  relatedChapters: string[];
  researchConfidence: 'High' | 'Medium' | 'Experimental';
}

export interface Volume {
  id: number;
  romanId: string;
  titleKey: string; // Translation key (e.g. "volumes.v1.title")
  purposeKey: string; // Translation key (e.g. "volumes.v1.purpose")
  chapters: ChapterMetadata[];
  appendices?: AppendixMetadata[];
}

export const volumes: Volume[] = [
  {
    id: 1,
    romanId: 'I',
    titleKey: 'volumes.v1.title',
    purposeKey: 'volumes.v1.purpose',
    chapters: [
      {
        slug: 'foreword',
        chapterNumber: 1,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.foreword.purpose',
        keyQuestionKey: 'chapters.foreword.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'part-1-interlude',
        chapterNumber: 2,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '1 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.part-1-interlude.purpose',
        keyQuestionKey: 'chapters.part-1-interlude.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'living-memory',
        chapterNumber: 3,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.living-memory.purpose',
        keyQuestionKey: 'chapters.living-memory.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'memory-crisis',
        chapterNumber: 4,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.memory-crisis.purpose',
        keyQuestionKey: 'chapters.memory-crisis.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'ai-illusion',
        chapterNumber: 5,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.ai-illusion.purpose',
        keyQuestionKey: 'chapters.ai-illusion.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'intelligence-commodity',
        chapterNumber: 6,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.intelligence-commodity.purpose',
        keyQuestionKey: 'chapters.intelligence-commodity.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'semantic-memory-layer',
        chapterNumber: 7,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.semantic-memory-layer.purpose',
        keyQuestionKey: 'chapters.semantic-memory-layer.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'part-2-interlude',
        chapterNumber: 8,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '1 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.part-2-interlude.purpose',
        keyQuestionKey: 'chapters.part-2-interlude.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'memory-not-storage',
        chapterNumber: 9,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.memory-not-storage.purpose',
        keyQuestionKey: 'chapters.memory-not-storage.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'human-memory-systems',
        chapterNumber: 10,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.human-memory-systems.purpose',
        keyQuestionKey: 'chapters.human-memory-systems.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'identity-narrative',
        chapterNumber: 11,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.identity-narrative.purpose',
        keyQuestionKey: 'chapters.identity-narrative.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'forgetting-regulation',
        chapterNumber: 12,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.forgetting-regulation.purpose',
        keyQuestionKey: 'chapters.forgetting-regulation.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'cognitive-offloading',
        chapterNumber: 13,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.cognitive-offloading.purpose',
        keyQuestionKey: 'chapters.cognitive-offloading.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'collective-memory',
        chapterNumber: 14,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.collective-memory.purpose',
        keyQuestionKey: 'chapters.collective-memory.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'translating-cognition',
        chapterNumber: 15,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.translating-cognition.purpose',
        keyQuestionKey: 'chapters.translating-cognition.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'part-3-interlude',
        chapterNumber: 16,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '1 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.part-3-interlude.purpose',
        keyQuestionKey: 'chapters.part-3-interlude.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'design-principles',
        chapterNumber: 17,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.design-principles.purpose',
        keyQuestionKey: 'chapters.design-principles.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'memory-lifecycle',
        chapterNumber: 18,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.memory-lifecycle.purpose',
        keyQuestionKey: 'chapters.memory-lifecycle.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'memory-representation',
        chapterNumber: 19,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.memory-representation.purpose',
        keyQuestionKey: 'chapters.memory-representation.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'retrieval-composition',
        chapterNumber: 20,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.retrieval-composition.purpose',
        keyQuestionKey: 'chapters.retrieval-composition.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'isolation-privacy',
        chapterNumber: 21,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.isolation-privacy.purpose',
        keyQuestionKey: 'chapters.isolation-privacy.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'model-agnostic',
        chapterNumber: 22,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.model-agnostic.purpose',
        keyQuestionKey: 'chapters.model-agnostic.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'part-4-interlude',
        chapterNumber: 23,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '1 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.part-4-interlude.purpose',
        keyQuestionKey: 'chapters.part-4-interlude.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'open-memory-protocol',
        chapterNumber: 24,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.open-memory-protocol.purpose',
        keyQuestionKey: 'chapters.open-memory-protocol.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'developer-ecosystem',
        chapterNumber: 25,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.developer-ecosystem.purpose',
        keyQuestionKey: 'chapters.developer-ecosystem.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'next-computing-layer',
        chapterNumber: 26,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '4 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'chapters.next-computing-layer.purpose',
        keyQuestionKey: 'chapters.next-computing-layer.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
    ],
    appendices: [
      {
        slug: 'competitor-analysis',
        appendixNumber: 1,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'appendices.competitor-analysis.purpose',
        keyQuestionKey: 'appendices.competitor-analysis.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'roadmap-business',
        appendixNumber: 2,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'appendices.roadmap-business.purpose',
        keyQuestionKey: 'appendices.roadmap-business.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'technical-roadmap',
        appendixNumber: 3,
        volumeId: 1,
        status: 'Drafting',
        readingTime: '5 min',
        version: '1.0',
        lastUpdated: '2026-07-04',
        purposeKey: 'appendices.technical-roadmap.purpose',
        keyQuestionKey: 'appendices.technical-roadmap.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
    ],
  },
];



export function getAllChapters(): ChapterMetadata[] {
  return volumes.flatMap((v) => v.chapters);
}

export function getChapterBySlug(slug: string): ChapterMetadata | undefined {
  return getAllChapters().find((c) => c.slug === slug);
}

export function getVolumeByChapterSlug(slug: string): Volume | undefined {
  return volumes.find((v) => v.chapters.some((c) => c.slug === slug));
}

export function getAllAppendices(): AppendixMetadata[] {
  return volumes.flatMap((v) => v.appendices || []);
}

export function getAppendixBySlug(slug: string): AppendixMetadata | undefined {
  return getAllAppendices().find((a) => a.slug === slug);
}

export function getVolumeByAppendixSlug(slug: string): Volume | undefined {
  return volumes.find((v) => (v.appendices || []).some((a) => a.slug === slug));
}

const allChapters = getAllChapters();

export const bookConfig = {
  version: '1.0',
  currentStatusKey: 'dashboard.status_desc',
  volumeCount: volumes.length,
  chapterCount: allChapters.length,
  writtenChaptersCount: allChapters.filter((chapter) => chapter.status !== 'Researching').length,
  lastUpdated: allChapters.reduce(
    (latest, chapter) => (chapter.lastUpdated > latest ? chapter.lastUpdated : latest),
    '',
  ),
  // These are editorial research totals that are not represented one-to-one in chapter metadata.
  researchSourcesCount: 5,
  designDecisionsCount: 0,
  openQuestionsCount: 0,
};
