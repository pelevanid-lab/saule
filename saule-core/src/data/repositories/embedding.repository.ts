import { DatabaseManager } from '../database.js';
import { SpaceType } from '../../interface/types.js';

export class EmbeddingRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists a dense vector embedding associated with a node in Firestore.
   */
  public async save(nodeId: string, embedding: number[]): Promise<void> {
    const db = this.dbManager.getDb();
    await db.collection('embeddings').doc(nodeId).set({
      node_id: nodeId,
      embedding_json: JSON.stringify(embedding)
    });
  }

  /**
   * Retrieves the embedding vector for a node.
   */
  public async getByNodeId(nodeId: string): Promise<number[] | null> {
    const db = this.dbManager.getDb();
    const docSnap = await db.collection('embeddings').doc(nodeId).get();
    if (!docSnap.exists) return null;
    return JSON.parse(docSnap.data()!.embedding_json);
  }

  /**
   * Retrieves all node embeddings, optionally filtered by spaceId and spaceType.
   */
  public async getEmbeddingsBySpace(spaceId: string, spaceType: SpaceType): Promise<{ nodeId: string; embedding: number[] }[]> {
    const db = this.dbManager.getDb();
    
    // First get the matching nodes, then fetch their embeddings.
    const nodesSnap = await db.collection('nodes')
      .where('space_id', '==', spaceId)
      .where('space_type', '==', spaceType)
      .get();
      
    const nodeIds = nodesSnap.docs.map(doc => doc.id);

    const embeddings = [];
    // Firestore allows 'in' queries up to 10 items. For large spaces, we might need chunks or batch processing.
    // For simplicity, we fetch them individually or use a direct query.
    for (const id of nodeIds) {
      const docSnap = await db.collection('embeddings').doc(id).get();
      if (docSnap.exists) {
        embeddings.push({
          nodeId: docSnap.data()!.node_id,
          embedding: JSON.parse(docSnap.data()!.embedding_json)
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
    const snapshot = await db.collection('embeddings').get();

    return snapshot.docs.map(doc => ({
      nodeId: doc.data().node_id,
      embedding: JSON.parse(doc.data().embedding_json)
    }));
  }

  /**
   * Deletes the embedding associated with a node.
   */
  public async deleteByNodeId(nodeId: string): Promise<void> {
    const db = this.dbManager.getDb();
    await db.collection('embeddings').doc(nodeId).delete();
  }
}
