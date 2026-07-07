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
      created_at: node.createdAt,
      synced_at: 0
    };

    await db.put('nodes', record);
  }

  /**
   * Retrieves and decrypts a MemoryNode by ID.
   */
  public async getById(id: string): Promise<MemoryNode | null> {
    const db = this.dbManager.getDb();
    const row = await db.get('nodes', id);

    if (!row) return null;
    return await this.mapRowToNode(row);
  }

  /**
   * Retrieves and decrypts all MemoryNodes in a specific space.
   */
  public async getBySpace(spaceId: string, spaceType: SpaceType): Promise<MemoryNode[]> {
    const db = this.dbManager.getDb();
    // Using index for space
    const rows = await db.getAllFromIndex('nodes', 'space', [spaceId, spaceType]);
    
    return await Promise.all(rows.map(row => this.mapRowToNode(row)));
  }

  /**
   * Retrieves and decrypts all MemoryNodes across all spaces.
   */
  public async getAll(): Promise<MemoryNode[]> {
    const db = this.dbManager.getDb();
    const rows = await db.getAll('nodes');

    return await Promise.all(rows.map(row => this.mapRowToNode(row)));
  }

  /**
   * Updates the decay score of a MemoryNode.
   */
  public async updateDecayScore(id: string, decayScore: number): Promise<void> {
    const db = this.dbManager.getDb();
    const tx = db.transaction('nodes', 'readwrite');
    const store = tx.objectStore('nodes');
    const row = await store.get(id);
    if (row) {
      row.decay_score = decayScore;
      await store.put(row);
    }
    await tx.done;
  }

  /**
   * Deletes a MemoryNode (cascading deletes must be handled manually or via a service layer in IndexedDB).
   */
  public async delete(id: string): Promise<void> {
    const db = this.dbManager.getDb();
    
    // In IndexedDB we don't have FOREIGN KEY CASCADE. 
    // We should ideally delete related edges/embeddings here or in SauleCore.
    // For now we just delete the node.
    const tx = db.transaction(['nodes', 'embeddings', 'provenance', 'edges'], 'readwrite');
    await tx.objectStore('nodes').delete(id);
    await tx.objectStore('embeddings').delete(id);
    await tx.objectStore('provenance').delete(id);
    
    // Edges deletion would require iterating over edges where source_id = id or target_id = id
    // That can be added later or handled in the service.
    
    await tx.done;
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
