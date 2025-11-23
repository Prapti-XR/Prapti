import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getSiteIds() {
  const sites = await prisma.heritageSite.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  console.log('\n🏛️  Heritage Site IDs:\n');
  sites.forEach(site => {
    console.log(`${site.name}: ${site.id}`);
  });
  console.log('');
}

getSiteIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
