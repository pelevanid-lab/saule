import { DatabaseManager } from '../database.js';
import { CryptoUtils } from '../crypto.js';
import { MemoryNode, SpaceType, UnitCategory } from '../../interface/types.js';

export class NodeRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Encrypts and persists a MemoryNode in Firestore.
   */
  public async save(node: MemoryNode): Promise<void> {
    const db = this.dbManager.getDb();
    const dek = this.dbManager.getDEK();

    const envelope = await CryptoUtils.encrypt(node.content, dek);

    const record = {
      id: node.id,
      category: node.category,
      type: node.type,
      space_type: node.spaceType,
      space_id: node.spaceId,
      content_ciphertext: envelope.ciphertext,
      content_iv: envelope.iv,
      content_tag: envelope.tag,
      content_salt: envelope.salt,
      decay_score: node.decayScore,
      created_at: node.createdAt
    };

    await db.collection('nodes').doc(node.id).set(record);
  }

  /**
   * Retrieves and decrypts a MemoryNode by ID.
   */
  public async getById(id: string): Promise<MemoryNode | null> {
    const db = this.dbManager.getDb();
    const docRef = db.collection('nodes').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return null;
    return await this.mapRowToNode(docSnap.data());
  }

  /**
   * Retrieves and decrypts all MemoryNodes in a specific space.
   */
  public async getBySpace(spaceId: string, spaceType: SpaceType): Promise<MemoryNode[]> {
    const db = this.dbManager.getDb();
    const snapshot = await db.collection('nodes')
      .where('space_id', '==', spaceId)
      .where('space_type', '==', spaceType)
      .get();
    
    const rows = snapshot.docs.map(doc => doc.data());
    return await Promise.all(rows.map(row => this.mapRowToNode(row)));
  }

  /**
   * Retrieves and decrypts all MemoryNodes across all spaces.
   */
  public async getAll(): Promise<MemoryNode[]> {
    const db = this.dbManager.getDb();
    const snapshot = await db.collection('nodes').get();
    const rows = snapshot.docs.map(doc => doc.data());
    return await Promise.all(rows.map(row => this.mapRowToNode(row)));
  }

  /**
   * Updates the decay score of a MemoryNode.
   */
  public async updateDecayScore(id: string, decayScore: number): Promise<void> {
    const db = this.dbManager.getDb();
    await db.collection('nodes').doc(id).update({ decay_score: decayScore });
  }

  /**
   * Deletes a MemoryNode and related sub-collections/documents.
   */
  public async delete(id: string): Promise<void> {
    const db = this.dbManager.getDb();
    
    const batch = db.batch();
    batch.delete(db.collection('nodes').doc(id));
    batch.delete(db.collection('embeddings').doc(id));
    batch.delete(db.collection('provenances').doc(id));
    
    // Note: Edges deletion would require fetching edge IDs. We leave it simple for now.
    await batch.commit();
  }

  /**
   * Maps a database row to a decrypted MemoryNode.
   */
  private async mapRowToNode(row: any): Promise<MemoryNode> {
    const dek = this.dbManager.getDEK();
    const content = await CryptoUtils.decrypt(
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
