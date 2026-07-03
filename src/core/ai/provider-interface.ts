export type ProviderType = 'gemini' | 'claude' | 'openai';

export interface AIProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: AIProviderOptions): Promise<string>;
  generateChat(history: {role: string, content: string}[], options?: AIProviderOptions): Promise<string>;
}
