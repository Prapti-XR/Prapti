import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-md text-center animate-fade-in">
                <p className="font-serif text-7xl font-bold text-heritage-primary mb-4" aria-hidden="true">
                    404
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-heritage-dark tracking-tight mb-3">
                    This page is lost to history
                </h1>
                <p className="text-heritage-dark/70 leading-relaxed mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has moved. The heritage
                    sites are still where you left them.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center h-11 px-6 md:h-12 rounded-full bg-heritage-primary text-heritage-dark font-semibold shadow-sm hover:shadow-md hover:bg-heritage-primary/90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                    >
                        Go home
                    </Link>
                    <Link
                        href="/site"
                        className="inline-flex items-center justify-center h-11 px-6 md:h-12 rounded-full bg-heritage-light text-heritage-dark font-medium shadow-sm hover:shadow-md hover:bg-heritage-light/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                    >
                        Browse sites
                    </Link>
                </div>
            </div>
        </main>
    );
}
