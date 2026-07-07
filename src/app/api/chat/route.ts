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
    const { uid, text, sessionHistory = [], locale, workspaceId, provider = 'gemini', contextPayload = '' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400, headers: corsHeaders });
    }

    const aiService = AIProviderService.getInstance();
    const languageStr = locale === 'tr' ? 'Turkish' : 'English';

    // 2. Build Prompt for LLM using the SML context
    let systemPrompt = `You are Saule, an Adaptive Intelligence System.
Answer the user in a calm, helpful manner in ${languageStr}.`;

    if (contextPayload) {
      systemPrompt += `\n\nYou have access to the following context:
<LOCAL_SML_CONTEXT>
${contextPayload}
</LOCAL_SML_CONTEXT>`;
    }

    systemPrompt += `\n\nCRITICAL RULE: You MUST return your response as a valid JSON object EXACTLY like this:
{
  "reply": "Your conversational answer to the user",
  "contextToRemember": "A highly dense, factual summary of the new KNOWLEDGE or FACTS discussed in this interaction. Do NOT just write 'User asked X and I answered Y'. Instead, extract the actual information. Focus on preserving the semantic meaning, entities, and facts. Leave empty ONLY if it's a meaningless greeting."
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
