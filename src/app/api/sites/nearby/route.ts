import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { serializeBigInt } from '@/lib/utils';

// Cache TTL in seconds
const CACHE_TTL = process.env.NODE_ENV === 'production' ? 60 : 10; // 60s prod, 10s dev

function getCacheKey(params: URLSearchParams): string {
  const keys = ['north', 'south', 'east', 'west', 'era', 'country', 'hasAR', 'has3D', 'hasPanorama'];
  return `sites:nearby:${keys.map(k => `${k}:${params.get(k)}`).join('|')}`;
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Check Redis cache first (exclude user location from cache key)
  const cacheKey = getCacheKey(searchParams);
  const cachedResult = await cache.get(cacheKey);
  if (cachedResult) {
    return NextResponse.json({ 
      ...cachedResult, 
      source: cache.isAvailable() ? 'redis-cache' : 'memory-cache' 
    });
  }

  // User location for distance calculation
  const userLat = parseFloat(searchParams.get('lat') || '0');
  const userLon = parseFloat(searchParams.get('lon') || '0');
  
  // Bounding box
  const north = parseFloat(searchParams.get('north') || '90');
  const south = parseFloat(searchParams.get('south') || '-90');
  const east = parseFloat(searchParams.get('east') || '180');
  const west = parseFloat(searchParams.get('west') || '-180');

  // Filters
  const era = searchParams.get('era');
  const country = searchParams.get('country');
  const hasAR = searchParams.get('hasAR') === 'true';
  const has3D = searchParams.get('has3D') === 'true';
  const hasPanorama = searchParams.get('hasPanorama') === 'true';
  const radius = parseFloat(searchParams.get('radius') || '50'); // km

  try {
    // Build where clause
    const where: any = {
      isPublished: true,
      latitude: { gte: south, lte: north },
      longitude: { gte: west, lte: east },
    };

    if (era) where.era = era;
    if (country) where.country = country;

    // Asset type filters
    if (hasAR || has3D) {
      where.assets = { some: { type: 'MODEL_3D', isPublic: true } };
    }
    if (hasPanorama) {
      where.assets = { some: { type: 'PANORAMA_360', isPublic: true } };
    }

    // Fetch sites from database with optimized query
    let sites = await prisma.heritageSite.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        latitude: true,
        longitude: true,
        country: true,
        city: true,
        era: true,
        yearBuilt: true,
        isFeatured: true,
        popularityScore: true,
        // Only load thumbnail assets for map markers (huge performance gain)
        assets: {
          where: { 
            isPublic: true,
            type: { in: ['THUMBNAIL', 'IMAGE'] } // Only thumbnails for map view
          },
          select: {
            id: true,
            type: true,
            storageUrl: true,
            title: true,
          },
          take: 1, // Only need one image for the marker
        },
      },
      take: 200,
      orderBy: userLat && userLon ? undefined : { popularityScore: 'desc' },
    });

    // Calculate distances and filter by radius if user location provided
    if (userLat && userLon) {
      sites = sites
        .map((site) => ({
          ...site,
          distance: calculateDistance(userLat, userLon, site.latitude, site.longitude),
        }))
        .filter((site) => site.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }
    // No need to sort here if no user location - already sorted by database

    const response = {
      sites: serializeBigInt(sites.slice(0, 100)),
      source: 'database',
      count: sites.length,
    };

    // Cache the result in Redis (non-blocking)
    cache.set(cacheKey, response, CACHE_TTL).catch(err => 
      console.error('Failed to cache result:', err)
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching nearby sites:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch nearby sites',
        sites: [],
      },
      { status: 500 }
    );
  }
}

/* 
// Original database implementation (commented out for now)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const north = parseFloat(searchParams.get('north') || '90');
  const south = parseFloat(searchParams.get('south') || '-90');
  const east = parseFloat(searchParams.get('east') || '180');
  const west = parseFloat(searchParams.get('west') || '-180');

  const era = searchParams.get('era');
  const country = searchParams.get('country');
  const hasAR = searchParams.get('hasAR') === 'true';
  const has3D = searchParams.get('has3D') === 'true';
  const hasPanorama = searchParams.get('hasPanorama') === 'true';

  try {
    const sites = await prisma.heritageSite.findMany({
      where: {
        latitude: { gte: south, lte: north },
        longitude: { gte: west, lte: east },
        ...(era && { era }),
        ...(country && { country }),
        ...(hasAR && {
          assets: {
            some: { type: 'MODEL_3D' },
          },
        }),
        ...(has3D && {
          assets: {
            some: { type: 'MODEL_3D' },
          },
        }),
        ...(hasPanorama && {
          assets: {
            some: { type: 'PANORAMA_360' },
          },
        }),
      },
      include: {
        assets: {
          select: {
            id: true,
            type: true,
            storageUrl: true,
            title: true,
          },
        },
      },
      take: 100, // Limit for performance
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}
*/
