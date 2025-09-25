import { connect, connection } from 'mongoose';
import slugify from 'slugify';

async function updateSalonSlugs() {
  const mongoUri =
    'mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production';

  try {
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    if (!connection.db) {
      throw new Error('Database connection is undefined');
    }

    const salons = await connection.db.collection('salons').find().toArray();

    for (const salon of salons) {
      if (!salon.slug) {
        if (!salon.salon_name) {
          console.log(`Skipping salon without salon_name: ${salon._id}`);
          continue;
        }

        const newSlug = slugify(salon.salon_name, {
          lower: true,
          strict: true,
        });

        await connection.db
          .collection('salons')
          .updateOne({ _id: salon._id }, { $set: { slug: newSlug } });

        console.log(
          `Updated salon: ${salon.salon_name} -> slug: ${newSlug}`,
        );
      } else {
        console.log(`⏭️ Already has slug: ${salon.salon_name} (${salon.slug})`);
      }
    }

    console.log('Salon slug update completed.');
  } catch (error) {
    console.error('Error updating salon slugs:', error);
  } finally {
    await connection.close();
    console.log('MongoDB connection closed');
  }
}

updateSalonSlugs().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
