// src/utils/embedding.worker.js
import { parentPort, workerData } from 'worker_threads';

async function run() {
  const { text } = workerData;
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });

  parentPort?.postMessage(Array.from(output.data));
}

run();
