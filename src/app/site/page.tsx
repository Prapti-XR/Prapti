'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search, SiteCard } from '@/components';

interface SiteCardData {
    id: string;
    name: string;
    location: string;
    description: string;
    thumbnail: string;
    category: string;
    yearBuilt: number | undefined;
    tags: string[];
    hasModel: boolean;
    hasPanorama: boolean;
    hasAR: boolean;
}

export default function SitesPage() {
    const [sites, setSites] = useState<SiteCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch sites from database
    useEffect(() => {
        async function fetchSites() {
            try {
                setLoading(true);
                const response = await fetch('/api/sites?limit=100');
                if (!response.ok) throw new Error('Failed to fetch sites');

                const result = await response.json();
                const dbSites = result.data || [];

                // Transform database sites to card format
                const transformedSites: SiteCardData[] = dbSites.map((site: any) => {
                    const thumbnail = site.assets?.find((a: any) => a.type === 'IMAGE')?.storageUrl || '/360-images/placeholder.jpg';
                    const hasModel = site.assets?.some((a: any) => a.type === 'MODEL_3D') || false;
                    const hasPanorama = site.assets?.some((a: any) => a.type === 'PANORAMA_360') || false;

                    // Extract tags from site tags relation
                    const tags = site.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [];

                    // Determine category from era or tags
                    let category = 'Monument';
                    if (tags.some((t: string) => t.toLowerCase().includes('fort'))) category = 'Fort';
                    else if (tags.some((t: string) => t.toLowerCase().includes('temple'))) category = 'Temple';

                    return {
                        id: site.id,
                        name: site.name,
                        location: site.location,
                        description: site.description,
                        thumbnail,
                        category,
                        yearBuilt: site.yearBuilt ?? undefined,
                        tags,
                        hasModel,
                        hasPanorama,
                        hasAR: hasModel,
                    };
                });

                setSites(transformedSites);
            } catch (err) {
                console.error('Error fetching sites:', err);
                setError(err instanceof Error ? err.message : 'Failed to load sites');
            } finally {
                setLoading(false);
            }
        }

        fetchSites();
    }, []);

    // Filter sites based on category and search query
    const filteredSites = sites.filter((site) => {
        const matchesCategory = filterCategory === 'all' || site.category.toLowerCase() === filterCategory.toLowerCase();
        const matchesSearch = searchQuery === '' ||
            site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="px-4 pt-24 pb-12 border-b border-gray-100 md:pt-32 md:pb-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark md:mb-6">
                                Heritage Sites
                            </h1>
                            <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                                Discover ancient temples, forts, and monuments. Explore their rich
                                history, architectural beauty, and cultural significance.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Search and Filters */}
                <section className="px-4 py-6 bg-white border-b border-gray-200 md:py-8 md:px-6">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search heritage sites..."
                            size="md"
                            containerClassName="max-w-2xl"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                        />
                        <div className="flex gap-2 pb-2 overflow-x-auto md:gap-3 scrollbar-hide">
                            <Button
                                size="sm"
                                variant={filterCategory === 'all' ? 'primary' : 'default'}
                                onClick={() => setFilterCategory('all')}
                            >
                                All Sites
                            </Button>
                            <Button
                                size="sm"
                                variant={filterCategory === 'temple' ? 'primary' : 'default'}
                                onClick={() => setFilterCategory('temple')}
                            >
                                Temples
                            </Button>
                            <Button
                                size="sm"
                                variant={filterCategory === 'fort' ? 'primary' : 'default'}
                                onClick={() => setFilterCategory('fort')}
                            >
                                Forts
                            </Button>
                            <Button
                                size="sm"
                                variant={filterCategory === 'monument' ? 'primary' : 'default'}
                                onClick={() => setFilterCategory('monument')}
                            >
                                Monuments
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Sites Grid */}
                <section className="px-4 py-12 md:py-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-heritage-primary"></div>
                                    <p className="text-gray-600">Loading heritage sites...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="max-w-md text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mb-2 font-medium text-gray-600">Failed to load sites</p>
                                    <p className="text-sm text-gray-500">{error}</p>
                                </div>
                            </div>
                        ) : filteredSites.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                                {filteredSites.map((site) => (
                                    <SiteCard
                                        key={site.id}
                                        id={site.id}
                                        name={site.name}
                                        location={site.location}
                                        description={site.description}
                                        thumbnail={site.thumbnail}
                                        category={site.category}
                                        yearBuilt={site.yearBuilt}
                                        tags={site.tags}
                                        hasModel={site.hasModel}
                                        hasPanorama={site.hasPanorama}
                                        hasAR={site.hasAR}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <svg
                                    className="w-16 h-16 mb-4 text-gray-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                                    No sites found
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                        )}
                    </div>
                </section>


            </main>
        </>
    );
}
