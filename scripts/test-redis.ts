#!/usr/bin/env tsx
/**
 * Test Redis Connection and Caching
 * Run: npx tsx scripts/test-redis.ts
 */

import { cache } from '../src/lib/redis';

async function testRedis() {
  console.log('🧪 Testing Redis Connection...\n');

  // Test 1: Check if Redis is available
  console.log('1️⃣  Checking Redis availability...');
  const isAvailable = cache.isAvailable();
  console.log(`   ${isAvailable ? '✅' : '❌'} Redis is ${isAvailable ? 'available' : 'not configured'}`);
  
  if (!isAvailable) {
    console.log('\n⚠️  Redis is not configured. Add these to your .env.local:');
    console.log('   UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"');
    console.log('   UPSTASH_REDIS_REST_TOKEN="your-redis-token"\n');
    console.log('   Get free Redis at: https://console.upstash.com/\n');
    return;
  }

  // Test 2: Set a value
  console.log('\n2️⃣  Testing cache SET...');
  const testKey = 'test:redis:connection';
  const testValue = { 
    message: 'Hello from Redis!', 
    timestamp: new Date().toISOString(),
    data: { nested: true, count: 42 }
  };
  
  const setResult = await cache.set(testKey, testValue, 60);
  console.log(`   ${setResult ? '✅' : '❌'} SET operation ${setResult ? 'successful' : 'failed'}`);

  // Test 3: Get the value
  console.log('\n3️⃣  Testing cache GET...');
  const getValue = await cache.get<typeof testValue>(testKey);
  if (getValue) {
    console.log('   ✅ GET operation successful');
    console.log('   📦 Retrieved:', JSON.stringify(getValue, null, 2));
    
    // Verify data integrity
    const dataMatch = getValue.message === testValue.message && 
                      getValue.data.count === testValue.data.count;
    console.log(`   ${dataMatch ? '✅' : '❌'} Data integrity ${dataMatch ? 'verified' : 'failed'}`);
  } else {
    console.log('   ❌ GET operation failed');
  }

  // Test 4: Delete the value
  console.log('\n4️⃣  Testing cache DELETE...');
  const delResult = await cache.del(testKey);
  console.log(`   ${delResult ? '✅' : '❌'} DELETE operation ${delResult ? 'successful' : 'failed'}`);

  // Test 5: Verify deletion
  console.log('\n5️⃣  Verifying deletion...');
  const afterDelete = await cache.get(testKey);
  const isDeleted = afterDelete === null;
  console.log(`   ${isDeleted ? '✅' : '❌'} Value ${isDeleted ? 'successfully deleted' : 'still exists'}`);

  // Test 6: Pattern deletion
  console.log('\n6️⃣  Testing pattern deletion...');
  await cache.set('test:pattern:1', { id: 1 }, 60);
  await cache.set('test:pattern:2', { id: 2 }, 60);
  await cache.set('test:pattern:3', { id: 3 }, 60);
  console.log('   📝 Created 3 test entries');
  
  const deletedCount = await cache.delPattern('test:pattern:*');
  console.log(`   ${deletedCount === 3 ? '✅' : '⚠️'} Deleted ${deletedCount} entries`);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Redis test completed successfully!');
  console.log('='.repeat(50) + '\n');
}

testRedis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  });
