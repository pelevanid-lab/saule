import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, AIProviderOptions } from './provider-interface';

export class GeminiService implements AIProvider {
  public name = 'gemini';
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  private init() {
    if (this.client) return;
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  public async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    this.init();
    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 8192,
          temperature: options?.temperature || 0.7,
        }
      });
      return result.response.text();
    } catch (error: any) {
      console.error('[AI]: Gemini Error', error);
      throw error;
    }
  }

  public async generateChat(history: {role: string, content: string}[], options?: AIProviderOptions): Promise<string> {
    this.init();
    try {
      const contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      
      let sysInstruction;
      if (options?.systemPrompt) {
        sysInstruction = {
          role: 'system',
          parts: [{ text: options.systemPrompt }]
        };
      }

      const result = await this.model!.generateContent({
        contents,
        systemInstruction: sysInstruction,
        generationConfig: { maxOutputTokens: options?.maxTokens || 8192, temperature: options?.temperature || 0.7 }
      });
      return result.response.text();
    } catch (error: any) {
      console.error('[AI]: Gemini Chat Error', error);
      throw error;
    }
  }
}
