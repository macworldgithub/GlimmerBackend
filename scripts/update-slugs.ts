import { connect, connection, ConnectOptions } from 'mongoose';
import slugify from 'slugify';
import { ConfigService } from '@nestjs/config';

async function updateSlugs() {
  const configService = new ConfigService();

  // Load MongoDB URI from environment variable
  const mongoUri =
    'mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production';
  console.log(mongoUri);
  try {
    // Connect to MongoDB
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Ensure database connection is established
    if (!connection.db) {
      throw new Error('Database connection is undefined');
    }

    // Update ProductCategory collection
    const categories = await connection.db
      .collection('productcategories')
      .find()
      .toArray();
    for (const doc of categories) {
      if (!doc.slug) {
        const newSlug = slugify(doc.name, { lower: true, strict: true });
        await connection.db
          .collection('productcategories')
          .updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
        console.log(`Updated category: ${doc.name} -> slug: ${newSlug}`);
      }
    }

    // Update ProductSubCategory collection
    const subCategories = await connection.db
      .collection('productsubcategories')
      .find()
      .toArray();
    for (const doc of subCategories) {
      if (!doc.slug) {
        const newSlug = slugify(doc.name, { lower: true, strict: true });
        await connection.db
          .collection('productsubcategories')
          .updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
        console.log(`Updated sub-category: ${doc.name} -> slug: ${newSlug}`);
      }
    }

    // Update ProductItem collection
    const items = await connection.db
      .collection('productitems')
      .find()
      .toArray();
    for (const doc of items) {
      if (!doc.slug) {
        const newSlug = slugify(doc.name, { lower: true, strict: true });
        await connection.db
          .collection('productitems')
          .updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
        console.log(`Updated item: ${doc.name} -> slug: ${newSlug}`);
      }
    }

    console.log('Slug update completed.');
  } catch (error) {
    console.error('Error updating slugs:', error);
    throw error;
  } finally {
    await connection.close();
    console.log('MongoDB connection closed');
  }
}

updateSlugs().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
