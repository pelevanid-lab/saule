'use server';

import { adminDb } from '@/lib/firebase-admin';

export async function submitAccessForm(formData: {
  name: string;
  email: string;
  product: string;
  reason?: string;
  struggle?: string;
  takeaway?: string;
  feedback: boolean;
  consent: boolean;
}) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB is not initialized. Check your environment variables.');
    }

    const docRef = await adminDb.collection('early_access_requests').add({
      ...formData,
      createdAt: new Date(),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error in submitAccessForm Server Action:', error);
    return { success: false, error: error.message || 'Gönderim sırasında bilinmeyen bir hata oluştu.' };
  }
}
