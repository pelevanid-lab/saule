export interface SimulationScenario {
  experimentType?: string;
  title?: string;
  description?: string;
}

export interface SimulationResult {
  optionResults: Array<{
    metrics: Record<string, number>;
    optionId: string;
  }>;
  winnerOptionId: string;
  confidenceScore: number;
}

export interface SegmentCluster {
  name: string;
  traits: string[];
  bias: string;
}

export interface StakeholderConfig {
  trendSensitivity?: number;
}

export interface MarketContext {
  country: string;
  category: string;
  competitorContext: string;
  economicSentiment: string;
}
