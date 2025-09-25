import { connect, connection } from 'mongoose';
import slugify from 'slugify';

async function updateProductSlugs() {
  const mongoUri =
    'mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production';

  try {
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    if (!connection.db) {
      throw new Error('Database connection is undefined');
    }

    // Fetch all products
    const products = await connection.db
      .collection('products')
      .find()
      .toArray();

    for (const doc of products) {
      if (!doc.slug) {
        const newSlug = slugify(doc.name, { lower: true, strict: true });
        await connection.db
          .collection('products')
          .updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
        console.log(`Updated product: ${doc.name} -> slug: ${newSlug}`);
      }
    }

    console.log('Product slug update completed.');
  } catch (error) {
    console.error('Error updating product slugs:', error);
    throw error;
  } finally {
    await connection.close();
    console.log('MongoDB connection closed');
  }
}

updateProductSlugs().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
