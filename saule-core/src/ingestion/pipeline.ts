import './polyfill.js';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for browser environment
env.allowLocalModels = false;
env.useBrowserCache = true;

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
  private extractor: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';

  /**
   * Initializes the ONNX model pipeline.
   */
  private async initExtractor() {
    if (this.extractor) return;
    try {
      console.log(`[IngestionPipeline]: Loading ONNX model "${this.modelName}"...`);
      this.extractor = await pipeline('feature-extraction', this.modelName);
      console.log(`[IngestionPipeline]: ONNX model loaded successfully.`);
    } catch (e: any) {
      console.error("[IngestionPipeline] Failed to load ONNX pipeline:", e.message || e.toString());
      throw e;
    }
  }

  /**
   * Sanitizes, normalizes, and generates a dense vector embedding for the input text.
   */
  public async process(text: string): Promise<{ sanitizedText: string; embedding: number[] }> {
    // 1. Normalize whitespace and clean
    const normalized = text.trim().replace(/\s+/g, ' ');

    // 2. Filter PII
    const sanitizedText = PIIFilter.mask(normalized);

    // 3. Generate Embedding locally via ONNX
    let embedding: number[] = [];
    try {
      await this.initExtractor();
      const output = await this.extractor(sanitizedText, { pooling: 'mean', normalize: true });
      embedding = Array.from(output.data);
    } catch (err: any) {
      console.warn(`[IngestionPipeline] Local embedding failed: ${err.message || err}. Returning empty vector.`);
    }

    return {
      sanitizedText,
      embedding
    };
  }
}
