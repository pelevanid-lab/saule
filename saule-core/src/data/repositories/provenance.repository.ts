import { DatabaseManager } from '../database.js';
import { Provenance } from '../../interface/types.js';

export class ProvenanceRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists the provenance details of a memory node in Firestore.
   */
  public async save(provenance: Provenance): Promise<void> {
    if (!provenance.nodeId) {
      throw new Error("Cannot save provenance without an associated nodeId.");
    }
    const db = this.dbManager.getDb();

    await db.collection('provenances').doc(provenance.nodeId).set({
      node_id: provenance.nodeId,
      source: provenance.source,
      author: provenance.author,
      workspace_id: provenance.workspaceId || null,
      device_id: provenance.deviceId || null,
      user_action: provenance.userAction || null,
      window_title: provenance.windowTitle || null,
      url: provenance.url || null,
      file_path: provenance.filePath || null,
      intention: provenance.intention || null,
      created_at: provenance.createdAt
    });
  }

  /**
   * Retrieves the provenance details of a memory node.
   */
  public async getByNodeId(nodeId: string): Promise<Provenance | null> {
    const db = this.dbManager.getDb();
    const docSnap = await db.collection('provenances').doc(nodeId).get();

    if (!docSnap.exists) return null;
    const row = docSnap.data()!;

    return {
      nodeId: row.node_id,
      source: row.source,
      author: row.author,
      workspaceId: row.workspace_id || undefined,
      deviceId: row.device_id || undefined,
      userAction: row.user_action || undefined,
      windowTitle: row.window_title || undefined,
      url: row.url || undefined,
      filePath: row.file_path || undefined,
      intention: row.intention || undefined,
      createdAt: row.created_at
    };
  }

  /**
   * Deletes the provenance details of a memory node.
   */
  public async deleteByNodeId(nodeId: string): Promise<void> {
    const db = this.dbManager.getDb();
    await db.collection('provenances').doc(nodeId).delete();
  }
}
