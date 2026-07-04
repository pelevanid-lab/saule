import { IMemoryStore, MemoryNode, MemoryEdge, MemoryProvenance } from './IMemoryStore';
import { SQLiteMemoryStore } from './SQLiteMemoryStore';
import { E2EESyncEngine } from './E2EESyncEngine';

export class FirestoreSyncStore implements IMemoryStore {
  private localStore: SQLiteMemoryStore;
  private syncEngine: E2EESyncEngine;

  constructor(localStore: SQLiteMemoryStore, syncEngine: E2EESyncEngine) {
    this.localStore = localStore;
    this.syncEngine = syncEngine;
  }

  public async remember(node: MemoryNode, provenance?: MemoryProvenance): Promise<void> {
    // Write locally to SQLite first
    await this.localStore.remember(node, provenance);
    
    // Sync node to Yjs CRDT map
    this.syncEngine.syncNode(node);
  }

  public async recall(query: string, limit: number): Promise<MemoryNode[]> {
    return this.localStore.recall(query, limit);
  }

  public async connect(edge: MemoryEdge): Promise<void> {
    // Write locally to SQLite first
    await this.localStore.connect(edge);
    
    // Sync edge to Yjs CRDT map
    this.syncEngine.syncEdge(edge);
  }

  public async forget(nodeId: string): Promise<void> {
    // Write local delete tombstone first
    await this.localStore.forget(nodeId);
    
    // Sync deletion tombstone to Yjs CRDT map
    this.syncEngine.syncDelete(nodeId);
  }

  public async clear(): Promise<void> {
    await this.localStore.clear();
  }

  public async getNode(id: string): Promise<MemoryNode | undefined> {
    return this.localStore.getNode(id);
  }

  public async getProvenance(nodeId: string): Promise<MemoryProvenance | undefined> {
    return this.localStore.getProvenance(nodeId);
  }

  public async getConnectedNodes(nodeId: string): Promise<{ node: MemoryNode; edge: MemoryEdge }[]> {
    return this.localStore.getConnectedNodes(nodeId);
  }
}
