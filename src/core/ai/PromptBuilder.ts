import {
  SimulationScenario, 
  SimulationResult, 
  SegmentCluster,
  StakeholderConfig,
  MarketContext
} from '../types/simulation';

export class PromptBuilder {
  private static getPersonaInstruction(type?: string): string {
    switch (type) {
      case 'pricing_test':
        return 'Act as a principal Pricing Strategist and Revenue Optimizer. Focus on price elasticity, willingness-to-pay, and value perception.';
      case 'price_elasticity':
        return 'Act as a principal Pricing Strategist. Focus on price elasticity, conversion impact, and willingness-to-pay dynamics.';
      case 'message_test':
        return 'Act as a world-class Copywriting Expert and Behavioral Psychologist. Focus on messaging resonance, clarity, and emotional drivers.';
      case 'ab_headline':
        return 'Act as a world-class Direct Response Copywriter. Focus on open rates, curiosity gaps, and immediate conversion drivers.';
      case 'creative_test':
        return 'Act as a Senior Creative Director and Behavioral Scientist. Focus on visual attention, emotional reaction, and ad fatigue.';
      case 'positioning_test':
        return 'Act as a Senior Brand Strategist and Market Analyst. Focus on brand differentiation, long-term trust, and strategic market alignment.';
      case 'cx_journey':
        return 'Act as a Senior Customer Experience Architect. Focus on friction points, drop-offs, and journey optimization.';
      case 'competitor_response':
        return 'Act as a Competitive Intelligence Director. Focus on counter-strategies, market share defense, and tactical positioning.';
      default:
        return 'Act as a Senior Strategic Analyst and Decision Architect. Focus on long-term impact, risk mitigation, and optimal resource allocation.';
    }
  }

  public static buildPersonaEnrichmentPrompt(cluster: SegmentCluster, config: StakeholderConfig): string {
    return `
      You are an expert behavioral psychologist. Enrich the following synthetic stakeholder segment with qualitative detail.
      
      BASE SEGMENT:
      - Name: ${cluster.name}
      - Traits: ${cluster.traits.join(', ')}
      - Base Bias: ${cluster.bias}
      - Trend Sensitivity: ${(config.trendSensitivity || 0.5) * 100}%
      
      TASK:
      Generate a detailed stakeholder profile. 
      IMPORTANT: Return ONLY a valid JSON object with the following structure:
      {
        "qualitativeBio": "A 2-3 sentence evocative description of this stakeholder's typical day and mindset.",
        "deepMotivations": ["motivation 1", "motivation 2", "motivation 3"],
        "likelyObjections": ["objection 1", "objection 2"],
        "potentialDelighters": ["what would wow them 1", "what would wow them 2"]
      }
    `;
  }

  public static buildTrendInterpretationPrompt(context: MarketContext): string {
    return `
      You are a senior market strategist. Interpret the following market context and identify relevant trends.
      
      CONTEXT:
      - Country: ${context.country}
      - Category: ${context.category}
      - Competitive Landscape: ${context.competitorContext}
      - Economic Sentiment: ${context.economicSentiment}
      
      TASK:
      Provide a strategic analysis of this environment.
      IMPORTANT: Return ONLY a valid JSON object with the following structure:
      {
        "contextSummary": "A concise summary of the current market climate.",
        "relevantTrends": ["trend 1", "trend 2"],
        "marketRisks": ["risk 1", "risk 2"],
        "opportunities": ["opportunity 1", "opportunity 2"]
      }
    `;
  }

  public static buildExecutiveReportPrompt(scenario: SimulationScenario, result: SimulationResult): string {
    const optionSummaries = result.optionResults.map((vr, i) => {
      const label = `Option ${String.fromCharCode(65 + i)}`;
      const metricsStr = Object.entries(vr.metrics)
        .map(([k, v]) => `  - ${k}: ${v}/100`)
        .join('\n');
      const isWinner = vr.optionId === result.winnerOptionId;
      return `${label}${isWinner ? ' (WINNER)' : ''}:\n${metricsStr}`;
    }).join('\n\n');

    return `
      ${this.getPersonaInstruction(scenario.experimentType)}
      Analyze the following simulation results and provide an executive summary and structured strategic recommendations.
      
      RESEARCH SCENARIO:
      - Title: ${scenario.title}
      - Goal: ${scenario.description}
      - Type: ${scenario.experimentType}
      
      DETERMINISTIC RESULTS:
      ${optionSummaries}
      
      TASK:
      1. Write a punchy Executive Summary.
         - For pricing_test / price_elasticity: Focus on price elasticity and conversion friction.
         - For message_test / ab_headline: Focus on clarity vs persuasion and hook impact.
         - For positioning_test: Focus on brand alignment and perception.
         - For creative_test: Focus on emotional reaction and visual attention.
         - For cx_journey: Focus on journey friction and dropout risks.
         - For competitor_response: Focus on defense strategy and competitive edge.
      2. Provide exactly 3 structured Strategic Recommendations.
      
      IMPORTANT: Return ONLY a valid JSON object:
      {
        "summary": "...",
        "recommendations": [
          { "action": "...", "rationale": "...", "impact": "high" },
           ...
        ],
        "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
      }
    `;
  }

