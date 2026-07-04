export type MemoryCategory = 'Knowledge' | 'Experience' | 'Action' | 'Relationship' | 'Identity' | 'Resource';

export interface MemoryNode {
  id: string;
  category: MemoryCategory;
  type: string;
  spaceType: 'personal' | 'workspace';
  spaceId: string;
  content: string;
  decayScore: number;
  createdAt: number;
}

export interface MemoryEdge {
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
  createdBy: 'ai' | 'user' | 'system';
  reason: string;
  createdAt: number;
}

export interface MemoryProvenance {
  nodeId: string;
  appName: string;
  windowTitle: string;
  url: string;
  filePath: string;
  deviceId: string;
  workspaceId: string;
  userAction: string;
}

export interface IMemoryStore {
  remember(node: MemoryNode, provenance?: MemoryProvenance): Promise<void>;
  recall(query: string, limit: number): Promise<MemoryNode[]>;
  connect(edge: MemoryEdge): Promise<void>;
  forget(nodeId: string): Promise<void>;
  clear(): Promise<void>;
  
  // Graph queries
  getNode(id: string): Promise<MemoryNode | undefined>;
  getProvenance(nodeId: string): Promise<MemoryProvenance | undefined>;
  getConnectedNodes(nodeId: string): Promise<{ node: MemoryNode; edge: MemoryEdge }[]>;
}
