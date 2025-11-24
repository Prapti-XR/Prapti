import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.description || !data.location || 
            data.latitude === undefined || data.longitude === undefined || !data.country) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the heritage site
        const site = await prisma.heritageSite.create({
            data: {
                name: data.name,
                description: data.description,
                location: data.location,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                country: data.country,
                city: data.city || null,
                era: data.era || null,
                yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
                culturalContext: data.culturalContext || null,
                historicalFacts: data.historicalFacts || null,
                visitingInfo: data.visitingInfo || null,
                accessibility: data.accessibility || null,
                isPublished: data.isPublished || false,
                isFeatured: data.isFeatured || false,
            },
        });

        return NextResponse.json({
            success: true,
            data: site,
        });
    } catch (error) {
        console.error('Failed to create site:', error);
        return NextResponse.json(
            { error: 'Failed to create site' },
            { status: 500 }
        );
    }
}

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

        const sites = await prisma.heritageSite.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        assets: true,
                        triviaQuestions: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: sites,
        });
    } catch (error) {
        console.error('Failed to fetch sites:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sites' },
            { status: 500 }
        );
    }
}
