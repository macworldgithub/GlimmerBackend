import { connect, connection, ObjectId } from 'mongoose';
import slugify from 'slugify';

async function updateSalonServiceSlugs() {
  const mongoUri =
    'mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production';

  try {
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    if (!connection.db) throw new Error('Database connection is undefined');

    const services = await connection.db
      .collection('salonservices')
      .find()
      .toArray();

    for (const service of services) {
      if (!service.slug) {
        if (!service.name) {
          console.log(`Skipping service without name: ${service._id}`);
          continue;
        }

        const newSlug = slugify(service.name, { lower: true, strict: true });

        await connection.db
          .collection('salonservices')
          .updateOne({ _id: service._id }, { $set: { slug: newSlug } });

        console.log(`Updated service: ${service.name} -> slug: ${newSlug}`);
      } else {
        console.log(`⏭️ Already has slug: ${service.name} (${service.slug})`);
      }
    }

    console.log('Salon service slug update completed.');
  } catch (error) {
    console.error('Error updating salon service slugs:', error);
  } finally {
    await connection.close();
    console.log('MongoDB connection closed');
  }
}

updateSalonServiceSlugs().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
