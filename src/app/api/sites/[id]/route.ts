import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/sites/[id]
 * Fetch a single heritage site by ID with all related data
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await prisma.heritageSite.findUnique({
      where: { id },
      include: {
        assets: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
        },
        triviaQuestions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'Heritage site not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.heritageSite.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heritage site' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sites/[id]
 * Update a heritage site (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const site = await prisma.heritageSite.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.location && { location: body.location }),
        ...(body.latitude && { latitude: parseFloat(body.latitude) }),
        ...(body.longitude && { longitude: parseFloat(body.longitude) }),
        ...(body.country && { country: body.country }),
        ...(body.city && { city: body.city }),
        ...(body.era && { era: body.era }),
        ...(body.yearBuilt && { yearBuilt: parseInt(body.yearBuilt) }),
        ...(body.culturalContext && { culturalContext: body.culturalContext }),
        ...(body.historicalFacts && { historicalFacts: body.historicalFacts }),
        ...(body.visitingInfo && { visitingInfo: body.visitingInfo }),
        ...(body.accessibility && { accessibility: body.accessibility }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
    });

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update heritage site' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sites/[id]
 * Delete a heritage site (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.heritageSite.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Heritage site deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete heritage site' },
      { status: 500 }
    );
  }
}
