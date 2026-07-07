import { openDB, IDBPDatabase } from 'idb';

export class DatabaseManager {
  private dbName: string;
  private dek: string;
  private db: IDBPDatabase | null = null;

  constructor(dbName: string, dek: string) {
    this.dbName = dbName;
    this.dek = dek;
  }

  public async initialize(): Promise<void> {
    if (this.db) return; // Already initialized

    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        // Nodes table
        if (!db.objectStoreNames.contains('nodes')) {
          const nodeStore = db.createObjectStore('nodes', { keyPath: 'id' });
          nodeStore.createIndex('space', ['space_id', 'space_type']);
          nodeStore.createIndex('created_at', 'created_at');
          nodeStore.createIndex('synced_at', 'synced_at');
        }

        // Embeddings table
        if (!db.objectStoreNames.contains('embeddings')) {
          db.createObjectStore('embeddings', { keyPath: 'node_id' });
        }

        // Edges table (Using a composite key as an array is supported in IndexedDB)
        if (!db.objectStoreNames.contains('edges')) {
          const edgeStore = db.createObjectStore('edges', { keyPath: ['source_id', 'target_id', 'relation_type'] });
          edgeStore.createIndex('source_id', 'source_id');
          edgeStore.createIndex('target_id', 'target_id');
          edgeStore.createIndex('synced_at', 'synced_at');
        }

        // Provenance table
        if (!db.objectStoreNames.contains('provenance')) {
          db.createObjectStore('provenance', { keyPath: 'node_id' });
        }
      },
    });
  }

  public getDb(): IDBPDatabase {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  public getDEK(): string {
    return this.dek;
  }

  public close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
