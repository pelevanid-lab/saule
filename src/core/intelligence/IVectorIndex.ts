export interface IVectorIndex {
  getEmbedding(text: string): Promise<number[]>;
  similaritySearch(vector: number[], limit: number): Promise<{ id: string; similarity: number }[]>;
}
