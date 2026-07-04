import path from 'path';
import { IMemoryStore, MemoryNode, MemoryEdge, MemoryProvenance } from './IMemoryStore';
import { SQLiteMemoryStore } from './SQLiteMemoryStore';
import { LocalONNXIndex } from './LocalONNXIndex';
import { E2EESyncEngine } from './E2EESyncEngine';
import { FirestoreSyncStore } from './FirestoreSyncStore';

export class SMLMemoryManager implements IMemoryStore {
  private baseDir: string;
  private dek: string;
  
  // Mapping spaceId -> Modern Synced SML Store
  private stores: Map<string, IMemoryStore> = new Map();
  private localStores: Map<string, SQLiteMemoryStore> = new Map();
  private vectorIndices: Map<string, LocalONNXIndex> = new Map();

  constructor(baseDir: string, decryptedDek: string) {
    this.baseDir = baseDir;
    this.dek = decryptedDek;
  }

  /**
   * Dynamically resolves or initializes the partitioned storage engine for the given space.
   */
  private getStoreForSpace(spaceType: 'personal' | 'workspace', spaceId: string): IMemoryStore {
    const key = `${spaceType}:${spaceId}`;
    if (this.stores.has(key)) {
      return this.stores.get(key)!;
    }

    // Dynamic File Partitioning (Apple-style encapsulation)
    // Personal DB is capped at 1GB, workspace DB is capped at 5GB
    const filename = spaceType === 'personal' ? 'personal.db' : `workspace_${spaceId}.db`;
    const dbPath = path.join(this.baseDir, filename);

    const localStore = new SQLiteMemoryStore(dbPath, this.dek);
    this.localStores.set(key, localStore);

    const vectorIndex = new LocalONNXIndex(localStore);
    this.vectorIndices.set(key, vectorIndex);

    // Setup zero-knowledge cloud sync decorator
    const syncEngine = new E2EESyncEngine(localStore, this.dek, spaceId);
    
    // In a real cloud sync scenario, we register Firestore collection push listeners here
    syncEngine.onLocalUpdate(async (payload) => {
      console.log(`[SMLMemoryManager]: Client sync payload generated for space "${key}" (${payload.substring(0, 15)}...)`);
      // Pushes encrypted Yjs binary delta updates to Firestore workspace sync relay
    });

    const syncStore = new FirestoreSyncStore(localStore, syncEngine);
    this.stores.set(key, syncStore);

    return syncStore;
  }

  // --- IMemoryStore Interface Routing ---

  public async remember(node: MemoryNode, provenance?: MemoryProvenance): Promise<void> {
    const store = this.getStoreForSpace(node.spaceType, node.spaceId);
    await store.remember(node, provenance);

    // Asynchronously calculate local ONNX embeddings & index the vector
    const key = `${node.spaceType}:${node.spaceId}`;
    const vectorIndex = this.vectorIndices.get(key);
    const localStore = this.localStores.get(key);
    
    if (vectorIndex && localStore) {
      vectorIndex.getEmbedding(node.content).then(emb => {
        localStore.saveEmbedding(node.id, emb);
      }).catch(err => {
        console.error(`[SMLMemoryManager]: Failed to calculate background ONNX embedding for node "${node.id}":`, err);
      });
    }
  }

  public async recall(query: string, limit: number): Promise<MemoryNode[]> {
    // Falls back to search across personal space
    const store = this.getStoreForSpace('personal', 'default');
    return store.recall(query, limit);
  }

  /**
   * Recall nodes semantically using local ONNX embeddings + Cosine similarity (Stage 2 search).
   */
  public async semanticRecall(
    spaceType: 'personal' | 'workspace', 
    spaceId: string, 
    queryText: string, 
    limit: number
  ): Promise<MemoryNode[]> {
    const key = `${spaceType}:${spaceId}`;
    const store = this.getStoreForSpace(spaceType, spaceId);
    const vectorIndex = this.vectorIndices.get(key);

    if (!vectorIndex) return [];

    // 1. Generate query vector locally
    const queryVector = await vectorIndex.getEmbedding(queryText);
    if (queryVector.length === 0) return [];

    // 2. Query candidates and rank (Stage 1 triage + Stage 2 cosine comparison)
    const matches = await vectorIndex.similaritySearch(queryVector, limit);
    
    // 3. Resolve nodes from store
    const nodes: MemoryNode[] = [];
    for (const match of matches) {
      const node = await store.getNode(match.id);
      if (node) nodes.push(node);
    }

    return nodes;
  }

  public async connect(edge: MemoryEdge): Promise<void> {
    // Resolve workspace context based on edge IDs or defaults
    const store = this.getStoreForSpace('personal', 'default');
    await store.connect(edge);
  }

  public async forget(nodeId: string): Promise<void> {
    const store = this.getStoreForSpace('personal', 'default');
    await store.forget(nodeId);
  }

  public async clear(): Promise<void> {
    for (const store of this.stores.values()) {
      await store.clear();
    }
  }

  public async getNode(id: string): Promise<MemoryNode | undefined> {
    const store = this.getStoreForSpace('personal', 'default');
    return store.getNode(id);
  }

  public async getProvenance(nodeId: string): Promise<MemoryProvenance | undefined> {
    const store = this.getStoreForSpace('personal', 'default');
    return store.getProvenance(nodeId);
  }

  public async getConnectedNodes(nodeId: string): Promise<{ node: MemoryNode; edge: MemoryEdge }[]> {
    const store = this.getStoreForSpace('personal', 'default');
    return store.getConnectedNodes(nodeId);
  }
}
