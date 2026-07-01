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
        slug: 'summary',
        chapterNumber: 1,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.summary.purpose',
        keyQuestionKey: 'chapters.summary.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'memory-crisis',
        chapterNumber: 2,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.memory-crisis.purpose',
        keyQuestionKey: 'chapters.memory-crisis.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'ai-illusion',
        chapterNumber: 3,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.ai-illusion.purpose',
        keyQuestionKey: 'chapters.ai-illusion.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'intelligence-commodity',
        chapterNumber: 4,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.intelligence-commodity.purpose',
        keyQuestionKey: 'chapters.intelligence-commodity.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'semantic-memory-layer',
        chapterNumber: 5,
        volumeId: 1,
        status: 'Locked',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.semantic-memory-layer.purpose',
        keyQuestionKey: 'chapters.semantic-memory-layer.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'living-memory',
        chapterNumber: 6,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.living-memory.purpose',
        keyQuestionKey: 'chapters.living-memory.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'personal-memory',
        chapterNumber: 7,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.personal-memory.purpose',
        keyQuestionKey: 'chapters.personal-memory.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'collective-memory',
        chapterNumber: 8,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.collective-memory.purpose',
        keyQuestionKey: 'chapters.collective-memory.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'beyond-communication',
        chapterNumber: 9,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.beyond-communication.purpose',
        keyQuestionKey: 'chapters.beyond-communication.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'workspace-model',
        chapterNumber: 10,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.workspace-model.purpose',
        keyQuestionKey: 'chapters.workspace-model.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'ai-as-interface',
        chapterNumber: 11,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.ai-as-interface.purpose',
        keyQuestionKey: 'chapters.ai-as-interface.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'absolute-privacy',
        chapterNumber: 12,
        volumeId: 1,
        status: 'Locked',
        readingTime: '3 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.absolute-privacy.purpose',
        keyQuestionKey: 'chapters.absolute-privacy.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'new-digital-organ',
        chapterNumber: 13,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.new-digital-organ.purpose',
        keyQuestionKey: 'chapters.new-digital-organ.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'vision',
        chapterNumber: 14,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.vision.purpose',
        keyQuestionKey: 'chapters.vision.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
      {
        slug: 'closing-manifesto',
        chapterNumber: 15,
        volumeId: 1,
        status: 'Locked',
        readingTime: '2 min',
        version: '1.0',
        lastUpdated: '2026-07-01',
        purposeKey: 'chapters.closing-manifesto.purpose',
        keyQuestionKey: 'chapters.closing-manifesto.key_question',
        dependencies: [],
        relatedChapters: [],
        researchConfidence: 'High',
      },
    ],
    appendices: [],
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
