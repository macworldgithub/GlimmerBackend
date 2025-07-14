export async function getEmbedding(text: string): Promise<number[]> {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(300).fill(0);
  
  words.forEach(word => {
    const hash = Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] += (hash * (i + 1)) % 1;
    }
  });

  const norm = Math.sqrt(embedding.reduce((sum, x) => sum + x * x, 0));
  return embedding.map(x => x / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export function normalize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/).filter(Boolean);
}