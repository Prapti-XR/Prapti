/**
 * Seed script for Prisma database
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample tags
  const architectureTag = await prisma.tag.upsert({
    where: { slug: 'architecture' },
    update: {},
    create: {
      name: 'Architecture',
      slug: 'architecture',
    },
  });

  const ancientTag = await prisma.tag.upsert({
    where: { slug: 'ancient' },
    update: {},
    create: {
      name: 'Ancient',
      slug: 'ancient',
    },
  });

  // Create sample heritage site
  const tajMahal = await prisma.heritageSite.upsert({
    where: { id: 'sample-taj-mahal' },
    update: {},
    create: {
      id: 'sample-taj-mahal',
      name: 'Taj Mahal',
      description: 'An iconic white marble mausoleum on the right bank of the river Yamuna in Agra, India.',
      location: 'Agra, Uttar Pradesh, India',
      latitude: 27.1751,
      longitude: 78.0421,
      country: 'India',
      city: 'Agra',
      era: 'Mughal',
      yearBuilt: 1653,
      culturalContext: 'Built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
      isPublished: true,
      isFeatured: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log({ architectureTag, ancientTag, tajMahal });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
