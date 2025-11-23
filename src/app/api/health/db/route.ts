import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-health';

/**
 * Database Health Check Endpoint
 * GET /api/health/db
 * 
 * Returns easy-to-understand database connection status
 */
export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      message: '❌ Health check failed',
      details: error.message,
      suggestions: [
        'Database might be completely unavailable',
        'Check server logs for more details',
        'Verify DATABASE_URL configuration',
      ],
    }, { status: 503 });
  }
}
