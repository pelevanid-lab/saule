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
  public async save(nodeId: string, embedding: number[]): Promise<void> {
    const db = this.dbManager.getDb();
    await db.put('embeddings', {
      node_id: nodeId,
      embedding_json: JSON.stringify(embedding)
    });
  }

  /**
   * Retrieves the embedding vector for a node.
   */
  public async getByNodeId(nodeId: string): Promise<number[] | null> {
    const db = this.dbManager.getDb();
    const row = await db.get('embeddings', nodeId);
    if (!row) return null;
    return JSON.parse(row.embedding_json);
  }

  /**
   * Retrieves all node embeddings, optionally filtered by spaceId and spaceType.
   */
  public async getEmbeddingsBySpace(spaceId: string, spaceType: SpaceType): Promise<{ nodeId: string; embedding: number[] }[]> {
    const db = this.dbManager.getDb();
    
    // In IndexedDB, there are no JOINs. We first get the matching nodes, then fetch their embeddings.
    const nodes = await db.getAllFromIndex('nodes', 'space', [spaceId, spaceType]);
    const nodeIds = nodes.map(n => n.id);

    const embeddings = [];
    for (const id of nodeIds) {
      const row = await db.get('embeddings', id);
      if (row) {
        embeddings.push({
          nodeId: row.node_id,
          embedding: JSON.parse(row.embedding_json)
        });
      }
    }

    return embeddings;
  }

  /**
   * Retrieves all embeddings in the entire database.
   */
  public async getAll(): Promise<{ nodeId: string; embedding: number[] }[]> {
    const db = this.dbManager.getDb();
    const rows = await db.getAll('embeddings');

    return rows.map(row => ({
      nodeId: row.node_id,
      embedding: JSON.parse(row.embedding_json)
    }));
  }

  /**
   * Deletes the embedding associated with a node.
   */
  public async deleteByNodeId(nodeId: string): Promise<void> {
    const db = this.dbManager.getDb();
    await db.delete('embeddings', nodeId);
  }
}
