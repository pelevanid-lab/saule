import { FirestorePatternStore } from './FirestorePatternStore';
import { VectorService as MemoryService } from './VectorService';
import {
  filterWorkspaceRelevantMemory,
  resolveWorkspaceIdFromFingerprint,
} from './WorkspaceMemoryGuard';

export type ResponseOutcome =
  | 'saule_direct'      // Gemini judge passed → most valuable signal
  | 'claude_override'   // Gemini failed, Claude was used and passed rule chain
  | 'fallback'          // Both failed → template used
  | 'trusted_bypass';   // Trust threshold reached, no judge needed

export interface ImplicitSignal {
  type: 'engagement' | 'conversion' | 'confusion' | 'dropout' | 'repetition';
  weight: number;
}

const IMPLICIT_WEIGHTS: Record<ImplicitSignal['type'], number> = {
  conversion: 3,   // User reached simulation → strong positive
  engagement: 1,   // User sent next message → mild positive
  confusion: -2,  // User expressed confusion → negative
  dropout: -1,  // User left without responding
  repetition: -2   // User asked same thing again
};

export interface PatternRecord {
  fingerprint: string;         // intent_type:conversation_state:length_bucket
  workspaceId?: string | null;
  saule_direct_count: number;
  claude_override_count: number;
  fallback_count: number;
  implicit_score: number;      // Accumulated from behavioral signals
  total_count: number;
  trust_score: number;         // 0.0 → 1.0
  trusted: boolean;            // True when trust_score >= 0.85 && total >= 5
  last_response?: string;      // Last Saule response for this pattern (for bypass)
  golden_response?: string;    // Successful Claude override to learn from
  last_failure_reasons?: string[]; // Why Saule failed (from Gemini Judge)
  embedding?: number[];        // Vector representation for semantic search
  plan?: any;                  // The strategic plan generated during the turn
  updated_at: string;

  // Dataset Fields
  userMessage?: string;
  trainingConsent?: boolean;
  anonymized?: boolean;
  containsSensitiveBusinessData?: string;
  citations?: any[];
  qualityScore?: {
    overall: string;
    actionability: string;
    sourceRelevance: string;
  };
}

const TRUST_THRESHOLD = 0.85;
const MIN_HITS_FOR_TRUST = 5;

export class PatternMemory {
  // In-memory cache to avoid Firestore hits on every message
  private static cache: Map<string, PatternRecord> = new Map();

  /**
   * Generate a fingerprint from the message context.
   * Uses the actual message content and workspaceId to prevent cross-workspace data leaks.
   */
  public static generateFingerprint(
    conversationState: string,
    messageLengthBucket: 'short' | 'medium' | 'long',
    isGreeting: boolean,
    userMessage: string = '',
    workspaceId: string = 'no_workspace'
  ): string {
    if (isGreeting) return 'greeting:*:short';

    // Create a safe, normalized slug of the message (first 30 chars for uniqueness)
    const slug = userMessage
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30);

