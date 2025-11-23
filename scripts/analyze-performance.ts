/**
 * Performance Analysis Script
 * Analyzes database and provides optimization recommendations
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function analyzePerformance() {
  console.log('🔍 Performance Analysis\n');
  console.log('='.repeat(60));
  
  try {
    // Count records
    const [siteCount, assetCount, triviaCount] = await Promise.all([
      prisma.heritageSite.count(),
      prisma.asset.count(),
      prisma.triviaQuestion.count(),
    ]);
    
    console.log('\n📊 Database Size:');
    console.log(`   Heritage Sites: ${siteCount}`);
    console.log(`   Assets: ${assetCount}`);
    console.log(`   Trivia Questions: ${triviaCount}`);
    
    // Check indexes
    console.log('\n📈 Query Performance Tips:');
    
    if (siteCount < 100) {
      console.log('   ✅ Small dataset - queries should be fast');
    } else if (siteCount < 1000) {
      console.log('   ⚠️  Medium dataset - ensure indexes are used');
    } else {
      console.log('   🔴 Large dataset - optimization critical');
    }
    
    // Sample query performance
    console.log('\n⏱️  Testing Query Performance:');
    
    const start1 = Date.now();
    await prisma.heritageSite.findMany({
      where: { isPublished: true },
      take: 10,
    });
    const time1 = Date.now() - start1;
    console.log(`   Simple query: ${time1}ms`);
    
    const start2 = Date.now();
    await prisma.heritageSite.findMany({
      where: {
        isPublished: true,
        latitude: { gte: 10, lte: 20 },
        longitude: { gte: 70, lte: 80 },
      },
      include: {
        assets: {
          where: { isPublic: true },
          take: 1,
        },
      },
      take: 50,
    });
    const time2 = Date.now() - start2;
    console.log(`   Map query (with assets): ${time2}ms`);
    
    // Recommendations
    console.log('\n💡 Optimization Recommendations:\n');
    
    if (time2 > 500) {
      console.log('   🔴 SLOW QUERIES DETECTED (>500ms)');
      console.log('   → Increase Redis cache TTL to 5 minutes');
      console.log('   → Add database connection pooling');
      console.log('   → Consider read replicas');
    } else if (time2 > 200) {
      console.log('   ⚠️  Moderate query speed (200-500ms)');
      console.log('   → Current Redis cache (60s) is helping');
      console.log('   → Consider increasing TTL to 2-3 minutes');
    } else {
      console.log('   ✅ Fast queries (<200ms)');
      console.log('   → Current setup is optimal');
      console.log('   → Redis cache provides excellent speedup');
    }
    
    console.log('\n🚀 Additional Speed Improvements:');
    console.log('   1. Enable Next.js output caching for static pages');
    console.log('   2. Use CDN for asset delivery (Cloudflare)');
    console.log('   3. Implement image optimization with Next/Image');
    console.log('   4. Add ISR (Incremental Static Regeneration) for site pages');
    console.log('   5. Enable HTTP/2 and compression on your server');
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Analysis complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzePerformance();
