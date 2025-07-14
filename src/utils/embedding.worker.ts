import { parentPort, workerData } from 'worker_threads';

async function run() {
  try {
    const { text } = workerData;
    // Dynamic import for ESM package
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await embedder(text, {
      pooling: 'mean',
      normalize: true,
    });
    parentPort?.postMessage(Array.from(output.data));
  } catch (error) {
    parentPort?.postMessage({ error: "Error...." });
  }
}

run();