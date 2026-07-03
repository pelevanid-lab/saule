import { ProviderType, AIProvider, AIProviderOptions } from './provider-interface';
import { GeminiService } from './gemini-service';
import { ClaudeService } from './claude-service';

export class AIProviderService {
  private static instance: AIProviderService;
  private providers: Record<string, AIProvider>;
  private defaultProvider: ProviderType;

  public static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  constructor() {
    this.providers = {
      gemini: new GeminiService(),
      claude: new ClaudeService(),
    };
    this.defaultProvider = (process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER as ProviderType) || 'gemini';
  }

  public getProvider(type?: ProviderType): AIProvider {
    const selected = type || this.defaultProvider;
    const provider = this.providers[selected];
    if (!provider) {
      console.warn(`[AI]: Provider ${selected} not initialized, falling back to Gemini`);
      return this.providers['gemini'];
    }
    return provider;
  }

  public async generateText(prompt: string, type?: ProviderType, options?: AIProviderOptions): Promise<string> {
    const provider = this.getProvider(type);
    return provider.generateText(prompt, options);
  }

  public async generateChat(history: {role: string, content: string}[], type?: ProviderType, options?: AIProviderOptions): Promise<string> {
    const provider = this.getProvider(type);
    return provider.generateChat(history, options);
  }
}
