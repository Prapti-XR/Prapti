import { Navbar } from '@/components/layout/Navbar';
import { SkeletonHeader, SkeletonCard, SkeletonGrid, Skeleton } from '@/components/ui/Skeleton';

export default function SitesLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header Skeleton */}
                <SkeletonHeader />

                {/* Featured Section Skeleton */}
                <section className="px-4 py-8 bg-gradient-to-br from-heritage-light/20 to-heritage-primary/10 md:px-6 md:py-12">
                    <div className="max-w-6xl mx-auto">
                        <Skeleton className="h-8 w-48 mb-6" />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="overflow-hidden rounded-lg border-2 border-heritage-primary/20 bg-white shadow-md">
                                    <Skeleton className="aspect-[4/3] w-full" />
                                    <div className="p-5 space-y-3">
                                        <Skeleton className="h-7 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-10 w-full rounded-full mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* All Sites Section Skeleton */}
                <section className="px-4 py-8 md:px-6 md:py-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Filters */}
                        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
                            ))}
                        </div>

                        <Skeleton className="h-8 w-40 mb-6" />

                        <SkeletonGrid count={12} component={SkeletonCard} />

                        {/* Loading Indicator */}
                        <div className="flex justify-center mt-8">
                            <div className="w-10 h-10 border-4 border-heritage-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
