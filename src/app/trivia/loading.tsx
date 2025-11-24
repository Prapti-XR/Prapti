import { Navbar } from '@/components/layout/Navbar';
import { SkeletonHeader, Skeleton } from '@/components/ui/Skeleton';

export default function TriviaLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <SkeletonHeader />

                <section className="px-4 py-8 md:px-6 md:py-12">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Quiz Card Skeleton */}
                        <div className="border-2 border-heritage-primary/20 rounded-lg p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>

                            <Skeleton className="h-8 w-full" />

                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>

                            <Skeleton className="h-12 w-full rounded-full" />
                        </div>

                        {/* Loading Indicator */}
                        <div className="flex justify-center pt-4">
                            <div className="text-center space-y-3">
                                <div className="w-10 h-10 mx-auto border-4 border-heritage-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-heritage-dark/60 text-sm">Loading trivia questions...</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
