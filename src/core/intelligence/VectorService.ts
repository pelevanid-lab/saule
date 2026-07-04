import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AIProviderService } from '../ai/ai-provider-service';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export class VectorService {
  /**
   * Metni vektöre çevirir (Embedding).
   * @param text Vektörize edilecek metin (bağlam/içerik)
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    try {
      try {
        const response = await ai.models.embedContent({
          model: 'gemini-embedding-2',
          contents: text.substring(0, 5000),
        });
        if (response.embeddings && response.embeddings.length > 0) {
           return response.embeddings[0].values || [];
        }
        return [];
      } catch (err: any) {
        const errMsg = err.message || err.toString();
        console.warn("[VectorService] gemini-embedding-2 failed (" + errMsg + "). Falling back to gemini-embedding-001.");
        const fallbackResponse = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: text.substring(0, 5000),
        });
        if (fallbackResponse.embeddings && fallbackResponse.embeddings.length > 0) {
           return fallbackResponse.embeddings[0].values || [];
        }
        return [];
      }
    } catch (e: any) {
      console.error("[VectorService] Embedding completely failed:", e.message || e.toString());
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
   * Eşzamansız (Asynchronous) Arka Plan Görevi: Kilit Kelimeleri Günceller
   * LLM'den dönen keywords dizisini Firestore'a yazar.
   */
  public static async updatePackageKeywords(packageId: string, newKeywords: string[]) {
    try {
      if (!adminDb || !newKeywords || newKeywords.length === 0) return;
      const docRef = adminDb.collection('context_packages').doc(packageId);
      
      // ArrayUnion ile sadece yeni ve benzersiz kelimeleri veritabanına ekliyoruz.
      await docRef.update({
        keywords: FieldValue.arrayUnion(...newKeywords.map(k => k.toLowerCase().trim()))
      });
      console.log(`[VectorService] Hibrit Arama için Kilit Kelimeler eklendi (${packageId}): ${newKeywords.join(', ')}`);
    } catch (e) {
      console.error("[VectorService] Kilit kelime güncellenirken hata:", e);
    }
  }

  /**
   * Determines the Semantic Context Package (Thread) for an incoming message.
   * Pulls recent active packages from Firestore, computes cosine similarity,
   * and groups the message if similarity > 0.70. Otherwise, spawns a new package.
   */
  public static async routeToPackage(
    uid: string, 
    text: string, 
    pageContext: string = '',
    forcePackageId?: string | null
  ): Promise<{ packageId: string, title: string }> {
    
    // Extract just the Title from pageContext to give the Vector Engine a hint about the environment.
    // We avoid embedding the full 1500-char Content Snippet so it doesn't wash out the user's intent.
    let envHint = '';
    if (pageContext) {
      const titleMatch = pageContext.match(/Title:\s*([^\n]+)/);
      if (titleMatch && titleMatch[1]) {
        envHint = ` (Context: ${titleMatch[1]})`;
      }
    }
    
    const newEmbedding = await this.generateEmbedding(text.trim() + envHint);
    
    if (newEmbedding.length === 0) {
      return { packageId: forcePackageId || 'default', title: 'Genel Sohbet' };
    }

    if (!adminDb) return { packageId: forcePackageId || 'default', title: 'Genel Sohbet' };

    // DYNAMIC CONTEXT DRIFT CHECK
    if (forcePackageId) {
      try {
        const forcedDoc = await adminDb.collection('context_packages').doc(forcePackageId).get();
        if (forcedDoc.exists) {
          const forcedData = forcedDoc.data();
          if (forcedData?.embedding && Array.isArray(forcedData.embedding)) {
            const sim = this.cosineSimilarity(newEmbedding, forcedData.embedding);
            console.log(`[VectorService] Similarity with Active Session (${forcePackageId}): ${sim}`);
            
            // If similarity is reasonably high, or it's a very short message (like "evet"), stick to the active session.
            if (sim >= 0.80 || text.length < 20) {
              await adminDb.collection('context_packages').doc(forcePackageId).update({
                updatedAt: new Date().toISOString(),
                messageCount: FieldValue.increment(1)
              });
              return { packageId: forcePackageId, title: forcedData.title };
            } else {
              console.log(`[VectorService] CONTEXT DRIFT DETECTED! Sim: ${sim} < 0.80. Breaking out...`);
              // Do NOT return here. Let it fall through to normal semantic routing below!
            }
          } else {
            // No embedding, stick to forced
            return { packageId: forcePackageId, title: forcedData?.title || 'Genel Sohbet' };
          }
        }
      } catch (e) {
        console.error("Error checking context drift:", e);
      }
    }

    // Fetch the 5 most recently active packages for this user
    const packagesRef = adminDb.collection('context_packages')
      .where('userId', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(5);
      
    const snapshot = await packagesRef.get();
    
    // Gelen metni kelimelerine ayır (Noktalama işaretlerini silip küçük harfe çevirir)
    // Hibrit Arama (Ctrl+F) için kullanılacak.
    const incomingWords = new Set(
      `${text} ${envHint}`.toLowerCase().replace(/[^\w\sğüşıöç]/g, ' ').split(/\s+/).filter(w => w.length > 2)
    );

    let bestMatchId = null;
    let bestMatchTitle = '';
    let highestSimilarity = -1;

    // Compare embeddings & KEYWORDS (Hybrid Search)
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // 1. ADIM: Sparse Retrieval (Anahtar Kelime Eşleşmesi - Ctrl+F)
      let hasKeywordMatch = false;
      if (data.keywords && Array.isArray(data.keywords)) {
         for (const kw of data.keywords) {
            // Gelen mesajın içinde, eski kutunun etiketlerinden biri var mı?
            if (incomingWords.has(kw.toLowerCase().trim())) {
               hasKeywordMatch = true;
               break;
            }
         }
      }

      // 2. ADIM: Dense Semantic Validation (Vektör Doğrulaması)
      if (data.embedding && Array.isArray(data.embedding)) {
        let sim = this.cosineSimilarity(newEmbedding, data.embedding);
        
        // EĞER KELİME EŞLEŞTİYSE: Beyin çağrışım yaptı demektir. 
        // Vektör benzerliğine devasa bir "Boost (%20)" vererek kutuya girmesini (çengellenmesini) garantiliyoruz!
        // Tabi eğer konu TAMAMEN alakasızsa (sim: 0.30 ise), %20 boost bile yetmez (0.50 olur) ve içeri giremez.
        if (hasKeywordMatch) {
           console.log(`[VectorService] HİBRİT ARAMA: "${doc.id}" kutusunda Anahtar Kelime (Tag) Eşleşti! Benzerlik Puanına +0.20 Boost yapılıyor...`);
           sim += 0.20; 
        }

        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatchId = doc.id;
          bestMatchTitle = data.title;
        }
      }
    });

    console.log(`[VectorService] Highest similarity among recent packages: ${highestSimilarity}`);

    // If highly similar (e.g. > 85%), route to existing package (Expanding Context)
    if (highestSimilarity >= 0.85 && bestMatchId) {
      // Update package's updatedAt timestamp
      await adminDb.collection('context_packages').doc(bestMatchId).update({
        updatedAt: new Date().toISOString(),
        messageCount: FieldValue.increment(1)
      });
      return { packageId: bestMatchId, title: bestMatchTitle };
    }

    // If moderately similar (75% - 85%), it's a related/child topic. We hook it!
    let parentId = null;
    if (highestSimilarity >= 0.75 && bestMatchId) {
      parentId = bestMatchId;
      console.log(`[VectorService] Hooking new context to parent: ${parentId} (Sim: ${highestSimilarity})`);
    }

    // Otherwise, create a NEW package.
    // PURE PRINCIPLE: NO BACKGROUND LLM CALLS. 
    // We generate a simple algorithmic title from the first few words of the context.
    let newTitle = text.trim().split(/\s+/).slice(0, 4).join(' ');
    if (newTitle.length > 30) newTitle = newTitle.substring(0, 30) + '...';
    if (!newTitle) newTitle = 'Yeni Bağlam';

    const newDocRef = await adminDb.collection('context_packages').add({
      userId: uid,
      title: newTitle.trim(),
      embedding: newEmbedding, // We store the initial embedding to define the "center" of this cluster
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
      parentId: parentId // Hierarchy Hook (if any)
    });

    return { packageId: newDocRef.id, title: newTitle.trim() };
  }
}
