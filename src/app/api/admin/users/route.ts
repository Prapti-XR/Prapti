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

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        contributions: true,
                        uploadedAssets: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
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

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true },
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const data = await request.json();

        if (!data.userId || !data.role) {
            return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
        }

        // Validate role
        if (!['USER', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'].includes(data.role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: data.userId },
            data: { role: data.role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
