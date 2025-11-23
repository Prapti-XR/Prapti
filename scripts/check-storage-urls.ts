/**
 * Check Storage URLs in Database
 * Identifies different storage URL patterns in the Asset table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStorageUrls() {
  try {
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        storageUrl: true,
        storageKey: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 Total assets in database: ${assets.length}\n`);

    // Group by base URL
    const urlPatterns: Record<string, number> = {};
    assets.forEach((asset) => {
      const baseUrl = asset.storageUrl.match(/https?:\/\/[^\/]+/)?.[0] || 'unknown';
      urlPatterns[baseUrl] = (urlPatterns[baseUrl] || 0) + 1;
    });

    console.log('🔗 Storage URL patterns:');
    Object.entries(urlPatterns).forEach(([url, count]) => {
      console.log(`   ${url}: ${count} asset(s)`);
    });

    // Show sample assets
    console.log('\n📦 Recent assets:');
    assets.slice(0, 10).forEach((asset) => {
      console.log(`\n   Title: ${asset.title}`);
      console.log(`   URL: ${asset.storageUrl}`);
      console.log(`   Created: ${asset.createdAt.toISOString()}`);
    });

    // Check for any inconsistencies
    const expectedBaseUrl = 'https://pub-0caee9cd177b44bb951912b9248f4216.r2.dev';
    const inconsistentAssets = assets.filter(
      (asset) => !asset.storageUrl.startsWith(expectedBaseUrl)
    );

    if (inconsistentAssets.length > 0) {
      console.log(`\n⚠️  Found ${inconsistentAssets.length} asset(s) with unexpected URLs:`);
      inconsistentAssets.forEach((asset) => {
        console.log(`   - ${asset.title}: ${asset.storageUrl}`);
      });
    } else {
      console.log(`\n✅ All assets use the expected base URL: ${expectedBaseUrl}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStorageUrls();
