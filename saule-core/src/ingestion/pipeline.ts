import { GoogleGenerativeAI } from '@google/generative-ai';

export class PIIFilter {
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

export class IngestionPipeline {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'text-embedding-004';

  /**
   * Initializes the Gemini client.
   */
  private initExtractor() {
    if (this.genAI) return;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for embeddings.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[IngestionPipeline]: Gemini client initialized for model "${this.modelName}".`);
  }

  /**
   * Sanitizes, normalizes, and generates a dense vector embedding for the input text using Gemini.
   */
  public async process(text: string): Promise<{ sanitizedText: string; embedding: number[] }> {
    // 1. Normalize whitespace and clean
    const normalized = text.trim().replace(/\s+/g, ' ');

    // 2. Filter PII
    const sanitizedText = PIIFilter.mask(normalized);

    // 3. Generate Embedding via Gemini API
    let embedding: number[] = [];
    if (normalized === 'warmup') {
      // Return dummy for warmup
      return { sanitizedText, embedding: new Array(768).fill(0) };
    }

    try {
      this.initExtractor();
      if (!this.genAI) throw new Error("Gemini client not initialized");
      
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.embedContent(sanitizedText);
      const generatedEmbedding = result.embedding.values;
      embedding = Array.from(generatedEmbedding);
    } catch (err: any) {
      console.warn(`[IngestionPipeline] Gemini embedding failed: ${err.message || err}. Returning empty vector.`);
    }

    return {
      sanitizedText,
      embedding
    };
  }
}
