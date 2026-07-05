import { MemoryNode, MemoryEdge, ContextCompositionResult } from '../interface/types.js';
import { NodeRepository } from '../data/repositories/node.repository.js';
import { EdgeRepository } from '../data/repositories/edge.repository.js';
import { ProvenanceRepository } from '../data/repositories/provenance.repository.js';
import { DecayEngine } from '../memory/decay.js';

export class ContextCompositor {
  private nodeRepo: NodeRepository;
  private edgeRepo: EdgeRepository;
  private provenanceRepo: ProvenanceRepository;

  constructor(
    nodeRepo: NodeRepository,
    edgeRepo: EdgeRepository,
    provenanceRepo: ProvenanceRepository
  ) {
    this.nodeRepo = nodeRepo;
    this.edgeRepo = edgeRepo;
    this.provenanceRepo = provenanceRepo;
  }

  /**
   * Builds a Super-Node context graph starting from a set of seed nodes.
   * Walks the edges, gathers connected nodes, filters decayed nodes, and builds an LLM prompt.
   * 
   * @param seedNodes The initial set of semantically relevant nodes.
   * @param maxHops Traverse distance (typically 1 for direct context expansion).
   * @param minConfidence Minimum edge confidence to follow.
   * @param decayThreshold Minimum node decay score to include (defaults to 0.05).
   */
  public compose(
    seedNodes: MemoryNode[],
    maxHops: number = 1,
    minConfidence: number = 0.3,
    decayThreshold: number = 0.05
  ): ContextCompositionResult {
    const visitedNodeIds = new Set<string>();
    const nodeMap = new Map<string, MemoryNode>();
    const edgeMap = new Map<string, MemoryEdge>();

    // 1. Load initial seed nodes
    for (const node of seedNodes) {
      const decayedScore = DecayEngine.decayNode(node);
      if (decayedScore >= decayThreshold) {
        node.decayScore = decayedScore; // Update to actual decayed score
        nodeMap.set(node.id, node);
        visitedNodeIds.add(node.id);
      }
    }

    // Queue of nodes to process: [nodeId, currentHop]
    const queue: [string, number][] = Array.from(visitedNodeIds).map(id => [id, 0]);

    // 2. BFS graph traversal up to maxHops
    while (queue.length > 0) {
      const [currId, currHop] = queue.shift()!;

      if (currHop >= maxHops) continue;

      // Get edges connected to current node
      const edges = this.edgeRepo.getConnectedEdges(currId);

      for (const edge of edges) {
        if (edge.confidence < minConfidence) continue;

        const targetId = edge.sourceId === currId ? edge.targetId : edge.sourceId;
        const edgeKey = `${edge.sourceId}-${edge.targetId}-${edge.relationType}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, edge);
        }

        // If target node hasn't been visited, load and evaluate it
        if (!visitedNodeIds.has(targetId)) {
          const targetNode = this.nodeRepo.getById(targetId);
          if (targetNode) {
            const decayedScore = DecayEngine.decayNode(targetNode);
            if (decayedScore >= decayThreshold) {
              targetNode.decayScore = decayedScore;
              nodeMap.set(targetId, targetNode);
              visitedNodeIds.add(targetId);
              queue.push([targetId, currHop + 1]);
            }
          }
        }
      }
    }

    const finalNodes = Array.from(nodeMap.values());
    const finalEdges = Array.from(edgeMap.values());

    // 3. Load provenance metadata for each node
    for (const node of finalNodes) {
      const provenance = this.provenanceRepo.getByNodeId(node.id);
      if (provenance) {
        node.provenance = provenance;
      }
    }

    // 4. Serialize the Graph into an LLM-ready Context Payload
    const compositionPayload = this.serializeGraph(finalNodes, finalEdges);

    return {
      nodes: finalNodes,
      edges: finalEdges,
      compositionPayload
    };
  }

  /**
   * Formats the semantic memory graph into structured text.
   */
  private serializeGraph(nodes: MemoryNode[], edges: MemoryEdge[]): string {
    if (nodes.length === 0) {
      return "No matching semantic memory nodes found.";
    }

    let result = "=== SEMANTIC MEMORY CONTEXT ===\n\n";

    result += "### MEMORY NODES:\n";
    nodes.forEach((node, index) => {
      result += `[Node #${index + 1}] ID: "${node.id}" | Category: ${node.category} | Type: ${node.type}\n`;
      result += `Memory Content: "${node.content}"\n`;
      result += `Retention Score (Decay): ${(node.decayScore * 100).toFixed(1)}%\n`;
      
      if (node.provenance) {
        const p = node.provenance;
        const provParts = [
          `Source: ${p.source}`,
          `Author: ${p.author}`
        ];
        if (p.url) provParts.push(`URL: ${p.url}`);
        if (p.windowTitle) provParts.push(`Window: ${p.windowTitle}`);
        if (p.filePath) provParts.push(`File: ${p.filePath}`);
        if (p.userAction) provParts.push(`UserAction: ${p.userAction}`);
        result += `Provenance context: [${provParts.join(', ')}]\n`;
      }
      result += "--------------------------------------------------\n";
    });

    if (edges.length > 0) {
      result += "\n### MEMORY RELATIONSHIPS (EDGES):\n";
      edges.forEach((edge, index) => {
        result += `[Relation #${index + 1}] "${edge.sourceId}" --(${edge.relationType}, confidence: ${(edge.confidence * 100).toFixed(0)}%)--> "${edge.targetId}"`;
        if (edge.reason) {
          result += ` | Reason: "${edge.reason}"`;
        }
        result += "\n";
      });
    }

    return result;
  }
}
