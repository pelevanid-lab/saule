import { DatabaseManager } from '../database.js';
import { CryptoUtils } from '../crypto.js';
import { MemoryEdge } from '../../interface/types.js';

export class EdgeRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists a graph edge, encrypting its reasoning details, in Firestore.
   */
  public async save(edge: MemoryEdge): Promise<void> {
    const db = this.dbManager.getDb();
    const dek = this.dbManager.getDEK();

    let envelope = null;
    if (edge.reason) {
      envelope = await CryptoUtils.encrypt(edge.reason, dek);
    }

    const record = {
      source_id: edge.sourceId,
      target_id: edge.targetId,
      relation_type: edge.relationType,
      confidence: edge.confidence,
      created_by: edge.createdBy,
      reason_ciphertext: envelope ? envelope.ciphertext : null,
      reason_iv: envelope ? envelope.iv : null,
      reason_tag: envelope ? envelope.tag : null,
      reason_salt: envelope ? envelope.salt : null,
      created_at: edge.createdAt
    };

    const docId = `${edge.sourceId}_${edge.targetId}_${edge.relationType}`;
    await db.collection('edges').doc(docId).set(record);
  }

  /**
   * Retrieves all edges originating from or targeting a specific node.
   */
  public async getConnectedEdges(nodeId: string): Promise<MemoryEdge[]> {
    const db = this.dbManager.getDb();
    
    const [fromSnapshot, toSnapshot] = await Promise.all([
      db.collection('edges').where('source_id', '==', nodeId).get(),
      db.collection('edges').where('target_id', '==', nodeId).get()
    ]);

    const uniqueRowsMap = new Map();
    const docs = [...fromSnapshot.docs, ...toSnapshot.docs];
    
    for (const doc of docs) {
      const row = doc.data();
      const key = `${row.source_id}_${row.target_id}_${row.relation_type}`;
      uniqueRowsMap.set(key, row);
    }

    const uniqueRows = Array.from(uniqueRowsMap.values());
    return await Promise.all(uniqueRows.map(row => this.mapRowToEdge(row)));
  }

  /**
   * Retrieves all edges originating from a specific node.
   */
  public async getEdgesFrom(sourceId: string): Promise<MemoryEdge[]> {
    const db = this.dbManager.getDb();
    const snapshot = await db.collection('edges').where('source_id', '==', sourceId).get();
    const rows = snapshot.docs.map(doc => doc.data());
    return await Promise.all(rows.map(row => this.mapRowToEdge(row)));
  }

  /**
   * Retrieves all edges pointing to a specific node.
   */
  public async getEdgesTo(targetId: string): Promise<MemoryEdge[]> {
    const db = this.dbManager.getDb();
    const snapshot = await db.collection('edges').where('target_id', '==', targetId).get();
    const rows = snapshot.docs.map(doc => doc.data());
    return await Promise.all(rows.map(row => this.mapRowToEdge(row)));
  }

  /**
   * Deletes a specific edge.
   */
  public async delete(sourceId: string, targetId: string, relationType: string): Promise<void> {
    const db = this.dbManager.getDb();
    const docId = `${sourceId}_${targetId}_${relationType}`;
    await db.collection('edges').doc(docId).delete();
  }

  /**
   * Maps an edge row from Firestore.
   */
  private async mapRowToEdge(row: any): Promise<MemoryEdge> {
    const dek = this.dbManager.getDEK();
    let reason = undefined;

    if (row.reason_ciphertext) {
      reason = await CryptoUtils.decrypt(
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
