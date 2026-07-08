import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Only these HeritageSite fields may be written from contribution payloads.
const SITE_FIELD_WHITELIST = [
    'name', 'description', 'location', 'latitude', 'longitude', 'country', 'city',
    'era', 'yearBuilt', 'culturalContext', 'historicalFacts', 'visitingInfo', 'accessibility',
] as const;

function pickSiteFields(payload: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of SITE_FIELD_WHITELIST) {
        if (payload[key] !== undefined) out[key] = payload[key];
    }
    return out;
}

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Apply an APPROVED contribution's payload to the real content tables.
 * Runs inside a transaction; throws (rolling back) on anything malformed.
 * Returns the affected siteId.
 */
async function mergeContribution(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    contribution: {
        id: string;
        type: string;
        siteId: string | null;
        contributionData: unknown;
        newSiteData: unknown;
    }
): Promise<string> {
    const payload = ((contribution.newSiteData ?? contribution.contributionData) ?? {}) as Record<string, unknown>;

    switch (contribution.type) {
        case 'NEW_SITE': {
            const fields = pickSiteFields(payload);
            if (!fields.name || !fields.description || !fields.location || fields.latitude == null || fields.longitude == null || !fields.country) {
                throw new Error('Contribution payload is missing required site fields (name, description, location, latitude, longitude, country)');
            }
            const id = slugify(String(fields.name));
            await tx.heritageSite.upsert({
                where: { id },
                update: fields as never,
                create: { id, isPublished: false, ...(fields as object) } as never,
            });
            await tx.contribution.update({ where: { id: contribution.id }, data: { siteId: id } });
            return id;
        }
        case 'EDIT_SITE':
        case 'FIX_INFO': {
            if (!contribution.siteId) throw new Error('Contribution has no target site');
            const fields = pickSiteFields(payload);
            if (Object.keys(fields).length === 0) throw new Error('Contribution payload contains no editable site fields');
            await tx.heritageSite.update({ where: { id: contribution.siteId }, data: fields as never });
            return contribution.siteId;
        }
        case 'ADD_TRIVIA':
        case 'EDIT_TRIVIA': {
            if (!contribution.siteId) throw new Error('Contribution has no target site');
            const questions = (Array.isArray(payload.questions) ? payload.questions : [payload]) as Record<string, unknown>[];
            let created = 0;
            for (const q of questions) {
                const answers = Array.isArray(q.answers) ? (q.answers as Record<string, unknown>[]) : [];
                if (!q.question || !q.difficulty || !q.category || answers.length < 2) continue;
                await tx.triviaQuestion.create({
                    data: {
                        question: String(q.question),
                        difficulty: q.difficulty as never,
                        category: String(q.category),
                        siteId: contribution.siteId,
                        answers: {
                            create: answers.map((a) => ({
                                answerText: String(a.answerText ?? ''),
                                isCorrect: Boolean(a.isCorrect),
                                explanation: a.explanation ? String(a.explanation) : null,
                            })),
                        },
                    },
                });
                created++;
            }
            if (created === 0) throw new Error('Contribution payload contains no valid trivia questions');
            return contribution.siteId;
        }
        case 'ADD_ASSET': {
            if (!contribution.siteId) throw new Error('Contribution has no target site');
            // Assets uploaded during submission are already linked via contributionId —
            // merging makes them public/approved.
            const updated = await tx.asset.updateMany({
                where: { contributionId: contribution.id },
                data: { isPublic: true, status: 'APPROVED', approvedAt: new Date() },
            });
            if (updated.count === 0) throw new Error('Contribution has no uploaded assets to merge');
            return contribution.siteId;
        }
        default:
            throw new Error(`Merging is not implemented for contribution type ${contribution.type}`);
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

        // MERGED is a real merge: apply the payload to content tables and flip
        // the status in one transaction — partial failure rolls everything back.
        if (data.status === 'MERGED') {
            const contribution = await prisma.contribution.findUnique({
                where: { id: data.contributionId },
                select: { id: true, type: true, status: true, siteId: true, contributionData: true, newSiteData: true },
            });
            if (!contribution) {
                return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
            }
            if (contribution.status !== 'APPROVED') {
                return NextResponse.json(
                    { error: 'Only approved contributions can be merged' },
                    { status: 400 }
                );
            }

            try {
                const merged = await prisma.$transaction(async (tx) => {
                    await mergeContribution(tx, contribution);
                    return tx.contribution.update({
                        where: { id: contribution.id },
                        data: updateData,
                        include: {
                            author: { select: { name: true, email: true } },
                            site: { select: { name: true } },
                        },
                    });
                });
                return NextResponse.json({ success: true, data: merged });
            } catch (e) {
                console.error('Merge failed:', e);
                return NextResponse.json(
                    { error: e instanceof Error ? e.message : 'Merge failed' },
                    { status: 400 }
                );
            }
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
