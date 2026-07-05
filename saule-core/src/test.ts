import * as fs from 'fs';
import * as path from 'path';
import { SauleCore } from './interface/api.js';

async function runClarityEngineTest() {
  console.log("=====================================================");
  console.log("     RUNNING BEIWE CLARITY ENGINE INTEGRATION TEST   ");
  console.log("=====================================================");

  const testDbPath = path.join(process.cwd(), 'clarity_test.db');
  const testDek = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'; // 256-bit hex DEK

  // Clean up previous database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // 1. Initialize SauleCore SML Engine
  console.log("[SauleCore] Initializing SML Engine...");
  const core = new SauleCore(testDbPath, testDek);

  try {
    // 2. Ingest Individual Contexts
    console.log("\n[Ingestion] Ingesting User Individual Contexts...");

    const userProvenance = {
      source: 'beiwe-chat-interface',
      author: 'user_enes',
      workspaceId: 'workspace_home_ac',
      createdAt: Date.now()
    };

    const node1 = await core.ingest(
      "I am looking for an air conditioner for my 120m2 house in Istanbul.",
      'knowledge',
      userProvenance,
      'requirement'
    );
    console.log(`- Ingested Node 1: "${node1.content}" (ID: ${node1.id})`);

    const node2 = await core.ingest(
      "My budget is around 30.000 TL.",
      'knowledge',
      userProvenance,
      'constraint'
    );
    console.log(`- Ingested Node 2: "${node2.content}" (ID: ${node2.id})`);

    // Connect user requirements and constraints
    core.connect(
      node1.id,
      node2.id,
      'constrained_by',
      1.0,
      'system',
      "User budget constraint belongs to the same AC selection query."
    );
    console.log(`- Linked Node 1 --(constrained_by)--> Node 2`);

    // 3. Ingest Collective Recommendations / Rules
    console.log("\n[Ingestion] Ingesting Community Collective Recommendation...");

    const communityProvenance = {
      source: 'beiwe-community-db',
      author: 'community_expert',
      workspaceId: 'workspace_home_ac',
      createdAt: Date.now()
    };

    const node3 = await core.ingest(
      "For 120m2 houses, a 24000 BTU inverter air conditioner is strictly recommended by the community.",
      'resource',
      communityProvenance,
      'recommendation'
    );
    console.log(`- Ingested Node 3: "${node3.content}" (ID: ${node3.id})`);

    // Connect recommendation to the user's requirement
    core.connect(
      node3.id,
      node1.id,
      'recommends_solution_for',
      0.90,
      'ai',
      "Community consensus recommendation matches the 120m2 house requirement."
    );
    console.log(`- Linked Node 3 --(recommends_solution_for)--> Node 1`);

    // 4. Recall & Graph Context Composition
    console.log("\n[Query] Recalling context for: 'What is the best AC for my home?'...");
    const recallResult = await core.recall("What is the best AC for my home?", "workspace_home_ac", "workspace");

    console.log(`\n[Compositor] Recalled ${recallResult.nodes.length} nodes and traversed ${recallResult.edges.length} relationships.`);
    console.log("\n=== SUPER-NODE CONTEXT COMPOSITION PAYLOAD ===");
    console.log(recallResult.compositionPayload);
    console.log("==============================================");

    // 5. Evaluate Clarity Score
    console.log("\n[Evaluation] Running Clarity Score (Semantic Alignment Verification)...");
    
    // We fetch vector embeddings of both the combined individual context and the collective context
    const pipeline = (core as any).pipeline;
    
    // Combine individual contexts to get overall user context representation
    const combinedIndividualContext = `${node1.content} ${node2.content}`;
    const collectiveContext = node3.content;

    const { embedding: individualVector } = await pipeline.process(combinedIndividualContext);
    const { embedding: collectiveVector } = await pipeline.process(collectiveContext);

    if (individualVector.length > 0 && collectiveVector.length > 0) {
      const clarityScore = core.evaluateClarity(individualVector, collectiveVector);
      console.log(`- Combined Individual Context: "${combinedIndividualContext}"`);
      console.log(`- Collective Recommendation: "${collectiveContext}"`);
      console.log(`\n===> CALCULATED CLARITY SCORE (Semantic Similarity): ${(clarityScore * 100).toFixed(2)}%`);
    } else {
      console.error("- Failed to compute vector embeddings for Clarity Score evaluation.");
    }

    console.log("\n=====================================================");
    console.log("     INTEGRATION TEST COMPLETED SUCCESSFULLY         ");
    console.log("=====================================================");

  } catch (err) {
    console.error("\n[Error] Integration test execution failed:", err);
  } finally {
    // 6. Cleanup
    core.close();
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (e) {
        console.warn("[Cleanup] Warning: could not delete test db:", e);
      }
    }
  }
}

runClarityEngineTest();
