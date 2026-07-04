import { FirestorePatternStore } from './FirestorePatternStore';
import { SQLiteMemoryStore } from './SQLiteMemoryStore';
import { MemoryNode } from './IMemoryStore';

export class MigrationService {
  /**
   * Evaluates and runs a one-way migration from legacy Firestore store to encrypted local SQLite database.
   */
  public static async executeMigration(
    store: SQLiteMemoryStore, 
    userId: string, 
    workspaceId: string
  ): Promise<{ success: boolean; migratedCount: number }> {
    try {
      console.log(`[MigrationService]: Checking legacy Firestore documents for workspace "${workspaceId}"...`);
      
      // Pull all legacy Firestore memory patterns
      const legacyRecords = await FirestorePatternStore.getWorkspaceRecords(workspaceId, 500);
      if (legacyRecords.length === 0) {
        console.log(`[MigrationService]: No legacy records found to migrate.`);
        return { success: true, migratedCount: 0 };
      }

      console.log(`[MigrationService]: Found ${legacyRecords.length} legacy records. Beginning migration...`);
      let migratedCount = 0;

      for (const record of legacyRecords) {
        // Map legacy Firestore PatternRecord to modern SML MemoryNode format
        const node: MemoryNode = {
          id: `legacy_${record.fingerprint.replace(/[^a-z0-9_-]/gi, '_')}`,
          category: 'Knowledge',
          type: 'legacy_pattern',
          spaceType: 'workspace',
          spaceId: workspaceId,
          content: record.golden_response || record.last_response || `Legacy Fingerprint: ${record.fingerprint}`,
          decayScore: record.trust_score || 1.0,
          createdAt: Date.now()
        };

        // Write directly to SQLite store
        await store.remember(node);
        migratedCount++;

        // Soft-Delete Triage: Instead of hard purging Firestore, we flag it as migrated
        // with a 30-day grace period for recovery, avoiding data loss if the client sync fails.
        const db = require('@/lib/firebase-admin').adminDb;
        if (db) {
          await db.collection('pattern_memory').doc(record.fingerprint).update({
            migrated: true,
            migratedAt: new Date().toISOString(),
            gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          });
        }
      }

      console.log(`[MigrationService]: Successfully migrated ${migratedCount} nodes to encrypted local SML.`);
      return { success: true, migratedCount };
    } catch (e: any) {
      console.error("[MigrationService] Migration failed:", e.message || e.toString());
      return { success: false, migratedCount: 0 };
    }
  }

  /**
   * Permanently locks the local core flag in configuration.
   */
  public static lockLocalCoreConfig() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saule_local_core_enabled', 'true');
      localStorage.setItem('saule_local_core_locked', 'true');
      console.log(`[MigrationService]: local core flag permanently locked to TRUE.`);
    }
  }
}
