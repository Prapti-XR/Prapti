import { Navbar } from '@/components/layout/Navbar';
import { SkeletonHeader, Skeleton } from '@/components/ui/Skeleton';

export default function AboutLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <SkeletonHeader />

                <section className="px-4 py-8 md:px-6 md:py-12">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Content Blocks */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
