import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateEmbedding } from '@/lib/embeddings';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { uid, text, locale } = await req.json();

    if (!uid || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    // 1. Generate embedding for user's text
    const embedding = await generateEmbedding(text);
    
    // 2. Save user's memory to Firestore
    await adminDb.collection('memories').add({
      userId: uid,
      content: text,
      embedding: embedding,
      source: 'user',
      createdAt: new Date(),
    });

    // 3. Query Gemini for an empathetic response (Acting as SML)
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';
    const systemPrompt = `You are Saule, an Active Memory Assistant. The user just shared this memory: "${text}". 
Acknowledge it briefly and empathetically in a single short sentence in ${languageStr}. Do not be overly dramatic, just a calm, observing presence.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });
    
    const replyText = response.text || (locale === 'tr' ? "Hafızana kaydedildi." : "Recorded in your memory.");

    // 4. Save Saule's response to Firestore
    await adminDb.collection('memories').add({
      userId: uid,
      content: replyText,
      source: 'saule',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, reply: replyText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
