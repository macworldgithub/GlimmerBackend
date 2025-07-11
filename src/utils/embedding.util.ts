import { Worker } from 'worker_threads';
import * as path from 'path';

export function getEmbedding(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    // ✅ Corrected to actual build location
    const workerPath = path.join(__dirname, 'embedding.worker.mjs');

    const worker = new Worker(workerPath, {
      workerData: { text },
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}


export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}


export function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 1); 
}
