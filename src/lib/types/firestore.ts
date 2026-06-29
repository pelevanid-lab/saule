export type ProductKey = 'life' | 'business' | 'creative' | 'core';

export interface OrgProductAccess {
  life: boolean;
  business: boolean;
  creative: boolean;
}

export interface MemberProductAccess {
  life: boolean;
  business: boolean;
  creative: boolean;
}

export interface CoreMemoryRecord {
  id?: string;
  product: ProductKey;
  sourceType: string;
  sourceId: string;
  visibility: 'private' | 'workspace' | 'org';
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface CorePatternRecord {
  id?: string;
  product: ProductKey;
  patternType: string;
  summary: string;
  evidenceIds: string[];
  confidence: number; // 0.0 to 1.0
  createdAt: number;
  updatedAt: number;
}

export interface LearningQueueEvent {
  id?: string;
  product: ProductKey;
  eventType: string;
  sourceType: string;
  sourceId: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dedupeKey: string;
  createdAt: number;
  processedAt?: number;
}

// Helper Utilities for Product-Aware Architecture

/**
 * Validates if a given string is a valid ProductKey.
 */
export function validateProductKey(key: string): key is ProductKey {
  return ['life', 'business', 'creative', 'core'].includes(key);
}

/**
 * Checks if a member has access to a specific product within an organization.
 */
export function requireProductAccess(
  product: ProductKey,
  access: MemberProductAccess | OrgProductAccess
): boolean {
  if (product === 'core') return true; // Core is always accessible if they are a member
  return access[product] === true;
}

/**
 * Generates the namespaced path for a product collection within an org.
 */
export function getProductNamespace(orgId: string, product: ProductKey): string {
  return `orgs/${orgId}/${product}`;
}

/**
 * Asserts that a record belongs to the expected product context.
 * Useful for validating query results to prevent data bleeding.
 */
export function assertProductIsolation(recordProduct: ProductKey, expectedProduct: ProductKey): boolean {
  return recordProduct === expectedProduct;
}
