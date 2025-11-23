import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// Static data for development/testing (fallback if database is empty)
const STATIC_SITES = [
  {
    id: '1',
    name: 'Sonda Fort',
    description: 'An ancient hill fort located near Sonda on Yellapur Road, known for its historic ruins and scenic surroundings. Built during the Vijayanagara period, this fort stands as a testament to the architectural prowess of the Sonda Nayakas.',
    location: 'Yellapur Road, Sonda, Uttara Kannada, Karnataka',
    latitude: 14.737579275610653,
    longitude: 74.81412076747816,
    country: 'India',
    city: 'Sonda',
    era: 'Medieval',
    yearBuilt: 1500,
    culturalContext: 'Built by the Sonda Nayakas during the Vijayanagara Empire',
    historicalFacts: 'The fort was strategically positioned to control trade routes',
    visitingInfo: 'Open daily from 6 AM to 6 PM',
    accessibility: 'Moderate difficulty. Requires climbing steps.',
    isPublished: true,
    isFeatured: true,
    viewCount: 150,
    popularityScore: 85,
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [
      {
        id: '1-1',
        type: 'MODEL_3D',
        storageUrl: '/models/sonda_fort_complete_v1.glb',
        title: 'Sonda Fort - Complete 3D Model',
      },
      {
        id: '1-2',
        type: 'PANORAMA_360',
        storageUrl: '/360-images/sonda_fort_entrance_360.jpg',
        title: 'Sonda Fort - Main Entrance 360° View',
      },
      {
        id: '1-3',
        type: 'IMAGE',
        storageUrl: 'https://placehold.co/400x300/8B4513/FFF?text=Sonda+Fort',
        title: 'Sonda Fort Thumbnail',
      },
    ],
  },
  {
    id: '2',
    name: 'Sahasralinga',
    description: 'A unique pilgrimage site near Somasagara village on the Shalmala river with thousands of Shiva lingas carved on rocks. During the monsoon, the river flows over these carvings, creating a mesmerizing spiritual experience.',
    location: 'Yellapur Road, near Somasagara, Sirsi, Uttara Kannada, Karnataka',
    latitude: 14.720131543221346,
    longitude: 74.80755928939277,
    country: 'India',
    city: 'Sirsi',
    era: 'Ancient',
    yearBuilt: 900,
    culturalContext: 'A sacred site dedicated to Lord Shiva, featuring thousands of lingams carved on riverbed rocks',
    historicalFacts: 'The name literally means thousand lingas',
    visitingInfo: 'Best visited during monsoon season (June-September)',
    accessibility: 'Moderate accessibility. Involves walking on uneven riverbed rocks.',
    isPublished: true,
    isFeatured: true,
    viewCount: 200,
    popularityScore: 92,
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [
      {
        id: '2-1',
        type: 'MODEL_3D',
        storageUrl: '/models/sahasralinga_riverbed_v1.glb',
        title: 'Sahasralinga - Riverbed 3D Model',
      },
      {
        id: '2-2',
        type: 'PANORAMA_360',
        storageUrl: '/360-images/sahasralinga_monsoon_360.jpg',
        title: 'Sahasralinga - River View 360°',
      },
      {
        id: '2-3',
        type: 'IMAGE',
        storageUrl: 'https://placehold.co/400x300/CD853F/FFF?text=Sahasralinga',
        title: 'Sahasralinga Thumbnail',
      },
    ],
  },
  {
    id: '3',
    name: 'Somasagara Shiva Temple',
    description: 'A serene Shiva temple known for its peaceful setting near Sahasralinga, surrounded by dense forests and streams. This ancient temple showcases beautiful stone architecture and intricate carvings.',
    location: 'Somasagara, Sirsi, Uttara Kannada, Karnataka',
    latitude: 14.559437321516864,
    longitude: 74.80592353944104,
    country: 'India',
    city: 'Sirsi',
    era: 'Ancient',
    yearBuilt: 850,
    culturalContext: 'An important Shaivite temple nestled in the Western Ghats forests',
    historicalFacts: 'The temple features Hoysala-influenced architecture',
    visitingInfo: 'Temple timings: 6 AM - 12 PM and 4 PM - 8 PM',
    accessibility: 'Good accessibility with paved pathways. Wheelchair accessible main areas.',
    isPublished: true,
    isFeatured: false,
    viewCount: 120,
    popularityScore: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [
      {
        id: '3-1',
        type: 'PANORAMA_360',
        storageUrl: '/360-images/somasagara_temple_360.jpg',
        title: 'Somasagara Temple - Main Hall 360°',
      },
      {
        id: '3-2',
        type: 'IMAGE',
        storageUrl: 'https://placehold.co/400x300/D2691E/FFF?text=Somasagara+Temple',
        title: 'Somasagara Temple Thumbnail',
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

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

    // Fetch sites from database
    let sites = await prisma.heritageSite.findMany({
      where,
      include: {
        assets: {
          where: { isPublic: true },
          select: {
            id: true,
            type: true,
            storageUrl: true,
            title: true,
            mimeType: true,
          },
        },
        _count: {
          select: {
            triviaQuestions: true,
            favoritedBy: true,
          },
        },
      },
      take: 200,
    });

    // If database is empty, use static data as fallback
    if (sites.length === 0) {
      let staticSites = STATIC_SITES.filter((site) => {
        if (
          site.latitude < south ||
          site.latitude > north ||
          site.longitude < west ||
          site.longitude > east
        ) {
          return false;
        }
        if (era && site.era !== era) return false;
        if (country && site.country !== country) return false;
        if (hasAR || has3D) {
          const hasModel = site.assets.some((a) => a.type === 'MODEL_3D');
          if (!hasModel) return false;
        }
        if (hasPanorama) {
          const hasPano = site.assets.some((a) => a.type === 'PANORAMA_360');
          if (!hasPano) return false;
        }
        return true;
      });

      return NextResponse.json({ 
        sites: staticSites.slice(0, 100),
        source: 'static',
      });
    }

    // Calculate distances and filter by radius if user location provided
    if (userLat && userLon) {
      sites = sites
        .map((site) => ({
          ...site,
          distance: calculateDistance(userLat, userLon, site.latitude, site.longitude),
        }))
        .filter((site) => site.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    } else {
      // Sort by popularity if no user location
      sites = sites.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return NextResponse.json({
      sites: sites.slice(0, 100),
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching nearby sites:', error);
    
    // Fallback to static data on error
    let staticSites = STATIC_SITES.filter((site) => {
      if (
        site.latitude < south ||
        site.latitude > north ||
        site.longitude < west ||
        site.longitude > east
      ) {
        return false;
      }
      if (era && site.era !== era) return false;
      if (country && site.country !== country) return false;
      return true;
    });

    return NextResponse.json({
      sites: staticSites.slice(0, 100),
      source: 'static-fallback',
      error: 'Database error, using static data',
    });
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
