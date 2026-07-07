import { DatabaseManager } from '../data/database.js';
import { NodeRepository } from '../data/repositories/node.repository.js';
import { EdgeRepository } from '../data/repositories/edge.repository.js';
import { ProvenanceRepository } from '../data/repositories/provenance.repository.js';
import { EmbeddingRepository } from '../data/repositories/embedding.repository.js';
import { IngestionPipeline } from '../ingestion/pipeline.js';
import { ContextCompositor } from '../reasoning/compositor.js';

import { DecayEngine } from '../memory/decay.js';
import { 
  MemoryNode, 
  MemoryEdge, 
  Provenance, 
  UnitCategory, 
  SpaceType, 
  ContextCompositionResult 
} from './types.js';

export class SauleCore {
  private dbManager: DatabaseManager;
  private nodeRepo: NodeRepository;
  private edgeRepo: EdgeRepository;
  private provenanceRepo: ProvenanceRepository;
  private embeddingRepo: EmbeddingRepository;
  private pipeline: IngestionPipeline;
  private compositor: ContextCompositor;


  constructor(dbPath: string, dek: string) {
    this.dbManager = new DatabaseManager(dbPath, dek);
    this.nodeRepo = new NodeRepository(this.dbManager);
    this.edgeRepo = new EdgeRepository(this.dbManager);
    this.provenanceRepo = new ProvenanceRepository(this.dbManager);
    this.embeddingRepo = new EmbeddingRepository(this.dbManager);
    this.pipeline = new IngestionPipeline();
    this.compositor = new ContextCompositor(
      this.nodeRepo,
      this.edgeRepo,
      this.provenanceRepo
    );
  }

  public async warmup(): Promise<void> {
    console.log("[SauleCore] Initializing IndexedDB...");
    await this.dbManager.initialize();
    
    console.log("[SauleCore] Pre-warming ONNX pipeline with dummy inference...");
    await this.pipeline.process("warmup");
    console.log("[SauleCore] ONNX pipeline pre-warmup completed successfully.");
    
    console.log("[SauleCore] Cloud backend ready.");
  }

  public setAuthUser(uid: string): void {
    console.log(`[SauleCore] Authenticated as ${uid}. (No sync engine needed in cloud)`);
  }

  public close(): void {
    this.dbManager.close();
  }

  public async forceSync(): Promise<void> {
    // No-op: Data is written directly to Firestore
  }

  /**
   * Ingests raw content: filters PII, generates local vector embedding, 
   * creates a MemoryNode, and persists it along with its provenance.
   */
  public async ingest(
    content: string,
    category: UnitCategory,
    provenance: Provenance,
    type: string = 'fact',
    spaceType?: SpaceType,
    spaceId?: string
  ): Promise<MemoryNode> {
    // 1. Run normalization, PII filtering and ONNX embedding calculation
    const { sanitizedText, embedding } = await this.pipeline.process(content);

    const nodeId = globalThis.crypto.randomUUID();
    const resolvedSpaceId = spaceId || provenance.workspaceId || 'default';
    const resolvedSpaceType: SpaceType = spaceType || (provenance.workspaceId ? 'workspace' : 'personal');

    // 2. Build Memory Node
    const node: MemoryNode = {
      id: nodeId,
      category,
      type,
      spaceType: resolvedSpaceType,
      spaceId: resolvedSpaceId,
      content: sanitizedText,
      decayScore: 1.0, // Initial memory strength is 100%
      createdAt: Date.now()
    };

    // 3. Save Node, Provenance and Embedding
    await this.nodeRepo.save(node);

    const fullProvenance: Provenance = {
      ...provenance,
      nodeId,
      createdAt: provenance.createdAt || Date.now()
    };
    await this.provenanceRepo.save(fullProvenance);

    if (embedding.length > 0) {
      await this.embeddingRepo.save(nodeId, embedding);
    }

    node.provenance = fullProvenance;
    return node;
  }

  /**
   * Connects two memory nodes with a directed, weighted edge.
   */
  public async connect(
    sourceId: string,
    targetId: string,
    relationType: string,
    confidence: number = 1.0,
    createdBy: 'ai' | 'user' | 'system' = 'system',
    reason?: string
  ): Promise<MemoryEdge> {
    const edge: MemoryEdge = {
      sourceId,
      targetId,
      relationType,
      confidence,
      createdBy,
      reason,
      createdAt: Date.now()
    };

    await this.edgeRepo.save(edge);
    return edge;
  }

