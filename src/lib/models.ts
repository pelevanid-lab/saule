export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Memory {
  id: string;
  userId: string;
  workspaceId?: string; // Optional: If it belongs to a specific workspace
  content: string; // The actual memory text
  embedding?: number[]; // Vector embedding of the content for Semantic Search
  source?: string; // Where this memory came from (e.g., 'chat', 'note')
  createdAt: Date;
  metadata?: Record<string, any>; // Flexible metadata
}
