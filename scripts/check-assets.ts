import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAssets() {
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      storageUrl: true,
      siteId: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log('\n📦 Current Assets in Database:\n');
  assets.forEach(asset => {
    console.log(`${asset.type}: ${asset.title}`);
    console.log(`   Site: ${asset.siteId}`);
    console.log(`   URL: ${asset.storageUrl.substring(0, 80)}...`);
    console.log('');
  });
  console.log(`Total: ${assets.length} assets\n`);
}

checkAssets()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
