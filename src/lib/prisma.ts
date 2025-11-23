import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pool configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize connection pooling for serverless
    // Neon uses pgBouncer (pooler) so we can keep connections longer
    __internal: {
      engine: {
        connectionTimeout: 10000, // 10 seconds
      },
    },
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
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    console.log('🔄 Closing database connections...');
    await prisma.$disconnect();
  });
  
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
