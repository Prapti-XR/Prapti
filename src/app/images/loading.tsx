import { Navbar } from '@/components/layout/Navbar';
import { SkeletonHeader, SkeletonImageCard, SkeletonGrid, Skeleton } from '@/components/ui/Skeleton';

export default function ImagesLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header Skeleton */}
                <SkeletonHeader />

                {/* Search and Filters Skeleton */}
                <section className="px-4 py-6 bg-white border-b border-gray-200 md:py-8 md:px-6">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Skeleton className="h-12 max-w-2xl" />
                        <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-28 rounded-full flex-shrink-0" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Images Grid Skeleton */}
                <section className="px-4 py-8 md:px-6 md:py-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-9 w-36 rounded-full" />
                        </div>

                        {/* Grid */}
                        <SkeletonGrid count={12} component={SkeletonImageCard} />

                        {/* Loading Indicator */}
                        <div className="flex justify-center mt-8">
                            <div className="text-center space-y-3">
                                <div className="w-12 h-12 mx-auto border-4 border-heritage-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-heritage-dark/60 text-sm">Loading 360° images...</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
