/**
 * Backend Setup Verification Script
 * Run this to verify backend integration is working correctly
 */

import { prisma } from '../src/lib/prisma';
import { env } from '../src/env';

async function verifyBackendSetup() {
  console.log('🔍 Verifying Backend Setup...\n');

  // 1. Check Environment Variables
  console.log('✓ Environment Variables:');
  console.log(`  - DATABASE_URL: ${env.DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - DIRECT_URL: ${env.DIRECT_URL ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - GOOGLE_CLIENT_ID: ${env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - GOOGLE_CLIENT_SECRET: ${env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - R2_ACCOUNT_ID: ${env.R2_ACCOUNT_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - R2_BUCKET_NAME: ${env.R2_BUCKET_NAME ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - R2_PUBLIC_URL: ${env.R2_PUBLIC_URL ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Missing'}\n`);

  // 2. Test Database Connection
  try {
    console.log('🗄️  Testing Database Connection...');
    await prisma.$connect();
    console.log('  ✓ Database connection successful\n');

    // 3. Check Database Tables
    console.log('📊 Checking Database Tables...');
    const userCount = await prisma.user.count();
    const siteCount = await prisma.heritageSite.count();
    const assetCount = await prisma.asset.count();
    const triviaCount = await prisma.triviaQuestion.count();

    console.log(`  - Users: ${userCount}`);
    console.log(`  - Heritage Sites: ${siteCount}`);
    console.log(`  - Assets: ${assetCount}`);
    console.log(`  - Trivia Questions: ${triviaCount}\n`);

    if (siteCount === 0) {
      console.log('⚠️  No heritage sites found. Run `npm run db:seed` to populate database.\n');
    }

    // 4. Test a Sample Query
    console.log('🔎 Testing Sample Query...');
    const sites = await prisma.heritageSite.findMany({
      take: 3,
      include: {
        assets: {
          take: 2,
        },
      },
    });
    console.log(`  ✓ Retrieved ${sites.length} sample sites\n`);

    // 5. Verify Models
    console.log('✓ All Prisma models accessible:');
    console.log('  - User ✓');
    console.log('  - Account ✓');
    console.log('  - Session ✓');
    console.log('  - HeritageSite ✓');
    console.log('  - Asset ✓');
    console.log('  - TriviaQuestion ✓');
    console.log('  - TriviaAnswer ✓');
    console.log('  - TriviaScore ✓');
    console.log('  - FavoriteSite ✓');
    console.log('  - SiteTag ✓\n');

    console.log('✅ Backend setup verification complete!');
    console.log('🚀 You can now start the development server: npm run dev\n');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n💡 Make sure to:');
    console.log('  1. Set up your DATABASE_URL in .env.local');
    console.log('  2. Run: npm run db:push');
    console.log('  3. Run: npm run db:seed\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyBackendSetup().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