  public static buildStrategistChatPrompt(scenario: SimulationScenario, result: SimulationResult, userMessage: string): string {
    return `
      ${this.getPersonaInstruction(scenario.experimentType)}
      You are helping a user refine their strategic decision based on recent simulation results.
      
      CURRENT SCENARIO (Type: ${scenario.experimentType}):
      ${JSON.stringify(scenario, null, 2)}
      
      CURRENT RESULTS:
      Winner: ${result.winnerOptionId}
      Confidence: ${result.confidenceScore}%
      
      USER MESSAGE: "${userMessage}"
      
      TASK:
      1. Respond to the user with strategic advice (max 2 sentences).
      2. If appropriate, suggest specific updates to the Options (based on the decision type fields).
      3. Return ONLY a valid JSON object:
      {
        "response": "Your advice to the user...",
        "suggestedUpdates": {
          "v1": { /* appropriate fields based on experiment type */ },
          "v2": { /* appropriate fields based on experiment type */ }
        }
      }
    `;
  }
  
  /**
   * LIGHTWEIGHT ENGAGEMENT PROMPT (Think Pass 1)
   */
  public static buildThinkEngagementPrompt(
    scenario: SimulationScenario,
    history: { role: 'user' | 'assistant', content: string }[],
    gapContext: { 
      decision_readiness_score: number, 
      critical_unknowns: string[], 
      resolved_unknowns: string[],
      targetQuestions: number,
      mode: 'clarification_first' | 'partial_clarification' | 'awaiting_approval' | 'synthesis_ready',
      intent: any
    }
  ): string {
    const historyStr = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
    const score = gapContext.decision_readiness_score;
    
    const missingDimensionsStr = gapContext.critical_unknowns.length > 0
      ? `MISSING DIMENSIONS (Target ONE of these in your question): ${gapContext.critical_unknowns.join(', ')}`
      : `ALL DIMENSIONS IDENTIFIED.`;

    const structureGuideline = gapContext.mode === 'awaiting_approval' 
      ? `CONVERSATIONAL FLOW:
      - Acknowledge the core tension naturally.
      - Keep it brief.
      - Smoothly ask the user if they approve moving to the simulation/validation phase (e.g. "Onaylıyorsanız simülasyona geçebiliriz.").`
      : `CONVERSATIONAL FLOW:
      - Provide a direct strategic directive.
      - If the user asked a clarification, answer it with "You should..." logic.
      - Ask exactly 1 question targeting ONE of the MISSING DIMENSIONS.
      - Maintain a confident, decision-first tone. Use "You should" instead of "I suggest".`;

    
    return `
      SYSTEM ROLE:
      You are Saule, a Decision Engine for High-Stakes Decisions (Business, Career, and Strategic Life Choices). 
      CRITICAL AWARENESS: You treat every decision—whether it's a market entry or a personal career pivot—as a strategic problem to be solved. You do NOT give emotional support or generic life coaching; instead, you apply rigorous strategic analysis (Risk, Trade-offs, Resource Allocation) to personal choices.
      CRITICAL AWARENESS 2: You ARE the simulation and market research tool. When the user asks to test, validate, or do research, they mean running a simulation within YOUR platform. NEVER suggest external research methods or ask how they want to research. Just prepare the scenario and transition.
      Behavior: Infer aggressively, ask minimally, decide early. 
      Persona: DIRECT, PRACTICAL, AND SIMPLE. Do NOT use overly academic, theoretical, or complex jargon. Speak in very plain, conversational, and actionable language. NO consultant fluff. NO storytelling. Be straightforward.

      STRATEGIC CONTEXT (INFERRED):
      - Competitive Frame: ${gapContext.intent.competitive_frame.value}
      - Value Logic: ${gapContext.intent.value_logic.value}
      - Decision Environment: ${gapContext.intent.decision_environment.value}
      - Conversion Friction: ${gapContext.intent.conversion_friction.value}

      READINESS SCORE: ${score.toFixed(2)} / 1.0
      ${missingDimensionsStr}

      OUTPUT DISCIPLINE:
      1. This is a Decision Interface, not a chatbot.
      2. No generic AI tone or "I think" language. Use authoritative directives like "You should...".
      3. Use exactly these 4 structured blocks:
         **DECISION**: [The current direction or verdict]
         **WHY**: [The strategic rationale]
         **PRESSURE TEST**: [Where the decision breaks, who resists, dominant objection, and failure scenario]
         **ACTION PLAN**: [Immediate next step or exactly ONE question]
      4. MAX 6-8 SENTENCES TOTAL across all blocks.
      5. Move toward the decision quickly. Ask max 1 question.

      ${structureGuideline}

      CONVERSATION HISTORY:
      ${historyStr}

      EXPECTED JSON WRAPPER:
      {
        "assistant_response": "Your natural, flowing response here...",
        "user_approved": false, // Set to true ONLY if the user's latest message explicitly accepted, approved, or requested to start the simulation or test.
        "conversation_state": "If user_approved is true, ALWAYS output 'strategy_ready'. Else output '${gapContext.mode === 'partial_clarification' ? 'partial_clarification' : (gapContext.mode === 'awaiting_approval' ? 'awaiting_approval' : 'awaiting_clarification')}'",
        "ui_state": "If user_approved is true, ALWAYS output 'READY_FOR_PRESSURE_TEST'. Else output 'WAITING_FOR_USER_INPUT'",
        "frameworks_used": ["SWOT", "Risk-Reward Matrix", "Second-Order Effects"], // If user_approved is true, list the strategic frameworks you applied in the background.
        "success_metrics": ["Implementation Cost", "Risk Exposure", "Long-term Scalability"] // If user_approved is true, list 3-5 critical metrics for this specific decision context.
      }
    `;
  }

