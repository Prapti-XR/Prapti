import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/contributions/[id]
 * Get a single contribution with full details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        site: true,
        assets: true,
        reviews: {
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
        },
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session) {
      const isAuthor = contribution.authorId === session.user.id;
      const isModerator = ['MODERATOR', 'ADMIN'].includes(session.user.role);
      
      if (!isAuthor && !isModerator) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to view this contribution' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error('Error fetching contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contribution' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contributions/[id]
 * Update a contribution (author can edit, moderator can change status)
 */
export async function PATCH(
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

    const contribution = await prisma.contribution.findUnique({
      where: { id },
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const isAuthor = contribution.authorId === session.user.id;
    const isModerator = ['MODERATOR', 'ADMIN'].includes(session.user.role);

    // Authors can only edit their own contributions in DRAFT or PENDING status
    if (isAuthor && !isModerator) {
      if (!['DRAFT', 'PENDING'].includes(contribution.status)) {
        return NextResponse.json(
          { success: false, error: 'Cannot edit contribution that is already under review or merged' },
          { status: 403 }
        );
      }

      // Authors can only update certain fields
      const updated = await prisma.contribution.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.contributionData && { contributionData: body.contributionData }),
          ...(body.status === 'DRAFT' || body.status === 'PENDING' ? { status: body.status } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    // Moderators can update status and approval fields
    if (isModerator) {
      const updateData: any = {
        ...(body.status && { status: body.status }),
      };

      // Handle approval
      if (body.status === 'APPROVED') {
        updateData.approvedBy = session.user.id;
        updateData.approvedAt = new Date();
      }

      // Handle rejection
      if (body.status === 'REJECTED') {
        updateData.rejectedBy = session.user.id;
        updateData.rejectedAt = new Date();
        if (body.rejectionReason) {
          updateData.rejectionReason = body.rejectionReason;
        }
      }

      // Handle merging
      if (body.status === 'MERGED') {
        updateData.mergedAt = new Date();
      }

      const updated = await prisma.contribution.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: 'You do not have permission to update this contribution' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contribution' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contributions/[id]
 * Delete a contribution (author can delete DRAFT, admin can delete any)
 */
export async function DELETE(
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

    const contribution = await prisma.contribution.findUnique({
      where: { id },
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const isAuthor = contribution.authorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    // Authors can only delete their own DRAFT contributions
    if (isAuthor && contribution.status === 'DRAFT') {
      await prisma.contribution.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: 'Contribution deleted successfully',
      });
    }

    // Admins can delete any contribution
    if (isAdmin) {
      await prisma.contribution.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: 'Contribution deleted successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'You can only delete draft contributions' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contribution' },
      { status: 500 }
    );
  }
}
