import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/contributions/[id]/review
 * Add a review to a contribution (moderators and admins only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only moderators and admins can review
    if (!['MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only moderators and admins can review contributions' },
        { status: 403 }
      );
    }

    const contribution = await prisma.contribution.findUnique({
      where: { id },
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution not found' },
        { status: 404 }
      );
    }

    // Can't review your own contribution
    if (contribution.authorId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot review your own contribution' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, comment } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Review status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'COMMENTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review status' },
        { status: 400 }
      );
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        contributionId_reviewerId: {
          contributionId: id,
          reviewerId: session.user.id,
        },
      },
      create: {
        contributionId: id,
        reviewerId: session.user.id,
        status,
        comment,
      },
      update: {
        status,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Update contribution status based on review
    let contributionStatus = contribution.status;
    if (status === 'APPROVED' && contribution.status === 'PENDING') {
      contributionStatus = 'APPROVED';
    } else if (status === 'REJECTED') {
      contributionStatus = 'REJECTED';
    } else if (status === 'CHANGES_REQUESTED') {
      contributionStatus = 'PENDING';
    }

    // Update contribution if status changed
    if (contributionStatus !== contribution.status) {
      await prisma.contribution.update({
        where: { id },
        data: {
          status: contributionStatus,
          ...(status === 'APPROVED' && {
            approvedBy: session.user.id,
            approvedAt: new Date(),
          }),
          ...(status === 'REJECTED' && {
            rejectedBy: session.user.id,
            rejectedAt: new Date(),
            rejectionReason: comment,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contributions/[id]/review
 * Get all reviews for a contribution
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { contributionId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
