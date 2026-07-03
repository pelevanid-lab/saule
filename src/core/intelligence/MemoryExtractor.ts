import { AIProviderService } from '../ai/ai-provider-service';

export interface ExtractedMemory {
  type: 'note' | 'calendar_event' | 'strategic_learning' | 'none';
  title?: string;
  details?: string;
  date?: string; // For calendar events
}

export class MemoryExtractor {
  public static async extractContext(userMessage: string): Promise<ExtractedMemory> {
    if (userMessage.length < 10) return { type: 'none' };
    
    try {
      const aiService = AIProviderService.getInstance();
      
      const prompt = `You are the "Aha! Moment" Memory Extractor for Saule (an Adaptive Intelligence System).
Your job is to silently analyze the user's chat message and determine if they are sharing something that should be remembered proactively.

Look for:
1. "strategic_learning": A strategic insight, friction, or campaign learning (e.g., "We tried X but Y happened", "Segment Z doesn't like pricing").
2. "calendar_event": A mention of a future meeting, deadline, or appointment (e.g., "I have a meeting with John tomorrow at 5").
3. "note": A specific fact or personal note the user wants to remember (e.g., "Door code is 1234", "My wife's birthday is Jan 10").

User Message: "${userMessage}"

If there is NOTHING worth remembering, return exactly the word: NONE
If there IS something to remember, return a JSON object with this exact format:
{
  "type": "strategic_learning" | "calendar_event" | "note",
  "title": "A short 3-4 word title for this memory",
  "details": "The specific details, friction, or fact",
  "date": "ISO 8601 date string if type is calendar_event, otherwise null"
}

Do not use markdown blocks, just return the raw JSON or the word NONE.`;

      const responseText = await aiService.generateText(prompt, 'gemini', { temperature: 0.1 });
      
      if (responseText.includes('NONE') || responseText.trim() === 'NONE') {
        return { type: 'none' };
      }
      
      try {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);
        if (data.type && data.type !== 'none') {
          return data as ExtractedMemory;
        }
      } catch (parseError) {
        console.warn('[MEMORY_EXTRACTOR] Failed to parse JSON:', responseText);
      }
    } catch (err) {
      console.warn('[MEMORY_EXTRACTOR] Extraction failed:', err);
    }
    
    return { type: 'none' };
  }
}
