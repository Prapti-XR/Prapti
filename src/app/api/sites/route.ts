import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

/**
 * GET /api/sites
 * Fetch all heritage sites with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      isPublished: true,
    };

    if (country) where.country = country;
    if (city) where.city = city;
    if (featured) where.isFeatured = true;

    const sites = await prisma.heritageSite.findMany({
      where,
      include: {
        assets: {
          where: { isPublic: true },
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

    return NextResponse.json({
      success: true,
      data: serializeBigInt(sites),
      count: sites.length,
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heritage sites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sites
 * Create a new heritage site (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const site = await prisma.heritageSite.create({
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        country: body.country,
        city: body.city,
        era: body.era,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        culturalContext: body.culturalContext,
        historicalFacts: body.historicalFacts,
        visitingInfo: body.visitingInfo,
        accessibility: body.accessibility,
        isPublished: body.isPublished || false,
        isFeatured: body.isFeatured || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(site),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create heritage site' },
      { status: 500 }
    );
  }
}
