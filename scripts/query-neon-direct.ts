/**
 * Query Neon Database Directly
 * Uses both pooled and direct connections to verify data
 */

import { config } from 'dotenv';
import { Client } from 'pg';

// Load environment variables
config();

async function queryNeonDatabase() {
  console.log('🔍 Environment Check:');
  console.log(`   DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`   DIRECT_URL exists: ${!!process.env.DIRECT_URL}`);
  console.log('');
  // Test with pooled connection (DATABASE_URL)
  console.log('🔵 Querying via POOLED connection (DATABASE_URL)...\n');
  const pooledClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pooledClient.connect();
    
    const result = await pooledClient.query(`
      SELECT 
        id,
        title,
        "storageUrl",
        "storageKey",
        "createdAt"
      FROM "Asset"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log(`   Found ${result.rows.length} assets\n`);
    
    // Group by base URL
    const urlPatterns: Record<string, number> = {};
    result.rows.forEach((row) => {
      const baseUrl = row.storageUrl.match(/https?:\/\/[^\/]+/)?.[0] || 'unknown';
      urlPatterns[baseUrl] = (urlPatterns[baseUrl] || 0) + 1;
    });

    console.log('   Storage URL patterns:');
    Object.entries(urlPatterns).forEach(([url, count]) => {
      console.log(`   ${url}: ${count} asset(s)`);
    });

    console.log('\n   Sample assets:');
    result.rows.slice(0, 5).forEach((row) => {
      console.log(`   - ${row.title}`);
      console.log(`     URL: ${row.storageUrl}`);
      console.log(`     Key: ${row.storageKey}`);
      console.log(`     Created: ${row.createdAt}\n`);
    });

  } catch (error) {
    console.error('❌ Pooled connection error:', error);
  } finally {
    await pooledClient.end();
  }

  // Test with direct connection (DIRECT_URL)
  console.log('\n🟢 Querying via DIRECT connection (DIRECT_URL)...\n');
  const directClient = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await directClient.connect();
    
    const result = await directClient.query(`
      SELECT 
        id,
        title,
        "storageUrl",
        "storageKey",
        "createdAt"
      FROM "Asset"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log(`   Found ${result.rows.length} assets\n`);
    
    // Group by base URL
    const urlPatterns: Record<string, number> = {};
    result.rows.forEach((row) => {
      const baseUrl = row.storageUrl.match(/https?:\/\/[^\/]+/)?.[0] || 'unknown';
      urlPatterns[baseUrl] = (urlPatterns[baseUrl] || 0) + 1;
    });

    console.log('   Storage URL patterns:');
    Object.entries(urlPatterns).forEach(([url, count]) => {
      console.log(`   ${url}: ${count} asset(s)`);
    });

    console.log('\n   Sample assets:');
    result.rows.slice(0, 5).forEach((row) => {
      console.log(`   - ${row.title}`);
      console.log(`     URL: ${row.storageUrl}`);
      console.log(`     Key: ${row.storageKey}`);
      console.log(`     Created: ${row.createdAt}\n`);
    });

    // Check for any URL inconsistencies
    const allAssets = await directClient.query(`
      SELECT "storageUrl" FROM "Asset"
    `);
    
    const expectedBaseUrl = 'https://pub-0caee9cd177b44bb951912b9248f4216.r2.dev';
    const inconsistent = allAssets.rows.filter(
      (row) => !row.storageUrl.startsWith(expectedBaseUrl)
    );

    console.log('\n📊 Summary:');
    console.log(`   Total assets in database: ${allAssets.rows.length}`);
    console.log(`   Expected base URL: ${expectedBaseUrl}`);
    
    if (inconsistent.length > 0) {
      console.log(`   ⚠️  Assets with different URLs: ${inconsistent.length}`);
      console.log('\n   Inconsistent URLs:');
      inconsistent.forEach((row) => {
        console.log(`   - ${row.storageUrl}`);
      });
    } else {
      console.log(`   ✅ All assets use the expected base URL`);
    }

  } catch (error) {
    console.error('❌ Direct connection error:', error);
  } finally {
    await directClient.end();
  }
}

queryNeonDatabase();
