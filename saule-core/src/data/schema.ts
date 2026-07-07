export const CREATE_NODES_TABLE = `
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    space_type TEXT NOT NULL,
    space_id TEXT NOT NULL,
    content_ciphertext TEXT NOT NULL,
    content_iv TEXT NOT NULL,
    content_tag TEXT NOT NULL,
    content_salt TEXT NOT NULL,
    decay_score REAL NOT NULL,
    created_at INTEGER NOT NULL,
    synced_at INTEGER DEFAULT 0
  );
`;

export const CREATE_EMBEDDINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS embeddings (
    node_id TEXT PRIMARY KEY,
    embedding_json TEXT NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
  );
`;

export const CREATE_EDGES_TABLE = `
  CREATE TABLE IF NOT EXISTS edges (
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    confidence REAL NOT NULL,
    created_by TEXT NOT NULL,
    reason_ciphertext TEXT,
    reason_iv TEXT,
    reason_tag TEXT,
    reason_salt TEXT,
    created_at INTEGER NOT NULL,
    synced_at INTEGER DEFAULT 0,
    PRIMARY KEY (source_id, target_id, relation_type),
    FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE
  );
`;

export const CREATE_PROVENANCE_TABLE = `
  CREATE TABLE IF NOT EXISTS provenance (
    node_id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    author TEXT NOT NULL,
    workspace_id TEXT,
    device_id TEXT,
    user_action TEXT,
    window_title TEXT,
    url TEXT,
    file_path TEXT,
    intention TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_nodes_space ON nodes(space_id, space_type);
  CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON nodes(created_at);
  CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
  CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
`;