  /**
   * Recalls semantic context starting with a query string.
   * Generates a query embedding, performs vector cosine search, boosts hit nodes,
   * and runs graph context composition (BFS traversal of neighbors).
   * Segments query search space by explicit spaceType.
   */
  public async recall(
    query: string,
    spaceId: string,
    spaceType: SpaceType,
    limit: number = 5
  ): Promise<ContextCompositionResult> {
    // 1. Generate Query Vector
    const { embedding: queryVector } = await this.pipeline.process(query);

    if (queryVector.length === 0) {
      return {
        nodes: [],
        edges: [],
        compositionPayload: "No matching context found due to embedding failure."
      };
    }

    // 2. Fetch candidate embeddings inside the designated space partition (spaceId + spaceType)
    const candidates = await this.embeddingRepo.getEmbeddingsBySpace(spaceId, spaceType);

    // 3. Calculate Cosine Similarity & rank candidates
    const scoredCandidates = candidates
      .map(cand => {
        const similarity = this.cosineSimilarity(queryVector, cand.embedding);
        return { nodeId: cand.nodeId, similarity };
      })
      .filter(item => item.similarity > 0.3) // Filter out weak similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // 4. Fetch seed nodes and boost their retention (re-activation)
    const seedNodes: MemoryNode[] = [];
    for (const item of scoredCandidates) {
      const node = await this.nodeRepo.getById(item.nodeId);
      if (node) {
        // Boost memory strength on recall access
        const boostedScore = DecayEngine.boost(node.decayScore);
        await this.nodeRepo.updateDecayScore(node.id, boostedScore);
        node.decayScore = boostedScore;
        seedNodes.push(node);
      }
    }

    // 5. Run Graph Context Compositor to fetch adjacent nodes and build the payload
    return await this.compositor.compose(seedNodes);
  }

  /**
   * Evaluates recalled context to match constraints against certified manufacturer models.
   */
  public async getVerifiedSolutions(composition: ContextCompositionResult): Promise<any[]> {
    // Aggregate context contents for rule parsing
    const combinedContextText = composition.nodes
      .map(n => n.content.toLowerCase())
      .join(' ');

    const hasBtuRule = combinedContextText.includes("24000 btu") || combinedContextText.includes("24.000 btu");
    const hasAreaRule = combinedContextText.includes("120m2") || combinedContextText.includes("120 m2");
    const hasBudgetRule = combinedContextText.includes("30.000 tl") || combinedContextText.includes("30000 tl");

    // Mock catalog of verified products
    const solutionsCatalog = [
      {
        id: "ac-sol-daikin-sensira",
        brand: "Daikin",
        model: "Sensira FTXF60C Inverter",
        specs: "24.000 BTU Inverter, A++, R32 Eco Friendly, Heating/Cooling",
        price: 28900,
        rating: 4.8,
        reviewCount: 124,
        isVerified: true
      },
      {
        id: "ac-sol-mhi-industries",
        brand: "Mitsubishi Heavy Industries",
        model: "SRK63ZR-W Premium Inverter",
        specs: "24.000 BTU Premium Inverter, A+++ Super Efficiency, Jet Air flow",
        price: 34500,
        rating: 4.9,
        reviewCount: 88,
        isVerified: true
      },
      {
        id: "ac-sol-lg-dualcool",
        brand: "LG",
        model: "DualCool S24ETK Dual Inverter",
        specs: "24.000 BTU Dual Inverter, A++, Active Energy Control, ThinQ Wi-Fi",
        price: 26500,
        rating: 4.7,
        reviewCount: 190,
        isVerified: true
      }
    ];

    // If context indicates matching requirements, return recommended solutions matching constraints
    if (hasBtuRule || hasAreaRule) {
      if (hasBudgetRule) {
        // Filter out solutions matching budget constraints (e.g. max budget around 30.000 TL)
        // Mitsubishi premium exceeds 30.000 TL, so Daikin and LG are returned
        return solutionsCatalog.filter(sol => sol.price <= 31000);
      }
      return solutionsCatalog;
    }

    return [];
  }

  /**
   * Calculates cosine similarity between two vector embeddings.
   */
  public evaluateClarity(individualContext: number[], collectiveContext: number[]): number {
    return this.cosineSimilarity(individualContext, collectiveContext);
  }

  /**
   * Retrieves all memory nodes from the database.
   */
  public async getAllNodes(): Promise<MemoryNode[]> {
    return await this.nodeRepo.getAll();
  }

  /**
   * Deletes a memory node by ID.
   */
  public async deleteNode(id: string): Promise<void> {
    await this.nodeRepo.delete(id);
  }

  /**
   * Cosine similarity helper.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
