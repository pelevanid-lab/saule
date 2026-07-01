import { GoogleGenAI } from '@google/genai';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Instantiate inside the function to ensure process.env is populated at runtime
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
      config: {
        outputDimensionality: 768,
      }
    });
    
    // Return the vector array
    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
