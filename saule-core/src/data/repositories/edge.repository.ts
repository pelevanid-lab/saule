import { DatabaseManager } from '../database.js';
import { CryptoUtils } from '../crypto.js';
import { MemoryEdge } from '../../interface/types.js';

export class EdgeRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists a graph edge, encrypting its reasoning details.
   */
  public save(edge: MemoryEdge): void {
    const db = this.dbManager.getDb();
    const dek = this.dbManager.getDEK();

    let envelope = null;
    if (edge.reason) {
      envelope = CryptoUtils.encrypt(edge.reason, dek);
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO edges (
        source_id, target_id, relation_type, confidence, created_by,
        reason_ciphertext, reason_iv, reason_tag, reason_salt, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      edge.sourceId,
      edge.targetId,
      edge.relationType,
      edge.confidence,
      edge.createdBy,
      envelope ? envelope.ciphertext : null,
      envelope ? envelope.iv : null,
      envelope ? envelope.tag : null,
      envelope ? envelope.salt : null,
      edge.createdAt
    );
  }

  /**
   * Retrieves all edges originating from or targeting a specific node.
   */
  public getConnectedEdges(nodeId: string): MemoryEdge[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare(`
      SELECT * FROM edges 
      WHERE source_id = ? OR target_id = ?
    `);
    const rows = stmt.all(nodeId, nodeId) as any[];

    return rows.map(row => this.mapRowToEdge(row));
  }

  /**
   * Retrieves all edges originating from a specific node.
   */
  public getEdgesFrom(sourceId: string): MemoryEdge[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM edges WHERE source_id = ?');
    const rows = stmt.all(sourceId) as any[];

    return rows.map(row => this.mapRowToEdge(row));
  }

  /**
   * Retrieves all edges pointing to a specific node.
   */
  public getEdgesTo(targetId: string): MemoryEdge[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM edges WHERE target_id = ?');
    const rows = stmt.all(targetId) as any[];

    return rows.map(row => this.mapRowToEdge(row));
  }

  /**
   * Deletes a specific edge.
   */
  public delete(sourceId: string, targetId: string, relationType: string): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('DELETE FROM edges WHERE source_id = ? AND target_id = ? AND relation_type = ?');
    stmt.run(sourceId, targetId, relationType);
  }

  /**
   * Maps an edge row from SQLite database.
   */
  private mapRowToEdge(row: any): MemoryEdge {
    const dek = this.dbManager.getDEK();
    let reason = undefined;

    if (row.reason_ciphertext) {
      reason = CryptoUtils.decrypt(
        {
          ciphertext: row.reason_ciphertext,
          iv: row.reason_iv,
          tag: row.reason_tag,
          salt: row.reason_salt
        },
        dek
      );
    }

    return {
      sourceId: row.source_id,
      targetId: row.target_id,
      relationType: row.relation_type,
      confidence: row.confidence,
      createdBy: row.created_by as 'ai' | 'user' | 'system',
      reason,
      createdAt: row.created_at
    };
  }
}
