export type MemorySourceCollection =
  | 'pattern_memory'
  | 'saule_learning_events'
  | 'workspace_past_learnings'
  | 'partner_profile'
  | 'workspace_intelligence'
  | 'unknown';

export interface MemoryCandidate {
  id: string;
  sourceCollection: MemorySourceCollection;
  workspaceId?: string | null;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryFilterContext {
  activeWorkspaceId?: string | null;
  prompt: string;
}

export interface MemoryExclusion {
  id: string;
  sourceCollection: MemorySourceCollection;
  reason: 'workspace_mismatch' | 'missing_workspace_id' | 'low_relevance' | 'global_or_greeting' | 'quarantined';
}

export interface MemoryFilterResult {
  injected: MemoryCandidate[];
  excluded: MemoryExclusion[];
  retrievedMemoryCount: number;
  injectedMemoryCount: number;
  excludedWorkspaceMismatchCount: number;
  excludedLowRelevanceCount: number;
  excludedMissingWorkspaceIdCount: number;
  excludedGlobalPatternCount: number;
  excludedQuarantinedPatternCount: number;
  memorySourceCollections: MemorySourceCollection[];
  topInjectedMemoryIds: string[];
  topExcludedMemoryIds: string[];
  exclusionReasons: Record<string, number>;
  finalPromptMemorySummary: string;
}

const STOPWORDS = new Set([
  'the', 'and', 'or', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'you',
  'bir', 've', 'ile', 'icin', 'için', 'bu', 'şu', 'de', 'da', 'mi', 'mu', 'mı', 'mü',
  'to', 'in', 'on', 'at', 'of', 'is', 'are', 'be', 'as', 'it', 'by', 'an', 'a',
  'kak', 'kakoi', 'kakaya', 'kto', 'dlya', 'v', 'na', 'po', 'i', 'ili', 'eto'
]);

const GENERIC_TOKENS = new Set([
  'market', 'strategy', 'strategic', 'decision', 'customer', 'users', 'business',
  'workspace', 'report', 'analysis', 'growth', 'risk', 'product', 'service', 'company'
]);

const GEO_KEYWORDS = [
  'kazakhstan', 'kazakistan', 'turkey', 'turkiye', 'turkiye', 'istanbul', 'uae', 'dubai',
  'ankara', 'moscow', 'russia', 'europe', 'asia', 'global'
];

const SECTOR_KEYWORDS = [
  'accounting', 'finance', 'outsourcing', 'bookkeeping', 'payroll', 'tax', 'cfo',
  'saas', 'crm', 'coffee', 'subscription', 'dental', 'clinic', 'agency', 'ecommerce',
  'b2b', 'consumer'
];

const DECISION_KEYWORDS = [
  'pricing', 'positioning', 'gtm', 'go', 'launch', 'segment', 'journey', 'message',
  'creative', 'reaction', 'market', 'entry', 'validation', 'compliance'
];

const AUDIENCE_KEYWORDS = [
  'sme', 'smb', 'startup', 'founder', 'sales', 'manager', 'operator', 'consultant',
  'clinic', 'patient', 'urban', 'professional'
];

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function extractKeywordHits(text: string, dictionary: string[]): string[] {
  const norm = normalize(text);
  return dictionary.filter((k) => norm.includes(k));
}

function buildFacetSet(text: string): Set<string> {
  return new Set([
    ...extractKeywordHits(text, GEO_KEYWORDS).map((v) => `geo:${v}`),
    ...extractKeywordHits(text, SECTOR_KEYWORDS).map((v) => `sector:${v}`),
    ...extractKeywordHits(text, DECISION_KEYWORDS).map((v) => `decision:${v}`),
    ...extractKeywordHits(text, AUDIENCE_KEYWORDS).map((v) => `audience:${v}`),
  ]);
}

function buildCandidateText(candidate: MemoryCandidate): string {
  const metaText = candidate.metadata
    ? Object.values(candidate.metadata)
        .flatMap((v) => (Array.isArray(v) ? v.map(String) : [String(v)]))
        .join(' ')
    : '';
  return `${candidate.text || ''} ${metaText}`.trim();
}

function hasRelevantOverlap(prompt: string, candidate: MemoryCandidate): boolean {
  const promptTokens = new Set(tokenize(prompt));
  const candidateTokens = new Set(tokenize(buildCandidateText(candidate)));
  const overlap = Array.from(promptTokens).filter((t) => candidateTokens.has(t));
  const strongOverlap = overlap.filter((t) => !GENERIC_TOKENS.has(t));
  if (strongOverlap.length > 0) return true;

  const promptFacets = buildFacetSet(prompt);
  const candidateFacets = buildFacetSet(buildCandidateText(candidate));
  const facetOverlap = Array.from(promptFacets).filter((f) => candidateFacets.has(f));
  if (facetOverlap.length > 0) return true;

  return overlap.length >= 2;
}

export function filterWorkspaceRelevantMemory(
  candidates: MemoryCandidate[],
  context: MemoryFilterContext
): MemoryFilterResult {
  const activeWorkspaceId = context.activeWorkspaceId || null;
  const injected: MemoryCandidate[] = [];
  const excluded: MemoryExclusion[] = [];

  for (const candidate of candidates) {
    if (candidate.id.startsWith('global:') || candidate.id.startsWith('greeting:')) {
      excluded.push({
        id: candidate.id,
        sourceCollection: candidate.sourceCollection,
        reason: 'global_or_greeting',
      });
      continue;
    }

    if (candidate.metadata?.quarantined === true) {
      excluded.push({
        id: candidate.id,
        sourceCollection: candidate.sourceCollection,
        reason: 'quarantined',
      });
      continue;
    }

    if (!candidate.workspaceId) {
      excluded.push({
        id: candidate.id,
        sourceCollection: candidate.sourceCollection,
        reason: 'missing_workspace_id',
      });
      continue;
    }

    if (activeWorkspaceId && candidate.workspaceId !== activeWorkspaceId) {
      excluded.push({
        id: candidate.id,
        sourceCollection: candidate.sourceCollection,
        reason: 'workspace_mismatch',
      });
      continue;
    }

    if (!hasRelevantOverlap(context.prompt, candidate)) {
      excluded.push({
        id: candidate.id,
        sourceCollection: candidate.sourceCollection,
        reason: 'low_relevance',
      });
      continue;
    }

    injected.push(candidate);
  }

  const exclusionReasons = excluded.reduce<Record<string, number>>((acc, item) => {
    acc[item.reason] = (acc[item.reason] || 0) + 1;
    return acc;
  }, {});

  const sourceCollections = unique(candidates.map((c) => c.sourceCollection));
  const finalPromptMemorySummary =
    injected.length === 0
      ? 'No workspace-scoped relevant memory injected.'
      : `Injected ${injected.length} workspace-scoped relevant memory items from ${unique(injected.map((i) => i.sourceCollection)).join(', ')}.`;

  return {
    injected,
    excluded,
    retrievedMemoryCount: candidates.length,
    injectedMemoryCount: injected.length,
    excludedWorkspaceMismatchCount: exclusionReasons.workspace_mismatch || 0,
    excludedLowRelevanceCount: exclusionReasons.low_relevance || 0,
    excludedMissingWorkspaceIdCount: exclusionReasons.missing_workspace_id || 0,
    excludedGlobalPatternCount: exclusionReasons.global_or_greeting || 0,
    excludedQuarantinedPatternCount: exclusionReasons.quarantined || 0,
    memorySourceCollections: sourceCollections,
    topInjectedMemoryIds: injected.map((i) => i.id).slice(0, 5),
    topExcludedMemoryIds: excluded.map((i) => i.id).slice(0, 5),
    exclusionReasons,
    finalPromptMemorySummary,
  };
}

export function resolveWorkspaceIdFromFingerprint(fingerprint: string): string | null {
  if (!fingerprint) return null;
  const idx = fingerprint.indexOf(':');
  if (idx === -1) return null;
  const workspaceId = fingerprint.slice(0, idx).trim();
  if (!workspaceId || workspaceId === 'global' || workspaceId === 'no_workspace') return null;
  return workspaceId;
}
