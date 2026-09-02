import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaShutdownHandlersRegistered: boolean | undefined;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // NOTE: deliberately NOT passing `datasources: { db: { url: process.env.DATABASE_URL } }`.
    // It was redundant — schema.prisma already declares `url = env("DATABASE_URL")` — but it
    // also turned a missing DATABASE_URL into a PrismaClientConstructorValidationError thrown
    // at *module import*. `next build` imports every route module during "Collecting page
    // data", so an unset DATABASE_URL failed the entire production build instead of only the
    // routes that actually query. Letting Prisma resolve the env var itself keeps construction
    // lazy: a missing or bad URL now surfaces as a runtime error on the request that needs it.
  });

  // Enhanced error handling with user-friendly messages
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error: any) {
      // Database connection errors
      if (error.code === 'P1001') {
        console.error('❌ DATABASE ERROR: Cannot reach database server');
        console.error('💡 Solution: Check if PostgreSQL is running and DATABASE_URL is correct');
        throw new Error('Database server is unreachable. Please check your database connection.');
      }
      
      if (error.code === 'P1002') {
        console.error('❌ DATABASE ERROR: Connection timeout');
        console.error('💡 Solution: Database is taking too long to respond. Check network or increase timeout.');
        throw new Error('Database connection timeout. The server might be slow or unreachable.');
      }

      if (error.code === 'P1008') {
        console.error('❌ DATABASE ERROR: Operations timed out');
        console.error('💡 Solution: Query is taking too long. Try optimizing the query or increase timeout.');
        throw new Error('Database operation timed out. Try again or contact support.');
      }

      if (error.code === 'P1017') {
        console.error('❌ DATABASE ERROR: Server has closed the connection');
        console.error('💡 Solution: Connection was lost. Restarting the server should fix this.');
        throw new Error('Database connection was closed. Please restart the application.');
      }

      // Connection pool errors
      if (error.message?.includes('Connection pool timeout') || error.message?.includes('pool exhausted')) {
        console.error('❌ DATABASE ERROR: Connection pool exhausted');
        console.error('💡 Solution: Too many database connections. Add connection pool parameters to DATABASE_URL:');
        console.error('   DATABASE_URL="...?connection_limit=10&pool_timeout=20&connect_timeout=10"');
        throw new Error('Too many database connections. Please contact support or try again later.');
      }

      // Generic connection errors
      if (error.message?.includes('Connection closed') || error.message?.includes('Closed')) {
        console.error('❌ DATABASE ERROR: Connection closed unexpectedly');
        console.error('💡 Solution: Database connection was lost. Restart the dev server: npm run dev');
        throw new Error('Database connection lost. Please restart the application.');
      }

      // Authentication errors
      if (error.code === 'P1011') {
        console.error('❌ DATABASE ERROR: Authentication failed');
        console.error('💡 Solution: Check DATABASE_URL username and password');
        throw new Error('Database authentication failed. Check your credentials.');
      }

      // Schema/migration errors
      if (error.code === 'P3006') {
        console.error('❌ DATABASE ERROR: Migration failed');
        console.error('💡 Solution: Run: npx prisma migrate dev');
        throw new Error('Database schema is out of sync. Run migrations.');
      }

      // Re-throw original error if not handled
      throw error;
    }
  });

  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle graceful shutdown with helpful messages
// Note: intentionally NOT listening for 'beforeExit' here - that event fires
// whenever Node's event loop goes idle (e.g. between requests in a long-running
// server), not just on real process termination. Disconnecting the shared
// Prisma client on every idle tick was tearing down the connection pool
// mid-flight and causing "Timed out fetching a new connection" errors under
// concurrent requests. SIGINT/SIGTERM only fire once, on an actual shutdown
// signal, so they're the correct place for this.
if (typeof window === 'undefined' && !globalForPrisma.prismaShutdownHandlersRegistered) {
  globalForPrisma.prismaShutdownHandlersRegistered = true;

  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    console.log('✅ Database connections closed');
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received termination signal...');
    await prisma.$disconnect();
    console.log('✅ Database connections closed');
    process.exit(0);
  });
  
  // Handle uncaught database errors
  process.on('unhandledRejection', (reason: any) => {
    if (reason?.code?.startsWith('P') || reason?.message?.includes('Prisma')) {
      console.error('❌ UNHANDLED DATABASE ERROR:', reason.message);
      console.error('💡 Tip: Check your DATABASE_URL and ensure PostgreSQL is running');
    }
  });
}