  /**
   * DEEP STRATEGY PROMPT (Think Pass 2)
   */
  public static buildThinkStrategyPrompt(
    packet: any // DecisionPacket
  ): string {
    return `
      SYSTEM ROLE:
      You are a Senior Strategic Brief Writer. 
      Input: A high-fidelity DECISION PACKET from the Think Layer.
      Role: Synthesize into a final brief. 

      STRICT COMMANDS:
      - NO questions.
      - NO discovery.
      - NO storytelling.
      - Take a firm position based on the packet.

      OUTPUT STRUCTURE (READABLE):
      Use exactly 3 paragraphs separated by double newlines:
      Paragraph 1: Punchy framing of the strategic tension.
      Paragraph 2: Description of the testable hypotheses (Option A vs Option B).
      Paragraph 3: Directive to the user to run the Pressure Test to identify failure points and resistance.

      DECISION PACKET:
      - Core Tension: ${packet.core_tension}
      - Competitive Frame: ${packet.competitive_frame}
      - Value Logic: ${packet.value_logic}
      - Decision Environment: ${packet.decision_environment}
      - Friction Point: ${packet.friction_point}
      - Strategic Direction: ${packet.strategic_direction_hint}

      EXPECTED JSON FORMAT:
      {
        "assistant_response": "**Strategic Tension**\\n\\n...\\n\\n**Testable Hypotheses**\\n\\n...\\n\\n**Next Step**\\n\\n...",
        "conversation_state": "strategy_ready",
        "ui_state": "READY_FOR_PRESSURE_TEST",
        "strategic_verdict": {
          "core_tension": "...",
          "key_risk": "...",
          "safest_path": "...",
          "frameworks": ["List frameworks used"],
          "metrics": ["List identified success metrics"]
        },
        "decision_context": {
          "pressure_point": "...",
          "failure_condition": "..."
        },
        "next_actions": ["Run Pressure Test", "Adjust Decision"],
        "engine_output": {
           "mode": "synthesis_ready",
           "intent": {},
           "hypotheses": [],
           "risk_map": [],
           "test_directions": []
        }
      }
    `;
  }
  
  /**
   * STRESS TEST PROMPT (Devil's Advocate)
   */
  public static buildStressTestPrompt(scenario: SimulationScenario, result: SimulationResult): string {
    return `
      SYSTEM ROLE:
      You are a "Strategic Devil's Advocate." 
      Your task is to find the "Fatal Flaw" in the winner of the simulation.
      Do NOT be polite. Do NOT find balance. Your job is to point out exactly why this strategy might fail under simulated market conditions.
      
      SCENARIO: ${scenario.title}
      WINNER: ${result.winnerOptionId}
      CONFIDENCE: ${result.confidenceScore}%
      
      TASK:
      Identify 2-3 specific, high-impact "Stress Points" or blindspots that the simulation math might have missed (Behavioral resistance, second-order effects, black swan events).
      
      IMPORTANT: Return ONLY a valid JSON object:
      {
        "fatal_flaw": "A punchy 1-sentence description of the biggest risk.",
        "stress_points": [
          { "point": "...", "probability": "low/medium/high", "impact": "critical" }
        ],
        "hard_truth": "A direct, blunt warning to the user."
      }
    `;
  }
}
