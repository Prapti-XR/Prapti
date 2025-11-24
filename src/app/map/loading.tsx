import { Navbar } from '@/components/layout/Navbar';
import { Skeleton, SkeletonHeader } from '@/components/ui/Skeleton';

export default function MapLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header Skeleton */}
                <SkeletonHeader />

                {/* Map Container Skeleton */}
                <section className="relative h-[calc(100vh-200px)] min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/20 to-heritage-primary/10 animate-pulse">
                        {/* Map Placeholder */}
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto border-4 border-heritage-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-heritage-dark/60 font-medium">Loading interactive map...</p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Controls Skeleton */}
                    <div className="absolute top-4 left-4 right-4 z-10 md:left-6 md:right-6">
                        <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <div className="flex gap-2 overflow-x-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Skeleton */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 md:left-6 md:right-6">
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <div className="flex items-center justify-between gap-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
