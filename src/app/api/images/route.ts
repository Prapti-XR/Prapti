import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { serializeBigInt } from '@/lib/utils';

// Cache TTL: 5 minutes for images list
const CACHE_TTL = 300;

/**
 * GET /api/images
 * Fetch all sites with 360° panoramas - optimized for images page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const site = searchParams.get('site');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate cache key based on filters
    const cacheKey = `images:list:country:${country || 'all'}:site:${site || 'all'}:limit:${limit}:offset:${offset}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        source: 'redis-cache'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      });
    }

    // Build where clause - only sites with panoramas
    const where: any = {
      isPublished: true,
      assets: {
        some: {
          type: { in: ['PANORAMA_360', 'PANORAMA_180'] },
          isPublic: true,
        },
      },
    };

    if (country) where.country = country;
    if (site) where.name = { contains: site, mode: 'insensitive' };

    const sites = await prisma.heritageSite.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        country: true,
        city: true,
        era: true,
        isFeatured: true,
        popularityScore: true,
        assets: {
          where: { 
            isPublic: true,
            type: { in: ['PANORAMA_360', 'PANORAMA_180', 'THUMBNAIL', 'IMAGE'] }
          },
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            storageUrl: true,
            mimeType: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            triviaQuestions: true,
            favoritedBy: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { popularityScore: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    const response = {
      success: true,
      data: serializeBigInt(sites),
      count: sites.length,
      source: 'database'
    };

    // Cache the result (non-blocking)
    cache.set(cacheKey, response, CACHE_TTL).catch(err =>
      console.error('Failed to cache images list:', err)
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching panoramas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch panoramic images' },
      { status: 500 }
    );
  }
}
