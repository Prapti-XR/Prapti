import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { serializeBigInt } from '@/lib/utils';

// Cache TTL: 5 minutes for models list
const CACHE_TTL = 300;

/**
 * GET /api/models
 * Fetch all sites with 3D models - optimized for models page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const era = searchParams.get('era');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate cache key based on filters
    const cacheKey = `models:list:era:${era || 'all'}:tag:${tag || 'all'}:limit:${limit}:offset:${offset}`;
    
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

    // Build where clause - only sites with 3D models
    const where: any = {
      isPublished: true,
      assets: {
        some: {
          type: 'MODEL_3D',
          isPublic: true,
        },
      },
    };

    if (era) where.era = era;
    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

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
        yearBuilt: true,
        isFeatured: true,
        popularityScore: true,
        assets: {
          where: { 
            isPublic: true,
            type: { in: ['MODEL_3D', 'THUMBNAIL', 'IMAGE'] }
          },
          select: {
            id: true,
            type: true,
            title: true,
            storageUrl: true,
            mimeType: true,
          },
        },
        tags: {
          include: {
            tag: true,
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
      console.error('Failed to cache models list:', err)
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch 3D models' },
      { status: 500 }
    );
  }
}
