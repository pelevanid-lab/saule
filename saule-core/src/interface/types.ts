export type UnitCategory = 'knowledge' | 'experience' | 'action' | 'relationship' | 'identity' | 'resource';

export type SpaceType = 'personal' | 'workspace' | 'community' | 'organization';

export interface Provenance {
  id?: string;
  nodeId?: string;
  source: string; // E.g., application name, website, system context
  author: string; // E.g., user id, system, ai agent name
  workspaceId?: string; // Optional workspace grouping
  deviceId?: string; // Device metadata
  userAction?: string; // Action context (e.g., 'click', 'search', 'type')
  windowTitle?: string; // Window title at the time of ingestion
  url?: string; // URL if ingested from browser
  filePath?: string; // File path if ingested from local filesystem
  intention?: string; // Intention context
  createdAt: number;
}

export interface MemoryNode {
  id: string;
  category: UnitCategory;
  type: string; // Subtype (e.g., 'thought', 'fact', 'event', 'preference')
  spaceType: SpaceType;
  spaceId: string;
  content: string; // Decrypted content in memory, stored encrypted in DB
  decayScore: number; // Forgetting index (0 to 1)
  createdAt: number;
  provenance?: Provenance;
}

export interface MemoryEdge {
  sourceId: string;
  targetId: string;
  relationType: string; // The nature of the link (e.g., 'references', 'causes', 'contradicts')
  confidence: number; // Relevance score (0 to 1)
  createdBy: 'ai' | 'user' | 'system';
  reason?: string; // Reason description for the connection
  createdAt: number;
}

export interface ContextCompositionResult {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  compositionPayload: string; // Assembled context representation for LLM prompt
}
