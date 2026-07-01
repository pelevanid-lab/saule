import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateEmbedding } from '@/lib/embeddings';
import { GoogleGenAI } from '@google/genai';
import { FieldValue } from 'firebase-admin/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeIntent(text: string): Promise<'save' | 'query'> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intent classifier for a personal memory system. The user says: "${text}".
Is the user trying to save a new memory/fact/statement (reply SAVE), or are they asking a question/requesting information/advice (reply QUERY)?
Reply with exactly one word: SAVE or QUERY.`,
    });
    
    const intent = response.text?.trim().toUpperCase() || 'SAVE';
    return intent.includes('QUERY') ? 'query' : 'save';
  } catch (error) {
    console.error('Error analyzing intent:', error);
    return 'save'; // default to save on error
  }
}

export async function POST(req: NextRequest) {
  try {
    let { uid, text, locale, mode = 'auto', workspaceId } = await req.json();

    if (!uid || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    if (mode === 'auto') {
      mode = await analyzeIntent(text);
    }

    // 1. Generate embedding for user's text
    const embedding = await generateEmbedding(text);
    
    // 2. Query Firestore for similar past memories (RAG / Semantic Search)
    let contextString = '';
    try {
      let queryBase: any = adminDb.collection('memories').where('userId', '==', uid);
      if (workspaceId && workspaceId !== 'all') {
        queryBase = queryBase.where('workspaceId', '==', workspaceId);
      }

      const vectorQuery = queryBase.findNearest('embedding', FieldValue.vector(embedding), {
        limit: 3,
        distanceMeasure: 'COSINE',
      });
      
      const vectorSnapshot = await vectorQuery.get();
      const memories: string[] = [];
      vectorSnapshot.forEach((doc: any) => {
        const data = doc.data();
        
        // Expiration check (Forgetting feature)
        const expiresAt = data.expiresAt ? data.expiresAt.toDate() : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;
        
        if (data.source === 'user' && !isExpired) {
          memories.push(data.content);
        }
      });
      
      if (memories.length > 0) {
        contextString = memories.map(m => `- ${m}`).join('\n');
      }
    } catch (indexError: any) {
      console.warn("Vector search failed or index is missing. If index is missing, please click the Firebase console link in logs to create it:", indexError.message);
    }

    // 3. Save user's memory ONLY in 'save' mode
    if (mode === 'save') {
      await adminDb.collection('memories').add({
        userId: uid,
        content: text,
        embedding: FieldValue.vector(embedding),
        source: 'user',
        createdAt: new Date(),
        workspaceId: workspaceId || null,
      });
    }

    // 4. Query Gemini for an response
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';
    
    let systemPrompt = '';
    if (mode === 'query') {
      systemPrompt = `You are Saule, an Active Memory Assistant. The user is asking a question about their memory: "${text}". 
      
Here are their relevant past memories to help you answer:
${contextString || '(No relevant memories found)'}

Based ONLY on the provided memories, answer their question. If the memories do not contain the answer, say that you don't remember or have no record of it. Answer in a single, calm, helpful sentence in ${languageStr}.`;
    } else {
      systemPrompt = `You are Saule, an Active Memory Assistant. The user just shared this memory to be recorded: "${text}". 
      
Here are some relevant past memories of this user:
${contextString || '(No relevant memories found)'}

Acknowledge it briefly and use the context to connect the dots if relevant (e.g. "I've added this to your other memories about..."). Acknowledge and answer in a single, calm, short sentence in ${languageStr}. Do not be overly dramatic, just a calm, observing presence.`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });
    
    const replyText = response.text || (locale === 'tr' ? "Hafızana kaydedildi." : "Recorded in your memory.");

    // 5. Save Saule's response or query result to Firestore (for chat history display)
    // Even if query mode doesn't save the original prompt to 'memories', we save it as a chat message.
    // Wait, to keep the chat history working seamlessly, we should save both as 'chat' logs, or just save them.
    // Actually, saving query logs is good for session context, but we should make sure we distinguish them.
    // Let's save them as memories, but with a different flag, or just save all.
    // To keep it simple: we save ALL messages to Firestore so onSnapshot works, but for 'query' mode we don't include the 'embedding' field or we set source = 'query' so it is excluded from future vector searches!
    // Yes! That's brilliant! If source = 'query' or source = 'saule_reply', they are not loaded into the memories list for vector indexing!
    // Let's implement that:
    
    if (mode === 'query') {
      // Save user's question (without embedding, source = 'query')
      await adminDb.collection('memories').add({
        userId: uid,
        content: text,
        source: 'query',
        createdAt: new Date(),
      });
      // Save Saule's answer (source = 'saule_answer')
      await adminDb.collection('memories').add({
        userId: uid,
        content: replyText,
        source: 'saule_answer',
        createdAt: new Date(),
      });
    } else {
      // Save Saule's acknowledgment (source = 'saule')
      await adminDb.collection('memories').add({
        userId: uid,
        content: replyText,
        source: 'saule',
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: "Internal Error", 
      message: error.message || String(error),
      details: error.stack || null
    }, { status: 500 });
  }
}
