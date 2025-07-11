import { parentPort, workerData } from 'worker_threads';

// Dynamically import the ESM module inside the worker
async function run() {
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const output = await embedder(workerData.text, {
    pooling: 'mean',
    normalize: true,
  });

  parentPort?.postMessage(Array.from(output.data));
}

run().catch((err) => {
  console.error('Embedding worker error:', err);
  process.exit(1);
});
