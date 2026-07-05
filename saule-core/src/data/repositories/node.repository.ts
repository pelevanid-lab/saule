import { DatabaseManager } from '../database.js';
import { CryptoUtils } from '../crypto.js';
import { MemoryNode, SpaceType, UnitCategory } from '../../interface/types.js';

export class NodeRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Encrypts and persists a MemoryNode.
   */
  public save(node: MemoryNode): void {
    const db = this.dbManager.getDb();
    const dek = this.dbManager.getDEK();

    const envelope = CryptoUtils.encrypt(node.content, dek);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO nodes (
        id, category, type, space_type, space_id, 
        content_ciphertext, content_iv, content_tag, content_salt, 
        decay_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
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

  /**
   * Retrieves and decrypts a MemoryNode by ID.
   */
  public getById(id: string): MemoryNode | null {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM nodes WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;
    return this.mapRowToNode(row);
  }

  /**
   * Retrieves and decrypts all MemoryNodes in a specific space.
   */
  public getBySpace(spaceId: string, spaceType: SpaceType): MemoryNode[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM nodes WHERE space_id = ? AND space_type = ?');
    const rows = stmt.all(spaceId, spaceType) as any[];

    return rows.map(row => this.mapRowToNode(row));
  }

  /**
   * Retrieves and decrypts all MemoryNodes across all spaces.
   */
  public getAll(): MemoryNode[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM nodes');
    const rows = stmt.all() as any[];

    return rows.map(row => this.mapRowToNode(row));
  }

  /**
   * Updates the decay score of a MemoryNode.
   */
  public updateDecayScore(id: string, decayScore: number): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('UPDATE nodes SET decay_score = ? WHERE id = ?');
    stmt.run(decayScore, id);
  }

  /**
   * Deletes a MemoryNode (cascading deletes for edges/provenance/embeddings).
   */
  public delete(id: string): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('DELETE FROM nodes WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Maps a database row to a decrypted MemoryNode.
   */
  private mapRowToNode(row: any): MemoryNode {
    const dek = this.dbManager.getDEK();
    const content = CryptoUtils.decrypt(
      {
        ciphertext: row.content_ciphertext,
        iv: row.content_iv,
        tag: row.content_tag,
        salt: row.content_salt
      },
      dek
    );

    return {
      id: row.id,
      category: row.category as UnitCategory,
      type: row.type,
      spaceType: row.space_type as SpaceType,
      spaceId: row.space_id,
      content,
      decayScore: row.decay_score,
      createdAt: row.created_at
    };
  }
}
