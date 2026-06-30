export interface SauleMemoryRecord {
  id?: string;
  sourceType: string;
  sourceId: string;
  visibility: 'private' | 'workspace' | 'org';
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface SaulePatternRecord {
  id?: string;
  patternType: string;
  summary: string;
  evidenceIds: string[];
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

export interface LearningQueueEvent {
  id?: string;
  eventType: string;
  sourceType: string;
  sourceId: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dedupeKey: string;
  createdAt: number;
  processedAt?: number;
}

export function getSauleNamespace(orgId: string): string {
  return `orgs/${orgId}/saule`;
}
