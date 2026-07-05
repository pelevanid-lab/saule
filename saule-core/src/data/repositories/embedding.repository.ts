import { DatabaseManager } from '../database.js';
import { SpaceType } from '../../interface/types.js';

export class EmbeddingRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists a dense vector embedding associated with a node.
   */
  public save(nodeId: string, embedding: number[]): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO embeddings (node_id, embedding_json)
      VALUES (?, ?)
    `);
    stmt.run(nodeId, JSON.stringify(embedding));
  }

  /**
   * Retrieves the embedding vector for a node.
   */
  public getByNodeId(nodeId: string): number[] | null {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT embedding_json FROM embeddings WHERE node_id = ?');
    const row = stmt.get(nodeId) as any;

    if (!row) return null;
    return JSON.parse(row.embedding_json);
  }

  /**
   * Retrieves all node embeddings, optionally filtered by spaceId and spaceType.
   */
  public getEmbeddingsBySpace(spaceId: string, spaceType: SpaceType): { nodeId: string; embedding: number[] }[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare(`
      SELECT e.node_id, e.embedding_json 
      FROM embeddings e
      JOIN nodes n ON e.node_id = n.id
      WHERE n.space_id = ? AND n.space_type = ?
    `);
    const rows = stmt.all(spaceId, spaceType) as any[];

    return rows.map(row => ({
      nodeId: row.node_id,
      embedding: JSON.parse(row.embedding_json)
    }));
  }

  /**
   * Retrieves all embeddings in the entire database.
   */
  public getAll(): { nodeId: string; embedding: number[] }[] {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT node_id, embedding_json FROM embeddings');
    const rows = db.prepare('SELECT node_id, embedding_json FROM embeddings').all() as any[];

    return rows.map(row => ({
      nodeId: row.node_id,
      embedding: JSON.parse(row.embedding_json)
    }));
  }

  /**
   * Deletes the embedding associated with a node.
   */
  public deleteByNodeId(nodeId: string): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('DELETE FROM embeddings WHERE node_id = ?');
    stmt.run(nodeId);
  }
}
