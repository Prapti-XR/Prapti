import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAssets() {
  console.log('🧹 Cleaning up duplicate assets...\n');

  // Delete assets with local paths (not R2 URLs)
  const result = await prisma.asset.deleteMany({
    where: {
      storageUrl: {
        startsWith: '/',
      },
    },
  });

  console.log(`✅ Deleted ${result.count} old assets with local paths\n`);

  // Show remaining assets
  const remaining = await prisma.asset.findMany({
    select: {
      title: true,
      type: true,
      storageUrl: true,
    },
  });

  console.log('📦 Remaining R2 Assets:\n');
  remaining.forEach(asset => {
    console.log(`${asset.type}: ${asset.title}`);
  });
  console.log(`\nTotal: ${remaining.length} assets with R2 URLs\n`);
}

cleanupAssets()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
