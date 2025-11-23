/**
 * Check Redis cache statistics and performance
 * Run with: npx tsx scripts/check-redis-stats.ts
 */

import { config } from 'dotenv';
import { cache } from '../src/lib/redis';
import { redis } from '../src/lib/redis';

config();

async function checkRedisStats() {
  console.log('📊 Redis Cache Statistics\n');
  console.log('='.repeat(60));
  
  // Check availability
  const isAvailable = cache.isAvailable();
  console.log(`\n🔌 Connection Status: ${isAvailable ? '✅ CONNECTED' : '❌ NOT CONFIGURED'}\n`);
  
  if (!isAvailable) {
    console.log('❌ Redis is not configured.');
    console.log('📖 Follow the setup guide: docs/scaling/REDIS_SETUP_GUIDE.md\n');
    return;
  }
  
  try {
    // Get database info
    if (redis) {
      console.log('📈 Database Information:\n');
      
      // Get all keys
      const allKeys = await redis.keys('*');
      console.log(`   Total Keys: ${allKeys.length}`);
      
      // Group by pattern
      const patterns: Record<string, number> = {};
      allKeys.forEach(key => {
        const prefix = key.split(':')[0];
        patterns[prefix] = (patterns[prefix] || 0) + 1;
      });
      
      console.log('\n   Keys by Pattern:');
      Object.entries(patterns).forEach(([pattern, count]) => {
        console.log(`   - ${pattern}:* → ${count} key(s)`);
      });
      
      // Sample cache keys
      if (allKeys.length > 0) {
        console.log('\n   Sample Cache Keys:');
        allKeys.slice(0, 10).forEach(key => {
          console.log(`   - ${key}`);
        });
        
        if (allKeys.length > 10) {
          console.log(`   ... and ${allKeys.length - 10} more`);
        }
      } else {
        console.log('\n   ℹ️  No cached data yet. Use the app to generate cache entries.');
      }
      
      // Test cache performance
      console.log('\n⚡ Performance Test:\n');
      
      const testKey = 'test:perf:' + Date.now();
      const testData = { message: 'Performance test', data: Array(100).fill('x') };
      
      // Write test
      const writeStart = Date.now();
      await cache.set(testKey, testData, 60);
      const writeTime = Date.now() - writeStart;
      console.log(`   Write: ${writeTime}ms`);
      
      // Read test
      const readStart = Date.now();
      await cache.get(testKey);
      const readTime = Date.now() - readStart;
      console.log(`   Read: ${readTime}ms`);
      
      // Delete test
      const delStart = Date.now();
      await cache.del(testKey);
      const delTime = Date.now() - delStart;
      console.log(`   Delete: ${delTime}ms`);
      
      // Performance assessment
      console.log('\n   Assessment:');
      if (readTime < 50) {
        console.log('   ✅ Excellent performance (<50ms)');
      } else if (readTime < 100) {
        console.log('   ⚠️  Good performance (50-100ms)');
      } else {
        console.log('   ⚠️  Slow performance (>100ms) - consider closer region');
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('\n✅ Redis is working correctly!\n');
      console.log('💡 Tips:');
      console.log('   - Monitor cache hit rate in Upstash dashboard');
      console.log('   - Clear cache: DELETE /api/cache/sites');
      console.log('   - Test cache: Load map multiple times\n');
      
    }
  } catch (error) {
    console.error('\n❌ Error checking Redis stats:', error);
    console.log('\n💡 Check your connection and credentials\n');
  }
}

checkRedisStats().catch(console.error);
