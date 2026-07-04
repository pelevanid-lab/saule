import Database from 'better-sqlite3';
import { IMemoryStore, MemoryNode, MemoryEdge, MemoryProvenance } from './IMemoryStore';
import { CryptoUtils, EncryptedEnvelope } from './CryptoUtils';
import { PIIFilter } from './LocalONNXIndex';

export class SQLiteMemoryStore implements IMemoryStore {
  private db: Database.Database;
  private dek: string;
  private ramBuffer: { node: MemoryNode; provenance?: MemoryProvenance }[] = [];
  private isRecording: boolean = false;
  private lastActivityTime: number = Date.now();
  private inactivityLimit = 3 * 60 * 1000; // 3 minutes in milliseconds

  constructor(dbPath: string, decryptedDek: string) {
    this.dek = decryptedDek;
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    // 1. Nodes Table (encrypted content)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        category TEXT,
        type TEXT,
        space_type TEXT,
        space_id TEXT,
        content_ciphertext TEXT,
        content_iv TEXT,
        content_tag TEXT,
        content_salt TEXT,
        decay_score REAL,
        created_at INTEGER
      );
    `);

    // 2. Edges Table (encrypted reason)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS edges (
        source_id TEXT,
        target_id TEXT,
        type TEXT,
        confidence REAL,
        created_by TEXT,
        reason_ciphertext TEXT,
        reason_iv TEXT,
        reason_tag TEXT,
        reason_salt TEXT,
        created_at INTEGER,
        PRIMARY KEY (source_id, target_id, type)
      );
    `);

    // 3. Provenance Table (plaintext metadata)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS provenance (
        node_id TEXT PRIMARY KEY,
        app_name TEXT,
        window_title TEXT,
        url TEXT,
        file_path TEXT,
        device_id TEXT,
        workspace_id TEXT,
        user_action TEXT,
        FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
      );
    `);

    // 4. Tombstones Table (for CRDT delete sync tracking)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tombstones (
        id TEXT PRIMARY KEY,
        entity_type TEXT, -- 'node' | 'edge'
        deleted_at INTEGER
      );
    `);

    // 5. Node Embeddings Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS node_embeddings (
        node_id TEXT PRIMARY KEY,
        embedding_json TEXT,
        FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
      );
    `);
  }

  // --- Manual Session Recording Controls ---

  public startRecording() {
    this.isRecording = true;
    this.ramBuffer = [];
    this.lastActivityTime = Date.now();
  }

  public registerActivity() {
    this.lastActivityTime = Date.now();
  }

  public async stopRecording(): Promise<void> {
    if (!this.isRecording) return;
    this.isRecording = false;

    // Inactivity Triage: If user walked away, trim/retroactively timestamp the session
    const currentTime = Date.now();
    const idleTime = currentTime - this.lastActivityTime;
    
    let targetBuffer = [...this.ramBuffer];
    if (idleTime > this.inactivityLimit && targetBuffer.length > 0) {
      console.log(`[SQLiteMemoryStore]: Idle state detected (${(idleTime / 1000).toFixed(0)}s). Executing retroactive timestamping.`);
      // Set the session end to the timestamp of the last recorded interaction in the buffer
      const lastActivityTimestamp = targetBuffer[targetBuffer.length - 1].node.createdAt;
      // Filter out any nodes that were generated after the user stopped interacting
      targetBuffer = targetBuffer.filter(item => item.node.createdAt <= lastActivityTimestamp);
    }

    // Flush RAM Buffer to SQLite in a single transaction
    if (targetBuffer.length > 0) {
      const insertNode = this.db.prepare(`
        INSERT OR REPLACE INTO nodes (
          id, category, type, space_type, space_id, 
          content_ciphertext, content_iv, content_tag, content_salt, 
          decay_score, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertProvenance = this.db.prepare(`
        INSERT OR REPLACE INTO provenance (
          node_id, app_name, window_title, url, file_path, device_id, workspace_id, user_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = this.db.transaction((items) => {
        for (const item of items) {
          const envelope = CryptoUtils.encrypt(item.node.content, this.dek);
          insertNode.run(
            item.node.id,
            item.node.category,
            item.node.type,
            item.node.spaceType,
            item.node.spaceId,
            envelope.ciphertext,
            envelope.iv,
            envelope.tag,
            envelope.salt,
            item.node.decayScore,
            item.node.createdAt
          );

          if (item.provenance) {
            const p = item.provenance;
            insertProvenance.run(
              item.node.id,
              p.appName,
              p.windowTitle,
              p.url,
              p.filePath,
              p.deviceId,
              p.workspaceId,
              p.userAction
            );
          }
        }
      });

      transaction(targetBuffer);
      console.log(`[SQLiteMemoryStore]: Flushed ${targetBuffer.length} nodes to SQLite.`);
    }

    this.ramBuffer = [];
  }

  // --- IMemoryStore Implementation ---

  public async remember(node: MemoryNode, provenance?: MemoryProvenance): Promise<void> {
    this.registerActivity();

    // Mask sensitive credentials, national IDs, and credit cards before storing
    const sanitizedNode = {
      ...node,
      content: PIIFilter.mask(node.content)
    };

    if (this.isRecording) {
      // Buffer in memory
      this.ramBuffer.push({ node: sanitizedNode, provenance });
      console.log(`[SQLiteMemoryStore]: Buffered node "${node.id}" in RAM Ring Buffer.`);
      return;
    }

    // Direct write if not in recording session
    const envelope = CryptoUtils.encrypt(sanitizedNode.content, this.dek);
    
    const insertNode = this.db.prepare(`
      INSERT OR REPLACE INTO nodes (
        id, category, type, space_type, space_id, 
        content_ciphertext, content_iv, content_tag, content_salt, 
        decay_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    if (provenance) {
      const insertProvenance = this.db.prepare(`
        INSERT OR REPLACE INTO provenance (
          node_id, app_name, window_title, url, file_path, device_id, workspace_id, user_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertProvenance.run(
        node.id,
        provenance.appName,
        provenance.windowTitle,
        provenance.url,
        provenance.filePath,
        provenance.deviceId,
        provenance.workspaceId,
        provenance.userAction
      );
    }
  }

  public async recall(query: string, limit: number): Promise<MemoryNode[]> {
    // Note: SQLiteMemoryStore relies on IVectorIndex for semantic search.
    // This recall method does a simple text-based fallback search (FTS or LIKE) locally.
    const stmt = this.db.prepare(`
      SELECT * FROM nodes 
      WHERE id LIKE ? OR type LIKE ? 
      LIMIT ?
    `);
    
    const rows = stmt.all(`%${query}%`, `%${query}%`, limit);
    return rows.map((r: any) => this.mapRowToNode(r));
  }

  public async connect(edge: MemoryEdge): Promise<void> {
    const envelope = CryptoUtils.encrypt(edge.reason, this.dek);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO edges (
        source_id, target_id, type, confidence, created_by,
        reason_ciphertext, reason_iv, reason_tag, reason_salt, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
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

  public async forget(nodeId: string): Promise<void> {
    // Implement Tombstone delete tracking for CRDT
    const deleteNode = this.db.prepare(`DELETE FROM nodes WHERE id = ?`);
    const insertTombstone = this.db.prepare(`
      INSERT OR REPLACE INTO tombstones (id, entity_type, deleted_at)
      VALUES (?, 'node', ?)
    `);

    const transaction = this.db.transaction(() => {
      deleteNode.run(nodeId);
      insertTombstone.run(nodeId, Date.now());
    });

    transaction();
  }

  public async clear(): Promise<void> {
    this.db.exec(`DELETE FROM nodes`);
    this.db.exec(`DELETE FROM edges`);
    this.db.exec(`DELETE FROM provenance`);
    this.db.exec(`DELETE FROM tombstones`);
  }

  // --- Graph Queries ---

  public async getNode(id: string): Promise<MemoryNode | undefined> {
    const stmt = this.db.prepare(`SELECT * FROM nodes WHERE id = ?`);
    const row = stmt.get(id);
    return row ? this.mapRowToNode(row) : undefined;
  }

  public async getProvenance(nodeId: string): Promise<MemoryProvenance | undefined> {
    const stmt = this.db.prepare(`SELECT * FROM provenance WHERE node_id = ?`);
    const row = stmt.get(nodeId);
    if (!row) return undefined;
    return {
      nodeId: (row as any).node_id,
      appName: (row as any).app_name,
      windowTitle: (row as any).window_title,
      url: (row as any).url,
      filePath: (row as any).file_path,
      deviceId: (row as any).device_id,
      workspaceId: (row as any).workspace_id,
      userAction: (row as any).user_action
    };
  }

  public async getConnectedNodes(nodeId: string): Promise<{ node: MemoryNode; edge: MemoryEdge }[]> {
    const stmt = this.db.prepare(`
      SELECT n.*, e.* 
      FROM edges e
      JOIN nodes n ON (e.target_id = n.id AND e.source_id = ?)
                   OR (e.source_id = n.id AND e.target_id = ?)
    `);

    const rows = stmt.all(nodeId, nodeId);
    return rows.map((r: any) => {
      const node = this.mapRowToNode(r);
      const envelope: EncryptedEnvelope = {
        ciphertext: r.reason_ciphertext,
        iv: r.reason_iv,
        tag: r.reason_tag,
        salt: r.reason_salt
      };
      const reason = CryptoUtils.decrypt(envelope, this.dek);

      const edge: MemoryEdge = {
        sourceId: r.source_id,
        targetId: r.target_id,
        type: r.type,
        confidence: r.confidence,
        createdBy: r.created_by,
        reason,
        createdAt: r.created_at
      };

      return { node, edge };
    });
  }

  public saveEmbedding(nodeId: string, embedding: number[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO node_embeddings (node_id, embedding_json)
      VALUES (?, ?)
    `);
    stmt.run(nodeId, JSON.stringify(embedding));
  }

  public getEmbedding(nodeId: string): number[] | undefined {
    const stmt = this.db.prepare(`SELECT embedding_json FROM node_embeddings WHERE node_id = ?`);
    const row = stmt.get(nodeId);
    if (!row) return undefined;
    return JSON.parse((row as any).embedding_json);
  }

  public getAllNodes(): MemoryNode[] {
    const stmt = this.db.prepare(`SELECT * FROM nodes`);
    const rows = stmt.all();
    return rows.map((r: any) => this.mapRowToNode(r));
  }

  // --- Helper Mapping ---

  private mapRowToNode(row: any): MemoryNode {
    const envelope: EncryptedEnvelope = {
      ciphertext: row.content_ciphertext,
      iv: row.content_iv,
      tag: row.content_tag,
      salt: row.content_salt
    };
    const content = CryptoUtils.decrypt(envelope, this.dek);

    return {
      id: row.id,
      category: row.category,
      type: row.type,
      spaceType: row.space_type,
      spaceId: row.space_id,
      content,
      decayScore: row.decay_score,
      createdAt: row.created_at
    };
  }
}
