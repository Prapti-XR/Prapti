import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cache } from '@/lib/redis';

/**
 * Clear site cache (admin only)
 * DELETE /api/cache/sites
 */
export async function DELETE() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    if (!cache.isAvailable()) {
      return NextResponse.json(
        { 
          error: 'Redis cache not configured',
          message: 'Using in-memory cache - restart server to clear'
        },
        { status: 503 }
      );
    }

    // Clear all site-related cache keys
    const deletedCount = await cache.delPattern('sites:*');

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount} cache entries`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

/**
 * Get cache statistics (admin only)
 * GET /api/cache/sites
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const isAvailable = cache.isAvailable();

    return NextResponse.json({
      cacheEnabled: isAvailable,
      cacheType: isAvailable ? 'redis' : 'in-memory',
      message: isAvailable 
        ? 'Redis cache is active and synced across all servers'
        : 'Using in-memory cache (not synced across servers)',
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    );
  }
}
