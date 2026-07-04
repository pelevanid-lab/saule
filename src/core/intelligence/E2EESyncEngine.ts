import * as Y from 'yjs';
import { CryptoUtils, EncryptedEnvelope } from './CryptoUtils';
import { MemoryNode, MemoryEdge } from './IMemoryStore';
import { SQLiteMemoryStore } from './SQLiteMemoryStore';

export class E2EESyncEngine {
  private ydoc: Y.Doc;
  private nodesMap: Y.Map<any>;
  private edgesMap: Y.Map<any>;
  private store: SQLiteMemoryStore;
  private dek: string;
  private workspaceId: string;
  private onUpdateCallback?: (updateHex: string) => Promise<void>;

  constructor(store: SQLiteMemoryStore, dek: string, workspaceId: string) {
    this.store = store;
    this.dek = dek;
    this.workspaceId = workspaceId;
    this.ydoc = new Y.Doc();
    this.nodesMap = this.ydoc.getMap('nodes');
    this.edgesMap = this.ydoc.getMap('edges');

    // Load current SQLite state into Yjs maps initially
    this.initializeYjsFromLocalDB();
  }

  /**
   * Initializes Yjs maps from the local SQLite database.
   */
  private initializeYjsFromLocalDB() {
    const nodes = this.store.getAllNodes();
    for (const node of nodes) {
      this.nodesMap.set(node.id, JSON.stringify(node));
    }

    // Connect to SQLite to read edges
    const db = (this.store as any).db;
    const edges = db.prepare("SELECT * FROM edges").all();
    for (const r of edges) {
      const envelope: EncryptedEnvelope = {
        ciphertext: r.reason_ciphertext,
        iv: r.reason_iv,
        tag: r.reason_tag,
        salt: r.reason_salt
      };
      const reason = CryptoUtils.decrypt(envelope, this.dek);
      const edgeKey = `${r.source_id}:${r.target_id}:${r.type}`;
      this.edgesMap.set(edgeKey, JSON.stringify({
        sourceId: r.source_id,
        targetId: r.target_id,
        type: r.type,
        confidence: r.confidence,
        createdBy: r.created_by,
        reason,
        createdAt: r.created_at
      }));
    }
  }

  /**
   * Register a callback to push local updates to the cloud relay.
   */
  public onLocalUpdate(callback: (updateHex: string) => Promise<void>) {
    this.onUpdateCallback = callback;
    
    // Bind Yjs document update event
    this.ydoc.on('update', async (update: Uint8Array) => {
      if (!this.onUpdateCallback) return;
      
      const updateStr = Buffer.from(update).toString('hex');
      const envelope = CryptoUtils.encrypt(updateStr, this.dek);
      const payload = JSON.stringify(envelope);
      
      await this.onUpdateCallback(payload);
    });
  }

  /**
   * Process a binary state update received from a remote client.
   * Decrypts, applies to Y.Doc, and reconciles changes back to SQLite.
   */
  public async receiveRemoteUpdate(encryptedPayload: string): Promise<void> {
    try {
      const envelope: EncryptedEnvelope = JSON.parse(encryptedPayload);
      const updateStr = CryptoUtils.decrypt(envelope, this.dek);
      const update = Buffer.from(updateStr, 'hex');

      // Apply the update to the local Yjs document (Yjs handles conflict resolution natively)
      Y.applyUpdate(this.ydoc, update);

      // Reconcile Yjs maps state back to SQLite
      await this.reconcileStateToSQLite();
    } catch (e: any) {
      console.error("[E2EESyncEngine] Failed to apply remote sync update:", e.message || e.toString());
    }
  }

  /**
   * Pushes a local node remember transaction to the local Yjs maps.
   */
  public syncNode(node: MemoryNode) {
    this.nodesMap.set(node.id, JSON.stringify(node));
  }

  /**
   * Pushes a local edge connection to the local Yjs maps.
   */
  public syncEdge(edge: MemoryEdge) {
    const edgeKey = `${edge.sourceId}:${edge.targetId}:${edge.type}`;
    this.edgesMap.set(edgeKey, JSON.stringify(edge));
  }

  /**
   * Pushes a local deletion Tombstone to the local Yjs maps (Delete-Wins).
   */
  public syncDelete(nodeId: string) {
    this.nodesMap.set(nodeId, JSON.stringify({
      deleted: true,
      deletedAt: Date.now()
    }));
  }

  /**
   * Reconciles the Yjs state maps back into SQLite, parsing Tombstones to enforce deletion.
   */
  private async reconcileStateToSQLite(): Promise<void> {
    const db = (this.store as any).db;
    
    const insertNode = db.prepare(`
      INSERT OR REPLACE INTO nodes (
        id, category, type, space_type, space_id, 
        content_ciphertext, content_iv, content_tag, content_salt, 
        decay_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEdge = db.prepare(`
      INSERT OR REPLACE INTO edges (
        source_id, target_id, type, confidence, created_by,
        reason_ciphertext, reason_iv, reason_tag, reason_salt, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const deleteNode = db.prepare(`DELETE FROM nodes WHERE id = ?`);
    const insertTombstone = db.prepare(`
      INSERT OR REPLACE INTO tombstones (id, entity_type, deleted_at)
      VALUES (?, 'node', ?)
    `);

    const transaction = db.transaction(() => {
      // 1. Reconcile Nodes Map
      for (const [id, valueStr] of this.nodesMap.entries()) {
        const data = JSON.parse(valueStr);
        if (data.deleted) {
          // Enforcement of Tombstone (Delete-Wins)
          deleteNode.run(id);
          insertTombstone.run(id, data.deletedAt);
        } else {
          const node: MemoryNode = data;
          const envelope = CryptoUtils.encrypt(node.content, this.dek);
          insertNode.run(
            node.id,
            node.category,
            node.type,
            node.spaceType,
            node.spaceId,
            envelope.ciphertext,
            envelope.iv,
            envelope.tag,
            envelope.salt,
            node.decayScore,
            node.createdAt
          );
        }
      }

      // 2. Reconcile Edges Map
      for (const [key, valueStr] of this.edgesMap.entries()) {
        const edge: MemoryEdge = JSON.parse(valueStr);
        const envelope = CryptoUtils.encrypt(edge.reason, this.dek);
        insertEdge.run(
          edge.sourceId,
          edge.targetId,
          edge.type,
          edge.confidence,
          edge.createdBy,
          envelope.ciphertext,
          envelope.iv,
          envelope.tag,
          envelope.salt,
          edge.createdAt
        );
      }
    });

    transaction();
  }
}
