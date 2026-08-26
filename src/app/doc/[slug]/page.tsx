import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

/**
 * Documentation detail pages — static, curated content for the four
 * cards on /doc. Grounded in the repo's architecture; update alongside it.
 */

interface DocSection {
    heading: string;
    body: string[];
    bullets?: string[];
}

interface DocPage {
    title: string;
    intro: string;
    sections: DocSection[];
}

const DOCS: Record<string, DocPage> = {
    architecture: {
        title: 'Architecture',
        intro: 'How Prapti is built — the stack and the decisions behind it.',
        sections: [
            {
                heading: 'The stack',
                body: [
                    'Prapti is a Next.js 14 App Router application. Server components fetch data from a Neon PostgreSQL database through Prisma and hand it to client components for interactivity.',
                ],
                bullets: [
                    'Rendering: React 18 + Next.js 14 (App Router, standalone output)',
                    '3D / XR: three.js with React Three Fiber, drei helpers, and @react-three/xr for WebXR sessions',
                    'Database: Neon PostgreSQL (serverless) via Prisma ORM',
                    'Media storage: Cloudflare R2 (S3-compatible) — models, panoramas, and photos',
                    'Maps: Google Maps Platform for the discovery map',
                    'Caching: optional Upstash Redis for hot API responses',
                ],
            },
            {
                heading: 'The immersive pipeline',
                body: [
                    'Every uploaded asset is optimized automatically before it reaches storage: 3D models are Draco-compressed with WebP textures, panoramas and photos are resized and recompressed. A 120 MB photogrammetry scan becomes a ~4 MB download without visible quality loss.',
                    'Viewers load client-side only (3D breaks under server rendering), preload assets while you read the page, and show real progress percentages.',
                ],
            },
            {
                heading: 'The XR view',
                body: [
                    'The signature Immersive Viewer places a site\'s 3D model at the center of its own 360° panorama — the model as the focal object, the real place as the world around it. On WebXR-capable devices you can enter VR; everywhere else you orbit with mouse or touch.',
                ],
            },
        ],
    },
    authentication: {
        title: 'Authentication',
        intro: 'How accounts, sign-in, and roles work.',
        sections: [
            {
                heading: 'Signing in',
                body: [
                    'Prapti supports two ways in: email + password, and Google sign-in (when configured by the deployment). Sessions are JSON Web Tokens — nothing sensitive is stored in your browser beyond the signed session cookie.',
                ],
            },
            {
                heading: 'Roles',
                body: ['Access is role-based, lowest to highest:'],
                bullets: [
                    'USER — browse everything, play trivia, save favorites',
                    'CONTRIBUTOR — suggest new places and edits through the contribution workflow',
                    'MODERATOR — review and merge contributions, manage uploads',
                    'ADMIN — everything, including creating sites directly and managing users',
                ],
            },
            {
                heading: 'Contributions are reviewed',
                body: [
                    'Anything a contributor submits goes through moderator review before it appears on the map — Prapti\'s content model works like pull requests: suggest, review, merge.',
                ],
            },
        ],
    },
    'getting-started': {
        title: 'Getting Started',
        intro: 'Five minutes to your first immersive heritage visit.',
        sections: [
            {
                heading: '1. Find a place',
                body: [
                    'Open the Heritage Map to browse geographically, or Site Details to browse as a list. Search understands heritage — try a dynasty ("Hoysala"), a deity ("Shiva"), or a place type ("fort").',
                ],
            },
            {
                heading: '2. Step inside',
                body: [
                    'On any site page: 3D Model orbits the reconstruction, 360° View puts you at the site, and VR Experience combines both — the model centered inside the panorama. On a phone, View in AR places the model in your room via the QR code.',
                ],
            },
            {
                heading: '3. Go deeper',
                body: [
                    'Every site carries its history with sources, cultural significance, visiting information, and nearby sites worth pairing with your trip. Test yourself with the site\'s Trivia.',
                ],
            },
            {
                heading: '4. Give back',
                body: [
                    'Know a culturally rich place the maps forgot? Use "Suggest a Place" (About menu) — moderators review every suggestion, and merged places credit their contributors.',
                ],
            },
        ],
    },
    schema: {
        title: 'Schema Documentation',
        intro: 'The data model behind the platform, in plain terms.',
        sections: [
            {
                heading: 'Core entities',
                body: [],
                bullets: [
                    'HeritageSite — the place: location, coordinates, era, history (with sources), visiting info, publication and Hidden Gem flags',
                    'Asset — media attached to a site: 3D models (GLB), 360°/180° panoramas, photos, thumbnails; each with storage location, size, attribution, and an approval status',
                    'TriviaQuestion / TriviaAnswer — site-scoped quiz content with difficulty levels',
                    'Tag / SiteTag — the heritage vocabulary: dynasties, deities, architectural styles, regions',
                    'User — accounts with the USER → CONTRIBUTOR → MODERATOR → ADMIN role ladder',
                    'Contribution / Review — the pull-request-style pipeline that lets the community grow the map safely',
                ],
            },
            {
                heading: 'Design notes',
                body: [
                    'Referential integrity is enforced by the ORM (Prisma relationMode) rather than database foreign keys, with deliberate indexes carrying query performance — notably the geographic bounding-box indexes behind the map.',
                    'Asset files live in object storage; the database stores their keys, public URLs, and metadata such as file size, dimensions, and polygon counts.',
                ],
            },
        ],
    },
};

export function generateStaticParams() {
    return Object.keys(DOCS).map((slug) => ({ slug }));
}

// Only the slugs above exist — anything else is a hard 404.
export const dynamicParams = false;

export default function DocDetailPage({ params }: { params: { slug: string } }) {
    const doc = DOCS[params.slug];
    if (!doc) notFound();

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-heritage-light/30 animate-fade-in">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 text-sm text-heritage-dark/60 mb-3">
                            <Link href="/doc" className="hover:text-heritage-secondary transition-colors">Documentation</Link>
                            <span>/</span>
                            <span>{doc.title}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-heritage-dark font-serif mb-3">{doc.title}</h1>
                        <p className="text-heritage-dark/70 text-lg">{doc.intro}</p>
                    </div>
                </header>

                <article className="px-4 md:px-6 py-10">
                    <div className="max-w-3xl mx-auto space-y-10">
                        {doc.sections.map((s) => (
                            <section key={s.heading} className="space-y-3">
                                <h2 className="font-serif text-2xl font-semibold text-heritage-dark">{s.heading}</h2>
                                {s.body.map((p, i) => (
                                    <p key={i} className="text-heritage-dark/80 leading-relaxed">{p}</p>
                                ))}
                                {s.bullets && (
                                    <ul className="space-y-2 pl-1">
                                        {s.bullets.map((b, i) => (
                                            <li key={i} className="flex gap-3 text-heritage-dark/80 leading-relaxed">
                                                <span className="text-heritage-primary mt-1" aria-hidden="true">✦</span>
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}

                        <div className="pt-6 border-t border-heritage-light/30">
                            <Link
                                href="/doc"
                                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-heritage-light/40 text-heritage-dark font-medium hover:bg-heritage-light/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                            >
                                ← All documentation
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    );
}
