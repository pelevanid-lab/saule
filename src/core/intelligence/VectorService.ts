import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AIProviderService } from '../ai/ai-provider-service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export class VectorService {
  /**
   * Generates a mathematical vector embedding for the given text using Gemini.
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await embeddingModel.embedContent(text.substring(0, 5000));
      return result.embedding.values;
    } catch (e) {
      console.error("[VectorService] Embedding error:", e);
      return [];
    }
  }

  /**
   * Calculates cosine similarity between two vectors.
   * Returns a score between -1 and 1. (Closer to 1 means highly similar).
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Determines the Semantic Context Package (Thread) for an incoming message.
   * Pulls recent active packages from Firestore, computes cosine similarity,
   * and groups the message if similarity > 0.70. Otherwise, spawns a new package.
   */
  public static async routeToPackage(
    uid: string, 
    text: string, 
    pageContext: string = ''
  ): Promise<{ packageId: string, title: string }> {
    
    const combinedContext = `${text}\n${pageContext}`.trim();
    const newEmbedding = await this.generateEmbedding(combinedContext);
    
    if (newEmbedding.length === 0) {
      return { packageId: 'default', title: 'Genel Sohbet' };
    }

    if (!adminDb) return { packageId: 'default', title: 'Genel Sohbet' };

    // Fetch the 5 most recently active packages for this user
    const packagesRef = adminDb.collection('context_packages')
      .where('userId', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(5);
      
    const snapshot = await packagesRef.get();
    
    let bestMatchId = null;
    let bestMatchTitle = '';
    let highestSimilarity = -1;

    // Compare embeddings
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.embedding && Array.isArray(data.embedding)) {
        const sim = this.cosineSimilarity(newEmbedding, data.embedding);
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatchId = doc.id;
          bestMatchTitle = data.title;
        }
      }
    });

    console.log(`[VectorService] Highest similarity: ${highestSimilarity}`);

    // If highly similar (e.g. > 70%), route to existing package
    if (highestSimilarity >= 0.70 && bestMatchId) {
      // Update package's updatedAt timestamp
      await adminDb.collection('context_packages').doc(bestMatchId).update({
        updatedAt: new Date().toISOString(),
        messageCount: FieldValue.increment(1)
      });
      return { packageId: bestMatchId, title: bestMatchTitle };
    }

    // Otherwise, create a NEW package.
    // Use the LLM quickly just to generate a 3-word title based on the context.
    let newTitle = 'Yeni Bağlam';
    try {
      const prompt = `Create a very short 2-4 word title for this topic/context. Do not use quotes or markdown. Context:\n${combinedContext.substring(0,500)}`;
      newTitle = await AIProviderService.getInstance().generateText(prompt, 'gemini', { temperature: 0.3 });
    } catch (e) {
      console.warn("Failed to generate title, using default.");
    }

    const newDocRef = await adminDb.collection('context_packages').add({
      userId: uid,
      title: newTitle.trim(),
      embedding: newEmbedding, // We store the initial embedding to define the "center" of this cluster
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1
    });

    return { packageId: newDocRef.id, title: newTitle.trim() };
  }
}
