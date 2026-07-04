import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { CRMRuleEngine, CRMEvent } from '@/core/crm/RuleEngine';
import { VectorService } from '@/core/intelligence/VectorService';

// Disable Next.js edge runtime limitations if needed, usually default node is fine.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, userId, event } = body;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key is required.' }, { status: 401 });
    }

    if (!event || !event.action) {
      return NextResponse.json({ success: false, error: 'Valid event object is required.' }, { status: 400 });
    }

    // 1. Verify API Key (In a real scenario, we'd look this up in the DB)
    // For now, we simulate API key validation.
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database not initialized.' }, { status: 500 });
    }

    const projectRef = await adminDb.collection('api_keys').where('key', '==', apiKey).limit(1).get();
    if (projectRef.empty && apiKey !== 'test_key') {
       // Allow 'test_key' for easy prototyping
       return NextResponse.json({ success: false, error: 'Invalid API Key.' }, { status: 403 });
    }
    
    const crmEvent = event as CRMEvent;

    // 2. Evaluate using the Deterministic Rule Engine
    const ruleResponse = CRMRuleEngine.evaluate(crmEvent);

    // 3. Save the event to memory WITHOUT invoking LLM conversation
    // This is purely factual data logging.
    if (userId) {
      const memoryText = `[CRM Event]: ${crmEvent.action} - ${crmEvent.productName || ''} (Price: ${crmEvent.price || 'N/A'})`;
      
      await adminDb.collection('memories').add({
        userId: userId,
        content: memoryText,
        source: crmEvent.url || 'crm-api',
        createdAt: new Date(),
        type: 'deterministic_log'
      });
      
      // Opt: We could also embed this for hybrid search if we wanted, but deterministic logs might not need it.
    }

    // 4. Return the decision instantly
    return NextResponse.json({
      success: true,
      decision: ruleResponse
    });

  } catch (error: any) {
    console.error('CRM Track API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
