import { adminDb } from '@/lib/firebase-admin';
import { PatternRecord } from './PatternMemory';

export class FirestorePatternStore {
  static async getRecord(fingerprint: string): Promise<PatternRecord | undefined> {
    if (!adminDb) return undefined;
    const doc = await adminDb.collection('pattern_memory').doc(fingerprint).get();
    return doc.exists ? (doc.data() as PatternRecord) : undefined;
  }

  static async saveRecord(record: PatternRecord): Promise<void> {
    if (!adminDb) return;
    await adminDb.collection('pattern_memory').doc(record.fingerprint).set(record, { merge: true });
  }

  static async getAllRecords(): Promise<PatternRecord[]> {
    if (!adminDb) return [];
    const snap = await adminDb.collection('pattern_memory').get();
    return snap.docs.map(doc => doc.data() as PatternRecord);
  }

  static async getWorkspaceRecords(workspaceId: string, limit: number): Promise<PatternRecord[]> {
    if (!adminDb) return [];
    const snap = await adminDb.collection('pattern_memory')
      .where('workspaceId', '==', workspaceId)
      .limit(limit)
      .get();
    return snap.docs.map(doc => doc.data() as PatternRecord);
  }
}
