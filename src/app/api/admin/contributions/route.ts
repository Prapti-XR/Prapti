import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or moderator
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status && status !== 'ALL' ? { status: status as any } : {};

        const contributions = await prisma.contribution.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                site: {
                    select: {
                        name: true,
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
        console.error('Failed to fetch contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributions' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or moderator
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true, role: true },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();

        if (!data.contributionId || !data.status) {
            return NextResponse.json({ error: 'Missing contributionId or status' }, { status: 400 });
        }

        // Validate status
        const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MERGED', 'CLOSED'];
        if (!validStatuses.includes(data.status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = {
            status: data.status,
        };

        // Add approval/rejection tracking
        if (data.status === 'APPROVED') {
            updateData.approvedBy = user.id;
            updateData.approvedAt = new Date();
        } else if (data.status === 'REJECTED') {
            updateData.rejectedBy = user.id;
            updateData.rejectedAt = new Date();
            if (data.rejectionReason) {
                updateData.rejectionReason = data.rejectionReason;
            }
        } else if (data.status === 'MERGED') {
            updateData.mergedAt = new Date();
        }

        const updatedContribution = await prisma.contribution.update({
            where: { id: data.contributionId },
            data: updateData,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                site: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedContribution,
        });
    } catch (error) {
        console.error('Failed to update contribution:', error);
        return NextResponse.json(
            { error: 'Failed to update contribution' },
            { status: 500 }
        );
    }
}
