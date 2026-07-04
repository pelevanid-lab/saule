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
    const { uid, text, sessionHistory = [], locale, workspaceId, provider = 'gemini', pageContext, forcePackageId } = await req.json();

    if (!uid || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400, headers: corsHeaders });
    }

    if (!adminDb) {
      throw new Error("Database not initialized");
    }

    const aiService = AIProviderService.getInstance();
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';

    // 1. Semantic Threading via Saule Core (Dynamic Context Drifting)
    const routed = await VectorService.routeToPackage(uid, text, pageContext || '', forcePackageId);
    let packageId = routed.packageId;
    let packageTitle = routed.title;
    let parentId = null;

    // Fetch details of the current package (to get title and parentId)
    try {
      const doc = await adminDb.collection('context_packages').doc(packageId).get();
      if (doc.exists) {
        packageTitle = doc.data()?.title || packageTitle;
        parentId = doc.data()?.parentId || null;
      }
    } catch (e) {}

    // 2. Graph RAG: Fetch Parent Contexts if hooked
    let parentMemories: string[] = [];
    if (parentId) {
      const parentSnap = await adminDb.collection('memories')
        .where('userId', '==', uid)
        .where('packageId', '==', parentId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      parentMemories = parentSnap.docs.reverse().map(doc => doc.data().content);
    }

    // 3. Fetch Current Package's Semantic Memories (Insights/Contexts, NOT raw chat)
    const historySnap = await adminDb.collection('memories')
      .where('userId', '==', uid)
      .where('packageId', '==', packageId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const semanticMemories = historySnap.docs.reverse().map(doc => doc.data().content);

    // Build the AI System Prompt with the Semantic Knowledge Graph
    let systemPrompt = `You are Saule, an Adaptive Intelligence System.
The user is speaking to you. Answer in a calm, helpful manner in ${languageStr}.
You have access to a semantic memory graph. These are the learned contexts regarding this topic:
<CURRENT_NODE_MEMORIES>\n${semanticMemories.join('\n')}\n</CURRENT_NODE_MEMORIES>`;

    if (parentMemories.length > 0) {
      systemPrompt += `\n\n<PARENT_NODE_MEMORIES>\n${parentMemories.join('\n')}\n</PARENT_NODE_MEMORIES>`;
    }

    if (pageContext) {
      systemPrompt += `\n\n[PAGE CONTEXT: The user is currently browsing this webpage]\n${pageContext}`;
    }

    systemPrompt += `\n\nCRITICAL RULE: You MUST return your response as a valid JSON object EXACTLY like this:
{
  "reply": "Your conversational answer to the user",
  "contextToRemember": "A highly dense, factual summary of the new KNOWLEDGE or FACTS discussed in this interaction. Do NOT just write 'User asked X and I answered Y'. Instead, extract the actual information. Example: 'Kullanıcının Beiwe adında, her etkileşimden öğrenen yapay zekalı bir CRM projesi var.' or 'Kullanıcı Galatasaray takımını tutuyor.'. Focus on preserving the semantic meaning, entities, and facts about the user or the current topic. Leave empty ONLY if it's a meaningless greeting like 'merhaba'.",
  "keywords": ["klima", "inverter", "fiyat"], // Extract 2-5 core keywords from the conversation to be used as mental tags. Array of strings.
  "structuredEvent": null // If the user mentions a meeting, booking, or actionable event, put an object here: { "type": "calendar_event", "title": "...", "date": "YYYY-MM-DD" }. Otherwise null.
}`;

    // Combine ephemeral session history with current text
    const chatHistory = [...sessionHistory, { role: 'user', content: text }];

    const rawResponse = await aiService.generateChat(
      chatHistory,
      provider,
      { systemPrompt, temperature: 0.7 }
    );

    // 4. Parse JSON Response
    let replyText = rawResponse;
    let contextToRemember = "";
    let structuredEvent = null;
    let extractedKeywords: string[] = [];
    
    try {
      // Çok daha güçlü JSON ayıklama algoritması (Regex ile ilk { } bloğunu bul)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (parsed.reply) replyText = parsed.reply;
      if (parsed.contextToRemember) contextToRemember = parsed.contextToRemember;
      if (parsed.structuredEvent) structuredEvent = parsed.structuredEvent;
      if (parsed.keywords && Array.isArray(parsed.keywords)) extractedKeywords = parsed.keywords;
      console.log(`[LLM_PARSED] Reply length: ${replyText.length}, ContextToRemember: "${contextToRemember}", Keywords: ${extractedKeywords.join(', ')}`);
    } catch (err) {
      console.warn("Failed to parse AI JSON response. Raw Response was:", rawResponse);
    }

    // 5. PURE CONTEXT ARCHITECTURE: NEVER save raw chat messages. ONLY save contextToRemember.
    if (contextToRemember && contextToRemember.trim().length > 0) {
      
      let sourceDomain = 'saule-terminal';
      try {
        if (pageContext) {
           const urlMatch = pageContext.match(/URL:\s*(https?:\/\/[^\s]+)/);
           if (urlMatch && urlMatch[1]) {
             sourceDomain = new URL(urlMatch[1]).hostname.replace(/^www\./, '');
           }
        }
      } catch (e) {}

      await adminDb.collection('memories').add({
        userId: uid,
        content: contextToRemember,
        source: sourceDomain,
        createdAt: new Date(),
        workspaceId: workspaceId || null,
        packageId: packageId
      });
      console.log(`[SAULE_MEMORY] Learned: ${contextToRemember}`);

      // FIRE-AND-FORGET: Asynchronously update the package keywords for Hybrid Search
      if (extractedKeywords.length > 0) {
        VectorService.updatePackageKeywords(packageId, extractedKeywords).catch(err => {
          console.error("Failed to update keywords asynchronously:", err);
        });
      }
    }

    // 6. Save Structured Events if any
    if (structuredEvent && structuredEvent.type === 'calendar_event') {
      await adminDb.collection('workspaces').doc(workspaceId || uid).collection('calendar_events')
        .add({
          userId: uid, title: structuredEvent.title, details: '',
          date: structuredEvent.date || null, createdAt: new Date().toISOString(),
          packageId: packageId
        });
      console.log(`[SAULE_EVENT] Saved Calendar Event: ${structuredEvent.title}`);
    }

    return NextResponse.json({ success: true, reply: replyText, packageId, packageTitle }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: "Internal Error", 
      message: error.message || String(error),
    }, { status: 500, headers: corsHeaders });
  }
}

