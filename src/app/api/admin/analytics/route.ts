import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

        // Get counts
        const [
            totalSites,
            publishedSites,
            totalAssets,
            totalUsers,
            totalContributions,
            pendingContributions,
            assetsByType,
        ] = await Promise.all([
            prisma.heritageSite.count(),
            prisma.heritageSite.count({ where: { isPublished: true } }),
            prisma.asset.count(),
            prisma.user.count(),
            prisma.contribution.count(),
            prisma.contribution.count({ where: { status: 'PENDING' } }),
            prisma.asset.groupBy({
                by: ['type'],
                _count: {
                    type: true,
                },
            }),
        ]);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSites = await prisma.heritageSite.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _count: {
                id: true,
            },
        });

        const recentAssets = await prisma.asset.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _count: {
                id: true,
            },
        });

        // Process recent activity by date
        const activityMap = new Map<string, { sites: number; assets: number }>();
        
        recentSites.forEach((item) => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            if (!dateStr) return;
            if (!activityMap.has(dateStr)) {
                activityMap.set(dateStr, { sites: 0, assets: 0 });
            }
            const entry = activityMap.get(dateStr);
            if (entry) {
                entry.sites += item._count.id;
            }
        });

        recentAssets.forEach((item) => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            if (!dateStr) return;
            if (!activityMap.has(dateStr)) {
                activityMap.set(dateStr, { sites: 0, assets: 0 });
            }
            const entry = activityMap.get(dateStr);
            if (entry) {
                entry.assets += item._count.id;
            }
        });

        const recentActivity = Array.from(activityMap.entries())
            .map(([date, data]) => ({
                date,
                sites: data.sites,
                assets: data.assets,
            }))
            .sort((a, b) => b.date.localeCompare(a.date));

        const analytics = {
            totalSites,
            publishedSites,
            totalAssets,
            totalUsers,
            totalContributions,
            pendingContributions,
            assetsByType: assetsByType.map((item) => ({
                type: item.type,
                count: item._count.type,
            })),
            recentActivity,
        };

        return NextResponse.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
