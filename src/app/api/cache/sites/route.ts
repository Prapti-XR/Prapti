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

    // Clear all cache keys (sites, models, images)
    const patterns = ['sites:*', 'site:*', 'models:*', 'images:*'];
    let totalDeleted = 0;
    
    for (const pattern of patterns) {
      const count = await cache.delPattern(pattern);
      totalDeleted += count;
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${totalDeleted} cache entries across all patterns`,
      deletedCount: totalDeleted,
      patterns,
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
