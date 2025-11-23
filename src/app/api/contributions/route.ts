import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/contributions
 * List all contributions (filtered by status and user role)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const authorId = searchParams.get('authorId');

    // Build where clause based on user role
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    
    // Regular users can only see their own contributions
    if (session) {
      if (session.user.role === 'USER' || session.user.role === 'CONTRIBUTOR') {
        where.authorId = session.user.id;
      } else if (authorId) {
        // Moderators and admins can filter by author
        where.authorId = authorId;
      }
    } else {
      // Non-authenticated users can't see any contributions
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const contributions = await prisma.contribution.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            assets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contributions
 * Create a new contribution (requires CONTRIBUTOR role or higher)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to contribute
    if (!['CONTRIBUTOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'You need CONTRIBUTOR role to submit contributions. Please request access from an admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, type, contributionData, siteId, newSiteData } = body;

    if (!title || !description || !type || !contributionData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, type, contributionData' },
        { status: 400 }
      );
    }

    // Validate contribution type
    const validTypes = ['NEW_SITE', 'EDIT_SITE', 'ADD_ASSET', 'ADD_TRIVIA', 'EDIT_TRIVIA', 'FIX_INFO'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contribution type' },
        { status: 400 }
      );
    }

    // If editing existing site, verify it exists
    if (type === 'EDIT_SITE' && siteId) {
      const siteExists = await prisma.heritageSite.findUnique({
        where: { id: siteId },
      });
      if (!siteExists) {
        return NextResponse.json(
          { success: false, error: 'Site not found' },
          { status: 404 }
        );
      }
    }

    const contribution = await prisma.contribution.create({
      data: {
        title,
        description,
        type,
        contributionData,
        siteId: siteId || null,
        newSiteData: newSiteData || null,
        authorId: session.user.id,
        status: 'PENDING', // Automatically set to pending for review
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: contribution,
      message: 'Contribution submitted successfully! It will be reviewed by moderators.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}
