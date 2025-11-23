/**
 * Database Health Check Utility
 * Provides easy-to-understand database connection status
 */

import { prisma } from './prisma';

export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
  details?: string;
  suggestions?: string[];
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    // Try a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      message: '✅ Database connection is working properly',
    };
  } catch (error: any) {
    console.error('Database health check failed:', error);

    // Connection refused or unreachable
    if (error.code === 'P1001' || error.message?.includes('ECONNREFUSED')) {
      return {
        status: 'unhealthy',
        message: '❌ Cannot connect to database server',
        details: 'The database server is not reachable',
        suggestions: [
          'Check if PostgreSQL is running',
          'Verify DATABASE_URL in .env file',
          'Ensure the database host and port are correct',
          'Check your network connection',
        ],
      };
    }

    // Timeout
    if (error.code === 'P1002' || error.message?.includes('timeout')) {
      return {
        status: 'unhealthy',
        message: '❌ Database connection timeout',
        details: 'The database server is not responding in time',
        suggestions: [
          'Database server might be overloaded',
          'Network connection might be slow',
          'Add timeout parameters to DATABASE_URL: ?connect_timeout=10',
          'Try again in a few moments',
        ],
      };
    }

    // Authentication failed
    if (error.code === 'P1011' || error.message?.includes('authentication failed')) {
      return {
        status: 'unhealthy',
        message: '❌ Database authentication failed',
        details: 'Username or password is incorrect',
        suggestions: [
          'Check DATABASE_URL credentials in .env file',
          'Ensure username and password are correct',
          'Verify the database user has proper permissions',
        ],
      };
    }

    // Connection pool exhausted
    if (error.message?.includes('pool') || error.message?.includes('Connection closed')) {
      return {
        status: 'unhealthy',
        message: '❌ Database connection pool exhausted',
        details: 'Too many connections or connections not being released',
        suggestions: [
          'Restart your development server: npm run dev',
          'Add connection pool parameters to DATABASE_URL:',
          '  ?connection_limit=10&pool_timeout=20&connect_timeout=10',
          'Check for connection leaks in your code',
        ],
      };
    }

    // Schema/migration issue
    if (error.code === 'P3006' || error.message?.includes('migration')) {
      return {
        status: 'unhealthy',
        message: '❌ Database schema is out of sync',
        details: 'Database needs migration',
        suggestions: [
          'Run: npx prisma migrate dev',
          'Or run: npx prisma db push (for development)',
          'Ensure all migrations are applied',
        ],
      };
    }

    // Generic error
    return {
      status: 'unhealthy',
      message: '❌ Database connection error',
      details: error.message || 'Unknown database error',
      suggestions: [
        'Check the error message above for details',
        'Verify DATABASE_URL in .env file',
        'Ensure PostgreSQL is running',
        'Try restarting the development server',
      ],
    };
  }
}

/**
 * Print database health status to console
 */
export async function printDatabaseHealth(): Promise<void> {
  console.log('\n🔍 Checking database connection...\n');
  
  const health = await checkDatabaseHealth();
  
  console.log(health.message);
  
  if (health.details) {
    console.log(`📝 Details: ${health.details}`);
  }
  
  if (health.suggestions && health.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    health.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  }
  
  console.log('');
}
