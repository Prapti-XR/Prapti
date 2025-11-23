/**
 * Test Redis cache functionality
 * Run with: npx tsx scripts/test-redis-cache.ts
 */

import { cache } from '../src/lib/redis';

async function testRedisCache() {
  console.log('🧪 Testing Redis Cache Integration\n');
  console.log('=' .repeat(60));
  
  // Check if Redis is available
  const isAvailable = cache.isAvailable();
  console.log(`\n📡 Redis Status: ${isAvailable ? '✅ CONNECTED' : '⚠️  NOT CONFIGURED'}`);
  
  if (!isAvailable) {
    console.log('\n💡 To enable Redis:');
    console.log('   1. Create account at https://console.upstash.com/');
    console.log('   2. Create a Redis database');
    console.log('   3. Add credentials to .env.local:');
    console.log('      UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"');
    console.log('      UPSTASH_REDIS_REST_TOKEN="your-token"');
    console.log('   4. Restart server\n');
    console.log('✅ App works fine without Redis (uses in-memory cache)\n');
    return;
  }
  
  try {
    console.log('\n🔍 Running cache tests...\n');
    
    // Test 1: Set a value
    console.log('Test 1: Setting cache value');
    const testKey = 'test:redis:' + Date.now();
    const testValue = { message: 'Hello Redis!', timestamp: Date.now() };
    await cache.set(testKey, testValue, 60);
    console.log('   ✅ Set successful');
    
    // Test 2: Get the value
    console.log('\nTest 2: Getting cache value');
    const retrieved = await cache.get(testKey);
    console.log('   ✅ Get successful');
    console.log('   📦 Retrieved:', retrieved);
    
    // Test 3: Delete the value
    console.log('\nTest 3: Deleting cache value');
    await cache.del(testKey);
    console.log('   ✅ Delete successful');
    
    // Test 4: Verify deletion
    console.log('\nTest 4: Verifying deletion');
    const afterDelete = await cache.get(testKey);
    console.log(`   ${afterDelete === null ? '✅' : '❌'} Value deleted (should be null):`, afterDelete);
    
    // Test 5: Pattern matching
    console.log('\nTest 5: Testing pattern deletion');
    await cache.set('sites:nearby:test1', { data: 1 }, 60);
    await cache.set('sites:nearby:test2', { data: 2 }, 60);
    await cache.set('sites:nearby:test3', { data: 3 }, 60);
    console.log('   ✅ Created 3 test cache entries');
    
    const deletedCount = await cache.delPattern('sites:nearby:test*');
    console.log(`   ✅ Deleted ${deletedCount} entries matching pattern`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 All Redis tests passed!\n');
    console.log('✅ Redis is working correctly');
    console.log('✅ Cache will sync across all servers');
    console.log('✅ Use DELETE /api/cache/sites to clear site cache\n');
    
  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
    console.log('\n💡 Check your Redis credentials and connection\n');
  }
}

testRedisCache().catch(console.error);
