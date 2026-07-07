import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import { SauleCore } from './interface/api.js';
import { SpaceType, UnitCategory } from './interface/types.js';

const app = express();

// Enable CORS and JSON parsing middlewares
app.use(cors());
app.use(express.json());

// Initialize SML engine singleton with default DB path and DEK key
const DB_PATH = process.env.DB_PATH || './saule_sml.db'; // No longer used for path, but kept for interface compatibility
const DEK_KEY = process.env.DEK_KEY || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'; // default 256-bit key

console.log("[Saule SML Server] Initializing SauleCore Cloud Edition...");
const core = new SauleCore(DB_PATH, DEK_KEY);

// Warmup synchronously when the Cloud Function container spins up
core.warmup().catch(err => {
  console.error("[Saule SML Server] Failed to initialize backend:", err);
});

// Ingest Endpoint
app.post('/api/smi/ingest', async (req, res) => {
  try {
    const { content, category, type, spaceType, spaceId, provenance } = req.body;
    
    if (!content || !category || !provenance) {
      return res.status(400).json({ error: "Missing required fields: content, category, or provenance" });
    }

    // Map spaceId to provenance workspaceId if provided
    const prov = {
      ...provenance,
      workspaceId: spaceId || provenance.workspaceId,
      createdAt: provenance.createdAt || Date.now()
    };

    console.log(`[Saule SML Server] Ingesting node: "${content.substring(0, 40)}..." in space: ${spaceId || 'default'} (${spaceType || 'default'})`);
    const node = await core.ingest(content, category as UnitCategory, prov, type || 'fact', spaceType as SpaceType, spaceId);
    
    return res.json({ success: true, node });
  } catch (err: any) {
    console.error("[Saule SML Server] Ingestion error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Recall Endpoint
app.post('/api/smi/recall', async (req, res) => {
  try {
    const { query, spaceId, spaceType } = req.body;
    
    if (!query || !spaceId || !spaceType) {
      return res.status(400).json({ error: "Missing required fields: query, spaceId, or spaceType" });
    }

    console.log(`[Saule SML Server] Recalling context for query: "${query}" in partition: ${spaceId} (${spaceType})`);
    const compositionResult = await core.recall(query, spaceId, spaceType as SpaceType);
    
    return res.json({ success: true, composition: compositionResult });
  } catch (err: any) {
    console.error("[Saule SML Server] Recall error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Connect Endpoint
app.post('/api/smi/connect', async (req, res) => {
  try {
    const { sourceId, targetId, relationType, confidence, createdBy, reason } = req.body;
    
    if (!sourceId || !targetId || !relationType) {
      return res.status(400).json({ error: "Missing required fields: sourceId, targetId, or relationType" });
    }

    console.log(`[Saule SML Server] Connecting node: ${sourceId} --(${relationType})--> ${targetId}`);
    const edge = await core.connect(sourceId, targetId, relationType, confidence || 1.0, createdBy || 'system', reason);
    
    return res.json({ success: true, edge });
  } catch (err: any) {
    console.error("[Saule SML Server] Connect error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Clarity Endpoint
app.post('/api/smi/clarity', async (req, res) => {
  try {
    const { individualContext, collectiveContext } = req.body;
    
    if (!individualContext || !collectiveContext) {
      return res.status(400).json({ error: "Missing individualContext or collectiveContext fields" });
    }

    console.log(`[Saule SML Server] Evaluating Clarity Score... (Input: "${individualContext.substring(0, 40)}...")`);

    // Resolve vectors for individual and collective contexts
    const pipeline = (core as any).pipeline;
    const { embedding: vA } = await pipeline.process(individualContext);
    const { embedding: vB } = await pipeline.process(collectiveContext);

    if (vA.length === 0 || vB.length === 0) {
      return res.status(500).json({ error: "Failed to generate context embeddings for comparison." });
    }

    const clarityScore = core.evaluateClarity(vA, vB);
    return res.json({ 
      success: true, 
      clarityScore: Number((clarityScore * 100).toFixed(2)) // express as percentage (0-100)
    });
  } catch (err: any) {
    console.error("[Saule SML Server] Clarity evaluation error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Verified Solutions Endpoint
app.post('/api/smi/verified-solutions', async (req, res) => {
  try {
    const { nodes, edges, compositionPayload } = req.body;
    
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: "Missing context composition object inside request body." });
    }

    const solutions = await core.getVerifiedSolutions({ nodes, edges: edges || [], compositionPayload: compositionPayload || '' });
    return res.json({ success: true, solutions });
  } catch (err: any) {
    console.error("[Saule SML Server] Verified solutions matching error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Get All Nodes Endpoint
app.get('/api/smi/nodes', async (req, res) => {
  try {
    console.log(`[Saule SML Server] Fetching all memory nodes`);
    const nodes = await core.getAllNodes();
    return res.json({ success: true, nodes });
  } catch (err: any) {
    console.error("[Saule SML Server] Fetching nodes error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// Delete Node Endpoint
app.delete('/api/smi/nodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Saule SML Server] Deleting node: ${id}`);
    await core.deleteNode(id);
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[Saule SML Server] Deleting node error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// For local testing (if process.env.PORT is set)
if (process.env.NODE_ENV !== 'production' && process.env.PORT) {
  app.listen(process.env.PORT, () => {
    console.log(`[Saule SML Server] Running locally on http://localhost:${process.env.PORT}`);
  });
}

// Export as a Firebase Cloud Function
export const api = onRequest(app);
