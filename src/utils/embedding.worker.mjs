// src/workers/embedding.worker.mjs
import { parentPort, workerData } from 'worker_threads';

const { pipeline } = await import('@xenova/transformers');

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const output = await embedder(workerData.text, {
  pooling: 'mean',
  normalize: true,
});

parentPort.postMessage(Array.from(output.data));