import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIProviderOptions } from './provider-interface';

export class ClaudeService implements AIProvider {
  public name = 'claude';
  private client: Anthropic | null = null;

  private init() {
    if (this.client) return;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API Key bulunamadı! Lütfen .env dosyanıza ANTHROPIC_API_KEY ekleyin veya modeli Gemini olarak değiştirin.");
    }
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  public async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    this.init();
    try {
      const msg = await this.client!.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20240620',
        max_tokens: options?.maxTokens || 8192,
        temperature: options?.temperature || 0.7,
        system: options?.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });
      return ('text' in msg.content[0]) ? msg.content[0].text : '';
    } catch (error: any) {
      console.error('[AI]: Claude Error', error);
      throw error;
    }
  }

  public async generateChat(history: {role: string, content: string}[], options?: AIProviderOptions): Promise<string> {
    this.init();
    try {
      // Anthropic only accepts 'user' and 'assistant' roles. Map 'model' or 'saule' to 'assistant'
      const messages = history.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content
      }));

      const msg = await this.client!.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20240620',
        max_tokens: options?.maxTokens || 8192,
        temperature: options?.temperature || 0.7,
        system: options?.systemPrompt,
        messages
      });
      return ('text' in msg.content[0]) ? msg.content[0].text : '';
    } catch (error: any) {
      console.error('[AI]: Claude Chat Error', error);
      throw error;
    }
  }
}
