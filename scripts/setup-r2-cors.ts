/**
 * Setup CORS Configuration for Cloudflare R2 Bucket
 * This script configures CORS rules to allow browser access to R2 assets
 * 
 * Usage:
 *   npx tsx scripts/setup-r2-cors.ts
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * CORS Configuration for R2 Bucket
 * Allows all origins to access the assets for development
 * For production, you should restrict this to your domain
 */
const corsConfiguration = {
  CORSRules: [
    {
      // Allow all origins (for development)
      // For production, change to: AllowedOrigins: ['https://yourdomain.com']
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
      MaxAgeSeconds: 3600, // Cache preflight requests for 1 hour
    },
  ],
};

/**
 * Get current CORS configuration
 */
async function getCurrentCors() {
  try {
    const command = new GetBucketCorsCommand({
      Bucket: R2_BUCKET,
    });
    const response = await r2Client.send(command);
    return response.CORSRules;
  } catch (error: any) {
    if (error.name === 'NoSuchCORSConfiguration') {
      return null;
    }
    throw error;
  }
}

/**
 * Set CORS configuration
 */
async function setCors() {
  const command = new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: corsConfiguration,
  });
  await r2Client.send(command);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 R2 CORS Configuration Setup\n');

  // Check environment variables
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    console.error('❌ Missing R2 environment variables!');
    console.error('   Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
    process.exit(1);
  }

  console.log(`📦 Bucket: ${R2_BUCKET}`);
  console.log(`🌍 Account: ${process.env.R2_ACCOUNT_ID}\n`);

  try {
    // Get current CORS configuration
    console.log('📋 Checking current CORS configuration...');
    const currentCors = await getCurrentCors();

    if (currentCors) {
      console.log('✓ Found existing CORS configuration:');
      console.log(JSON.stringify(currentCors, null, 2));
      console.log('');
    } else {
      console.log('ℹ️  No CORS configuration found\n');
    }

    // Set new CORS configuration
    console.log('⚙️  Applying new CORS configuration...');
    await setCors();
    console.log('✅ CORS configuration applied successfully!\n');

    // Verify the configuration
    console.log('🔍 Verifying configuration...');
    const newCors = await getCurrentCors();
    console.log('✓ Current CORS configuration:');
    console.log(JSON.stringify(newCors, null, 2));
    console.log('');

    console.log('✨ Done! Your R2 bucket is now configured for browser access.\n');
    console.log('⚠️  Note: For production, update AllowedOrigins to your specific domain');
    console.log('   instead of using "*" (wildcard).\n');

  } catch (error) {
    console.error('❌ Error configuring CORS:', error);
    process.exit(1);
  }
}

// Execute
main().catch(console.error);
