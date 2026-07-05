import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService } from '@/core/ai/ai-provider-service';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { uid, text, sessionHistory = [], locale, workspaceId, provider = 'gemini' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400, headers: corsHeaders });
    }

    const aiService = AIProviderService.getInstance();
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';

    // 1. Recall relevant semantic context from local saule-core server
    let contextPayload = "";
    try {
      const recallRes = await fetch('http://localhost:4000/api/smi/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          spaceId: workspaceId || 'default',
          spaceType: 'personal'
        })
      });
      if (recallRes.ok) {
        const recallData = await recallRes.json();
        contextPayload = recallData.composition?.compositionPayload || "";
      }
    } catch (err) {
      console.warn("[Chat API Proxy] Failed to connect to local saule-core on port 4000. Proceeding without SML context.", err);
    }

    // 2. Build Prompt for LLM using the SML context
    let systemPrompt = `You are Saule, an Adaptive Intelligence System.
Answer the user in a calm, helpful manner in ${languageStr}.`;

    if (contextPayload) {
      systemPrompt += `\n\nYou have access to the local Semantic Memory Layer (SML) context:
<LOCAL_SML_CONTEXT>
${contextPayload}
</LOCAL_SML_CONTEXT>`;
    }

    systemPrompt += `\n\nCRITICAL RULE: You MUST return your response as a valid JSON object EXACTLY like this:
{
  "reply": "Your conversational answer to the user",
  "contextToRemember": "A highly dense, factual summary of the new KNOWLEDGE or FACTS discussed in this interaction. Do NOT just write 'User asked X and I answered Y'. Instead, extract the actual information. Example: 'Kullanıcının Beiwe adında, her etkileşimden öğrenen yapay zekalı bir CRM projesi var.' or 'Kullanıcı Galatasaray takımını tutuyor.'. Focus on preserving the semantic meaning, entities, and facts about the user or the topic. Leave empty ONLY if it's a meaningless greeting.",
  "keywords": ["klima", "inverter", "fiyat"]
}`;

    const chatHistory = [...sessionHistory, { role: 'user', content: text }];
    const rawResponse = await aiService.generateChat(
      chatHistory,
      provider,
      { systemPrompt, temperature: 0.7 }
    );

    let replyText = rawResponse;
    let contextToRemember = "";

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (parsed.reply) replyText = parsed.reply;
      if (parsed.contextToRemember) contextToRemember = parsed.contextToRemember;
    } catch (err) {
      console.warn("Failed to parse AI JSON response:", rawResponse);
    }

    // 3. Ingest new context if generated
    if (contextToRemember && contextToRemember.trim().length > 0) {
      try {
        await fetch('http://localhost:4000/api/smi/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: contextToRemember,
            category: 'Knowledge',
            spaceId: workspaceId || 'default',
            spaceType: 'personal',
            provenance: {
              appName: 'saule-terminal',
              userAction: 'ingest',
              createdAt: Date.now()
            }
          })
        });
        console.log(`[Chat API Proxy] Successfully ingested context to local SML: ${contextToRemember}`);
      } catch (err) {
        console.error("[Chat API Proxy] Failed to ingest memory to local SML:", err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      reply: replyText, 
      packageId: 'local-session', 
      packageTitle: 'Local Session' 
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: "Internal Error", 
      message: error.message || String(error)
    }, { status: 500, headers: corsHeaders });
  }
}
