// test-embedding.js
const path = require('path');

// Ensure we're loading from compiled code
const { getEmbedding } = require('./dist/src/utils/embedding.util');

async function main() {
  try {
    const text = 'This is a test sentence.';
    const embedding = await getEmbedding(text);

    console.log('Embedding vector (first 10 values):');
    console.log(embedding.slice(0, 10)); // show first 10 numbers

    console.log('\n✅ Embedding generated successfully. Vector length:', embedding.length);
  } catch (err) {
    console.error('❌ Failed to generate embedding:', err);
    process.exit(1);
  }
}

main();
