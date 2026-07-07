import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export class DatabaseManager {
  private db: Firestore | null = null;

  constructor(private dbName: string, private dek: string) {}

  public async initialize(): Promise<void> {
    if (this.db) return; // Zaten başlatıldı

    // Firebase Admin başlatma
    if (getApps().length === 0) {
      // Bulut ortamında çalışırken varsayılan credential yeterlidir.
      // process.env.GOOGLE_APPLICATION_CREDENTIALS kullanır.
      initializeApp();
    }
    
    this.db = getFirestore();
    console.log("[DatabaseManager] Firebase Admin Firestore initialized.");
  }

  public getDb(): Firestore {
    if (!this.db) {
      // Fallback in case initialize wasn't awaited properly
      if (getApps().length === 0) initializeApp();
      this.db = getFirestore();
    }
    return this.db;
  }

  public getDEK(): string {
    return this.dek;
  }

  public close() {
    // Firestore connections are managed by the admin SDK. 
    // We don't strictly need to close it for cloud functions.
    this.db = null;
  }
}
