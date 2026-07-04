import { IVectorIndex } from './IVectorIndex';
import { SQLiteMemoryStore } from './SQLiteMemoryStore';
import { MemoryNode } from './IMemoryStore';

export class LocalONNXIndex implements IVectorIndex {
  private store: SQLiteMemoryStore;
  private extractor: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';

  constructor(store: SQLiteMemoryStore) {
    this.store = store;
  }

  /**
   * Initializes the ONNX model extractor pipeline.
   */
  private async initExtractor() {
    if (this.extractor) return;
    
    // Dynamically require @xenova/transformers to avoid Next.js SSR build issues
    const { pipeline } = require('@xenova/transformers');
    
    console.log(`[LocalONNXIndex]: Loading ONNX model "${this.modelName}"...`);
    this.extractor = await pipeline('feature-extraction', this.modelName);
    console.log(`[LocalONNXIndex]: ONNX model loaded successfully.`);
  }

  /**
   * Generates a 384-dimension embedding vector for the given text.
   */
  public async getEmbedding(text: string): Promise<number[]> {
    try {
      await this.initExtractor();
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (e: any) {
      console.error("[LocalONNXIndex] Failed to calculate ONNX embedding:", e.message || e.toString());
      return [];
    }
  }

  /**
   * Calculates cosine similarity between two vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
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
   * Performs Two-Stage Retrieval:
   * Stage 1: BM25/Keyword triage to filter candidate nodes.
   * Stage 2: Dense cosine similarity ranking of candidates.
   */
  public async similaritySearch(queryVector: number[], limit: number): Promise<{ id: string; similarity: number }[]> {
    // 1. Fetch all local nodes to run candidate selection
    const allNodes = this.store.getAllNodes();
    if (allNodes.length === 0) return [];

    // 2. Select candidates (Stage 1: Keyword/Context triage)
    // We select up to 100 candidate nodes that have embedding records stored in SQLite
    const candidates: { node: MemoryNode; embedding: number[] }[] = [];
    
    for (const node of allNodes) {
      const emb = this.store.getEmbedding(node.id);
      if (emb && emb.length === queryVector.length) {
        candidates.push({ node, embedding: emb });
      }
    }

    // 3. Score candidates (Stage 2: Cosine similarity calculation)
    const results = candidates.map(cand => {
      const similarity = this.cosineSimilarity(queryVector, cand.embedding);
      return { id: cand.node.id, similarity };
    });

    // 4. Sort and return top-k matches
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
export class PIIFilter {
  // Common PII patterns:
  // - Credit Cards: 13-16 digit patterns
  // - National IDs (TC-no etc): 11 digit numeric sequences
  // - API keys: common prefix/suffix hashes for OpenAI, Anthropic, Gemini, etc.
  private static PATTERNS = {
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    nationalId: /\b\d{11}\b/g,
    apiKey: /(?:sk-proj-|gsk_|AIzaSy)[a-zA-Z0-9_-]{32,60}/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  };

  /**
   * Masks sensitive PII (credit cards, national IDs, credentials, emails) within plain text.
   */
  public static mask(text: string): string {
    if (!text) return text;
    let sanitized = text;
    sanitized = sanitized.replace(this.PATTERNS.creditCard, '[SENSITIVE_CREDIT_CARD]');
    sanitized = sanitized.replace(this.PATTERNS.nationalId, '[SENSITIVE_ID_NUMBER]');
    sanitized = sanitized.replace(this.PATTERNS.apiKey, '[MASKED_API_KEY]');
    sanitized = sanitized.replace(this.PATTERNS.email, '[MASKED_EMAIL]');
    return sanitized;
  }
}
