import { DatabaseManager } from '../database.js';
import { Provenance } from '../../interface/types.js';

export class ProvenanceRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Persists the provenance details of a memory node.
   */
  public save(provenance: Provenance): void {
    if (!provenance.nodeId) {
      throw new Error("Cannot save provenance without an associated nodeId.");
    }
    const db = this.dbManager.getDb();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO provenance (
        node_id, source, author, workspace_id, device_id, 
        user_action, window_title, url, file_path, intention, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      provenance.nodeId,
      provenance.source,
      provenance.author,
      provenance.workspaceId || null,
      provenance.deviceId || null,
      provenance.userAction || null,
      provenance.windowTitle || null,
      provenance.url || null,
      provenance.filePath || null,
      provenance.intention || null,
      provenance.createdAt
    );
  }

  /**
   * Retrieves the provenance details of a memory node.
   */
  public getByNodeId(nodeId: string): Provenance | null {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM provenance WHERE node_id = ?');
    const row = stmt.get(nodeId) as any;

    if (!row) return null;

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
  public deleteByNodeId(nodeId: string): void {
    const db = this.dbManager.getDb();
    const stmt = db.prepare('DELETE FROM provenance WHERE node_id = ?');
    stmt.run(nodeId);
  }
}
