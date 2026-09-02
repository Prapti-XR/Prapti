import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AssetType } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { serializeBigInt } from '@/lib/utils';

/** Shape returned to the admin scale screen. Kept narrow on purpose: this
 * route exists to calibrate real-world scale, not to be a general asset API. */
const ADMIN_ASSET_SELECT = {
    id: true,
    title: true,
    type: true,
    storageUrl: true,
    realScaleFactor: true,
    site: { select: { id: true, name: true } },
} as const;

/** Both methods are ADMIN-only — deliberately stricter than the general
 * admin-panel convention that also admits MODERATOR. realScaleFactor is a
 * published presentation property: a wrong value misrepresents the physical
 * size of a heritage site to every visitor. */
async function requireAdmin(): Promise<NextResponse | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    return null;
}

export async function GET(request: NextRequest) {
    try {
        const denied = await requireAdmin();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as AssetType | null;

        const assets = await prisma.asset.findMany({
            where: type ? { type } : undefined,
            select: ADMIN_ASSET_SELECT,
            orderBy: { createdAt: 'desc' },
        });

        // Deliberately not cached: this screen must reflect a write immediately.
        return NextResponse.json({ success: true, data: serializeBigInt(assets) });
    } catch (error) {
        console.error('Failed to fetch admin assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const denied = await requireAdmin();
        if (denied) return denied;

        const data = await request.json();

        if (typeof data.assetId !== 'string' || data.assetId.length === 0) {
            return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });
        }

        // null is a valid, meaningful value: it clears the calibration back to
        // "unknown". Anything else must be a finite positive number — zero or
        // negative would collapse or mirror the model.
        const raw = data.realScaleFactor;
        let realScaleFactor: number | null;
        if (raw === null) {
            realScaleFactor = null;
        } else if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
            realScaleFactor = raw;
        } else {
            return NextResponse.json(
                { error: 'realScaleFactor must be a positive number, or null to clear it' },
                { status: 400 }
            );
        }

        const existing = await prisma.asset.findUnique({
            where: { id: data.assetId },
            select: { id: true },
        });
        if (!existing) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        const updated = await prisma.asset.update({
            where: { id: data.assetId },
            data: { realScaleFactor },
            select: ADMIN_ASSET_SELECT,
        });

        // Public list endpoints cache site/model payloads that embed assets, so a
        // stale entry would serve the old scale. `cache` is a no-op when Redis is
        // not configured, so this is safe either way.
        await cache.delPattern('models:list:*');
        await cache.delPattern('sites:*');

        return NextResponse.json({ success: true, data: serializeBigInt(updated) });
    } catch (error) {
        console.error('Failed to update asset scale:', error);
        return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }
}
