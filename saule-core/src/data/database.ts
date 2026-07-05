import Database from 'better-sqlite3';
import { 
  CREATE_NODES_TABLE, 
  CREATE_EMBEDDINGS_TABLE, 
  CREATE_EDGES_TABLE, 
  CREATE_PROVENANCE_TABLE, 
  CREATE_INDEXES 
} from './schema.js';

export class DatabaseManager {
  private db: Database.Database;
  private dek: string;

  constructor(dbPath: string, dek: string) {
    this.dek = dek;
    this.db = new Database(dbPath);
    this.enableForeignKeys();
    this.initializeSchema();
  }

  private enableForeignKeys() {
    this.db.pragma('foreign_keys = ON');
  }

  private initializeSchema() {
    // Execute initialization scripts sequentially in a transaction
    const initialize = this.db.transaction(() => {
      this.db.exec(CREATE_NODES_TABLE);
      this.db.exec(CREATE_EMBEDDINGS_TABLE);
      this.db.exec(CREATE_EDGES_TABLE);
      this.db.exec(CREATE_PROVENANCE_TABLE);
      this.db.exec(CREATE_INDEXES);
    });
    initialize();
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public getDEK(): string {
    return this.dek;
  }

  public close() {
    this.db.close();
  }
}
