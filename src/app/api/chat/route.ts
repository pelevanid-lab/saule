import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { AIProviderService } from '@/core/ai/ai-provider-service';
import { MemoryExtractor } from '@/core/intelligence/MemoryExtractor';
import { VectorService } from '@/core/intelligence/VectorService';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    const uid = searchParams.get('uid');

    if (!packageId || !uid) {
      return NextResponse.json({ error: "Missing packageId or uid" }, { status: 400, headers: corsHeaders });
    }
    
    if (!adminDb) throw new Error("DB not init");

    const snapshot = await adminDb.collection('memories')
      .where('userId', '==', uid)
      .where('packageId', '==', packageId)
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
      
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return { role: data.source, text: data.content };
    });

    return NextResponse.json({ success: true, messages }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Error", message: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, text, locale, workspaceId, provider = 'gemini', pageContext, forcePackageId } = await req.json();

    if (!uid || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400, headers: corsHeaders });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const aiService = AIProviderService.getInstance();
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';

    // 1. Semantic Threading (Vector Clustering) via Saule Core
    let packageId = forcePackageId;
    let packageTitle = 'Genel Sohbet';
    
    if (!packageId) {
       const routed = await VectorService.routeToPackage(uid, text, pageContext || '');
       packageId = routed.packageId;
       packageTitle = routed.title;
    } else {
       // Fetch existing title if forced
       try {
         const doc = await adminDb.collection('context_packages').doc(packageId).get();
         if (doc.exists) packageTitle = doc.data()?.title || 'Genel Sohbet';
       } catch (e) {}
    }

    // Fetch up to 10 previous messages from this package for context
    const historySnap = await adminDb.collection('memories')
      .where('userId', '==', uid)
      .where('packageId', '==', packageId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    // reverse to get chronological order
    const chatHistory = historySnap.docs.reverse().map(doc => {
      const data = doc.data();
      return { role: data.source === 'saule' ? 'model' : 'user', content: data.content };
    });
    chatHistory.push({ role: 'user', content: text }); // Append current message

    // 2. Send the user message to the chosen AI Provider
    let systemPrompt = `You are Saule, an Adaptive Intelligence System.
The user is speaking to you. Answer in a calm, helpful manner in ${languageStr}.
If they ask a question, answer it. If they are just making a statement, acknowledge it.
Keep your response concise.`;

    if (pageContext) {
      systemPrompt += `\n\n[CONTEXT: The user is currently browsing the following webpage. You may use this context if the user's question relates to it.]\n${pageContext}`;
    }

    const replyText = await aiService.generateChat(
      chatHistory,
      provider,
      { systemPrompt, temperature: 0.7 }
    );

    // 3. Save chat history to Firestore (tagged with packageId)
    await adminDb.collection('memories').add({
      userId: uid,
      content: text,
      source: 'user',
      createdAt: new Date(),
      workspaceId: workspaceId || null,
      packageId: packageId
    });

    await adminDb.collection('memories').add({
      userId: uid,
      content: replyText,
      source: 'saule',
      createdAt: new Date(),
      workspaceId: workspaceId || null,
      provider: provider,
      packageId: packageId
    });

    // 4. Proactive Memory Extraction (Silent Aha! Moment)
    MemoryExtractor.extractContext(text).then(async (extraction) => {
      if (extraction && extraction.type !== 'none' && extraction.title) {
        console.log(`[SAULE_NOTICED]: Extracted ${extraction.type} - ${extraction.title}`);
        
        let collectionName = 'notes';
        if (extraction.type === 'calendar_event') collectionName = 'calendar_events';
        else if (extraction.type === 'strategic_learning') collectionName = 'strategic_learnings';

        await adminDb!.collection('workspaces')
          .doc(workspaceId || uid)
          .collection(collectionName)
          .add({
            userId: uid,
            title: extraction.title,
            details: extraction.details || '',
            date: extraction.date || null,
            createdAt: new Date().toISOString(),
            sourceMessage: text,
            packageId: packageId
          });
      }
    }).catch(err => console.error('[SAULE_NOTICED_ERROR]:', err));

    return NextResponse.json({ success: true, reply: replyText, packageId, packageTitle }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: "Internal Error", 
      message: error.message || String(error),
    }, { status: 500, headers: corsHeaders });
  }
}