    return `${workspaceId || 'no_workspace'}:${conversationState}:${slug}`;
  }

  /**
   * Get length bucket for a message.
   */
  public static getLengthBucket(message: string): 'short' | 'medium' | 'long' {
    const words = message.trim().split(/\s+/).length;
    if (words <= 5) return 'short';
    if (words <= 20) return 'medium';
    return 'long';
  }

  /**
   * Check if a pattern is trusted (judge bypass eligible).
   * Returns the cached response if trusted, null otherwise.
   */
  public static async checkTrust(fingerprint: string): Promise<{
    trusted: boolean;
    cachedResponse?: string;
  }> {
    let record = this.cache.get(fingerprint);

    if (!record) {
      record = await FirestorePatternStore.getRecord(fingerprint) || undefined;
      if (record) this.cache.set(fingerprint, record);
    }

    if (!record) return { trusted: false };

    const recordWorkspaceId = record.workspaceId || resolveWorkspaceIdFromFingerprint(record.fingerprint);
    const expectedWorkspaceId = resolveWorkspaceIdFromFingerprint(fingerprint);
    if (!recordWorkspaceId || (expectedWorkspaceId && recordWorkspaceId !== expectedWorkspaceId)) {
      return { trusted: false };
    }

    if (record.trusted && record.last_response) {
      console.log(`[PATTERN_MEMORY]: Trusted bypass for pattern "${fingerprint}" (trust=${record.trust_score.toFixed(2)})`);
      return { trusted: true, cachedResponse: record.last_response };
    }
    return { trusted: false };
  }

  /**
   * Fetch the "lessons learned" for this pattern, if any exist.
   */
  public static async getLearningContext(fingerprint: string, activeWorkspaceId: string): Promise<{
    goldenResponse?: string;
    failureReasons?: string[];
  }> {
    let record = this.cache.get(fingerprint);
    if (!record) {
      record = await FirestorePatternStore.getRecord(fingerprint) || undefined;
      if (record) this.cache.set(fingerprint, record);
    }
    if (!record) return {};

    if (!record.workspaceId || record.workspaceId !== activeWorkspaceId) {
      console.log(`[PATTERN_MEMORY]: Rejected pattern ${fingerprint} due to missing or mismatched workspaceId (expected: ${activeWorkspaceId}, got: ${record.workspaceId})`);
      return {};
    }

    return {
      goldenResponse: record.golden_response,
      failureReasons: record.last_failure_reasons
    };
  }

  /**
   * Record the outcome of a response pipeline run.
   */
  public static async recordOutcome(
    fingerprint: string,
    outcome: ResponseOutcome,
    response: string,
    failureReasons?: string[],
    plan?: any
  ): Promise<void> {
    if (fingerprint.includes(':greeting:')) {
      console.log(`[PATTERN_MEMORY]: Skipping persistence for greeting fingerprint ${fingerprint}`);
      return;
    }

    const workspaceId = resolveWorkspaceIdFromFingerprint(fingerprint);

    let existing = this.cache.get(fingerprint);
    if (!existing) {
      existing = await FirestorePatternStore.getRecord(fingerprint) || this.createRecord(fingerprint);
    }
    const record = existing as PatternRecord;
    record.workspaceId = workspaceId;

    switch (outcome) {
      case 'saule_direct':
        record.saule_direct_count++;
        record.last_response = response;
        break;
      case 'claude_override':
        record.claude_override_count++;
        record.golden_response = response;
        if (failureReasons && failureReasons.length > 0) {
          record.last_failure_reasons = failureReasons;
        }
        break;
      case 'fallback':
        record.fallback_count++;
        break;
      case 'trusted_bypass':
        // A bypass is a successful Saule outcome — count it as a saule_direct win
        // so trust score does NOT decay on every bypass hit.
        record.saule_direct_count++;
        break;
    }

    record.total_count++;
    if (plan) record.plan = plan;

    // ─── Semantic Indexing ──────────────────────────────────────────────────
    // If it's a golden response or a direct success, update its embedding
    if (outcome === 'saule_direct' || outcome === 'claude_override') {
      const textToEmbed = outcome === 'claude_override' ? record.golden_response : record.last_response;
      if (textToEmbed) {
        record.embedding = await MemoryService.generateEmbedding(textToEmbed);
      }
    }

    // Recompute trust score
    record.trust_score = this.computeTrust(record);
    record.trusted = record.trust_score >= TRUST_THRESHOLD && record.total_count >= MIN_HITS_FOR_TRUST;
    record.updated_at = new Date().toISOString();

    this.cache.set(fingerprint, record);
    await FirestorePatternStore.saveRecord(record);

    console.log(`[PATTERN_MEMORY]: Recorded "${outcome}" for "${fingerprint}" — trust=${record.trust_score.toFixed(2)}, hits=${record.total_count}, semantic=${!!record.embedding}`);
  }

  /**
   * Search for patterns similar to the current user intent.
   * @deprecated Do not use this method in the runtime assistant loop. Use findWorkspaceSemanticMatches instead.
   */
  public static async findSemanticMatches(query: string, limit = 3): Promise<PatternRecord[]> {
    const queryVector = await MemoryService.generateEmbedding(query);
    if (queryVector.length === 0) return [];

    // For now, fetch all records and do a local similarity check (scales fine for < 1000 records)
    const db = await FirestorePatternStore.getAllRecords();

    const matches = db
      .map((record: PatternRecord) => {
        const workspaceId = record.workspaceId || resolveWorkspaceIdFromFingerprint(record.fingerprint);
        return {
          record: { ...record, workspaceId },
          score: record.embedding ? MemoryService.cosineSimilarity(queryVector, record.embedding) : 0
        };
      })
      .filter((m: any) => m.score > 0.75) // Minimum semantic threshold
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)
      .map((m: any) => m.record);

    if (matches.length > 0) {
      console.log(`[PATTERN_MEMORY]: Semantic memory hit! Found ${matches.length} similar patterns.`);
    }

    return matches;
  }

  /**
   * Record an implicit behavioral signal from the user.
   */
  public static async recordImplicitSignal(
    fingerprint: string,
    signalType: ImplicitSignal['type']
  ): Promise<void> {
    let record = this.cache.get(fingerprint);
    if (!record) {
      record = await FirestorePatternStore.getRecord(fingerprint) || undefined;
    }

    if (!record) return;
    const safeRecord = record as PatternRecord;

    const weight = IMPLICIT_WEIGHTS[signalType];
    safeRecord.implicit_score = Math.max(-10, Math.min(10, safeRecord.implicit_score + weight));
    safeRecord.trust_score = this.computeTrust(safeRecord);
    safeRecord.trusted = safeRecord.trust_score >= TRUST_THRESHOLD && safeRecord.total_count >= MIN_HITS_FOR_TRUST;
    safeRecord.updated_at = new Date().toISOString();

    this.cache.set(fingerprint, safeRecord);
    await FirestorePatternStore.saveRecord(safeRecord);

    console.log(`[PATTERN_MEMORY]: Signal "${signalType}" (${weight > 0 ? '+' : ''}${weight}) for "${fingerprint}" — implicit_score=${safeRecord.implicit_score}`);
  }

  /**
   * Returns all pattern records (for debugging / analytics).
   */
  public static async getAllPatterns(): Promise<PatternRecord[]> {
    return await FirestorePatternStore.getAllRecords();
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private static createRecord(fingerprint: string): PatternRecord {
    const workspaceId = resolveWorkspaceIdFromFingerprint(fingerprint);
    return {
      fingerprint,
      workspaceId,
      saule_direct_count: 0,
      claude_override_count: 0,
      fallback_count: 0,
      implicit_score: 0,
      total_count: 0,
      trust_score: 0,
      trusted: false,
      updated_at: new Date().toISOString()
    };
  }

  private static computeTrust(record: PatternRecord): number {
    if (record.total_count === 0) return 0;

    // Base: ratio of saule_direct wins (weighted 3x) vs claude_overrides (1x)
    const baseScore = (record.saule_direct_count * 3 + record.claude_override_count * 1) /
      (record.total_count * 3);

    // Implicit bonus: normalize implicit_score to ±0.15 range
    const implicitBonus = (record.implicit_score / 10) * 0.15;

    return Math.min(1, Math.max(0, baseScore + implicitBonus));
  }

  public static async findWorkspaceSemanticMatches(
    query: string,
    workspaceId: string,
    limit = 3
  ): Promise<PatternRecord[]> {
    if (!workspaceId) return [];
    
    const queryVector = await MemoryService.generateEmbedding(query);
    if (queryVector.length === 0) return [];

    const workspaceRecords = await FirestorePatternStore.getWorkspaceRecords(workspaceId, 50);

    const matches = workspaceRecords
      .map((record: PatternRecord) => {
        const recWorkspaceId = record.workspaceId || resolveWorkspaceIdFromFingerprint(record.fingerprint);
        return {
          record: { ...record, workspaceId: recWorkspaceId },
          score: record.embedding ? MemoryService.cosineSimilarity(queryVector, record.embedding) : 0
        };
      })
      .filter((m: any) => m.score > 0.75) // Minimum semantic threshold
      .sort((a: any, b: any) => b.score - a.score)
      .map((m: any) => m.record);

    const candidates = matches.map((record: PatternRecord) => ({
      id: record.fingerprint,
      sourceCollection: 'pattern_memory' as const,
      workspaceId: record.workspaceId || resolveWorkspaceIdFromFingerprint(record.fingerprint),
      text: `${record.golden_response || ''} ${record.last_response || ''} ${(record.last_failure_reasons || []).join(' ')}`.trim(),
      metadata: {
        fingerprint: record.fingerprint,
      }
    }));

    const filtered = filterWorkspaceRelevantMemory(candidates, {
      activeWorkspaceId: workspaceId,
      prompt: query,
    });

    const allowedIds = new Set(filtered.injected.map((item: any) => item.id));
    const scopedMatches = matches.filter((record: PatternRecord) => allowedIds.has(record.fingerprint)).slice(0, limit);

    if (filtered.excluded.length > 0) {
      console.log('[PATTERN_MEMORY_SCOPE]', JSON.stringify({
        workspaceId,
        retrieved: matches.length,
        injected: scopedMatches.length,
        excludedWorkspaceMismatch: filtered.excludedWorkspaceMismatchCount,
        excludedLowRelevance: filtered.excludedLowRelevanceCount,
        excludedMissingWorkspaceId: filtered.excludedMissingWorkspaceIdCount,
      }));
    }

    return scopedMatches;
  }
}
