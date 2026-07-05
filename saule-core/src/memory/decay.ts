import { MemoryNode } from '../interface/types.js';

export class DecayEngine {
  // Default half-life of memories is 7 days in milliseconds
  public static DEFAULT_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Calculates the decayed score using Ebbinghaus exponential forgetting curve:
   * S = S0 * e^(-t / lambda)
   * 
   * @param initialScore The initial confidence/decay score (0.0 to 1.0)
   * @param elapsedMs Elapsed time in milliseconds
   * @param halfLifeMs Time duration for memory strength to halve
   */
  public static calculateDecay(
    initialScore: number,
    elapsedMs: number,
    halfLifeMs: number = this.DEFAULT_HALF_LIFE_MS
  ): number {
    if (elapsedMs <= 0) return initialScore;
    // Since S(halfLife) = 0.5 * S0 => e^(-halfLife / lambda) = 0.5 => lambda = halfLife / ln(2)
    const lambda = halfLifeMs / Math.LN2;
    const score = initialScore * Math.exp(-elapsedMs / lambda);
    // Round to 4 decimal places for clean storage
    return Math.max(0, Math.min(1, Math.round(score * 10000) / 10000));
  }

  /**
   * Decays a node's score relative to its creation timestamp and the current time.
   */
  public static decayNode(node: MemoryNode, currentTime: number = Date.now(), halfLifeMs?: number): number {
    const elapsed = currentTime - node.createdAt;
    return this.calculateDecay(node.decayScore, elapsed, halfLifeMs);
  }

  /**
   * Re-activates a memory upon query hit, boosting its retention.
   * 
   * @param currentScore Decayed score of the memory
   * @param boostAmount Activation boost value (defaults to 0.15)
   */
  public static boost(currentScore: number, boostAmount: number = 0.15): number {
    return Math.max(0, Math.min(1, Math.round((currentScore + boostAmount) * 10000) / 10000));
  }
}
