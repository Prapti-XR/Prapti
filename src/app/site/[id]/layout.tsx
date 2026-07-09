import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * Server layout for site pages — provides per-site OpenGraph/Twitter share
 * cards while the page itself stays a client component.
 */
export async function generateMetadata({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> {
    try {
        const site = await prisma.heritageSite.findUnique({
            where: { id: params.id },
            select: {
                name: true,
                description: true,
                city: true,
                era: true,
                assets: {
                    where: { isPublic: true, type: { in: ['THUMBNAIL', 'IMAGE', 'PANORAMA_360'] } },
                    select: { storageUrl: true, type: true },
                    take: 5,
                },
            },
        });

        if (!site) return { title: 'Site not found — Prapti' };

        // Prefer a thumbnail/photo; fall back to the panorama
        const image =
            site.assets.find((a) => a.type === 'THUMBNAIL')?.storageUrl ??
            site.assets.find((a) => a.type === 'IMAGE')?.storageUrl ??
            site.assets.find((a) => a.type === 'PANORAMA_360')?.storageUrl;

        const title = `${site.name} — Prapti`;
        const description =
            site.description.length > 160 ? `${site.description.slice(0, 157)}...` : site.description;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                siteName: 'Prapti',
                ...(image ? { images: [{ url: image, alt: site.name }] } : {}),
            },
            twitter: {
                card: image ? 'summary_large_image' : 'summary',
                title,
                description,
                ...(image ? { images: [image] } : {}),
            },
        };
    } catch (error) {
        console.error('generateMetadata failed for site page:', error);
        return { title: 'Prapti - Heritage AR/VR Platform' };
    }
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return children;
}
