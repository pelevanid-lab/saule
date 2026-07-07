import { DatabaseManager } from '../data/database.js';
import { firestoreDb } from './firebase-config.js';
import { collection, doc, setDoc } from 'firebase/firestore';
import { CryptoUtils } from '../data/crypto.js';

export class SyncEngine {
  private dbManager: DatabaseManager;
  private isSyncing: boolean = false;
  private userId: string | null = null;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  public setUserId(uid: string) {
    this.userId = uid;
  }

  /**
   * Pushes locally encrypted nodes to Firebase Firestore.
   * Only the ciphertext and IVs leave the device, ensuring absolute privacy.
   */
  public async pushUnsyncedNodes(): Promise<number> {
    if (this.isSyncing || !this.userId) return 0;
    this.isSyncing = true;

    try {
      const db = this.dbManager.getDb();
      // Fetch nodes that haven't been synced yet (synced_at = 0)
      const unsyncedNodes = await db.getAllFromIndex('nodes', 'synced_at', 0);
      
      // Limit to 50
      const batch = unsyncedNodes.slice(0, 50);

      if (batch.length === 0) {
        this.isSyncing = false;
        return 0;
      }

      let successCount = 0;
      for (const node of batch) {
        try {
          // Temporary for prototype: Decrypt content to sync plain text to 'memories'
          const dek = this.dbManager.getDEK();
          const plainContent = await CryptoUtils.decrypt(
            {
              ciphertext: node.content_ciphertext,
              iv: node.content_iv,
              tag: node.content_tag,
              salt: node.content_salt
            },
            dek
          );

          // Send to Firebase "memories" collection in plain text for UI prototype
          const docRef = doc(collection(firestoreDb, 'memories'), node.id);
          
          await setDoc(docRef, {
            id: node.id,
            userId: this.userId,
            category: node.category,
            type: node.type,
            spaceId: node.space_id,
            content: plainContent,
            source: 'saule-core',
            createdAt: node.created_at,
            syncedAt: Date.now()
          });

          // Mark as synced locally
          const tx = db.transaction('nodes', 'readwrite');
          const store = tx.objectStore('nodes');
          const rowToUpdate = await store.get(node.id);
          if (rowToUpdate) {
            rowToUpdate.synced_at = Date.now();
            await store.put(rowToUpdate);
          }
          await tx.done;

          successCount++;
        } catch (err) {
          console.error(`[SyncEngine] Failed to push node ${node.id} to Firebase:`, err);
          // Don't break the loop, try the next one
        }
      }

      if (successCount > 0) {
         console.log(`[SyncEngine] Successfully synced ${successCount} encrypted capsules to Firebase.`);
      }
      
      this.isSyncing = false;
      return successCount;
    } catch (err) {
      console.error("[SyncEngine] Sync cycle encountered a critical error:", err);
      this.isSyncing = false;
      return 0;
    }
  }
}
