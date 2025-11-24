import { Navbar } from '@/components/layout/Navbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Section Skeleton */}
                <section className="relative h-screen overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/30 to-heritage-primary/20 animate-pulse" />

                    <div className="relative z-30 flex items-center justify-center h-full px-4">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            <Skeleton className="h-16 w-3/4 mx-auto md:h-20" />
                            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
                            <Skeleton className="h-6 w-5/6 max-w-2xl mx-auto" />
                            <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
                                <Skeleton className="h-12 w-48 rounded-full mx-auto sm:mx-0" />
                                <Skeleton className="h-12 w-48 rounded-full mx-auto sm:mx-0" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
