'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled page error:', error);
    }, [error]);

    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-md text-center animate-fade-in">
                <p className="font-serif text-7xl font-bold text-heritage-primary mb-4" aria-hidden="true">
                    !
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-heritage-dark tracking-tight mb-3">
                    Something went wrong
                </h1>
                <p className="text-heritage-dark/70 leading-relaxed mb-8">
                    An unexpected error interrupted this page. Try again — if it keeps happening,
                    head back home and explore from there.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="primary" onClick={reset}>
                        Try again
                    </Button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center h-11 px-6 md:h-12 rounded-full bg-heritage-light text-heritage-dark font-medium shadow-sm hover:shadow-md hover:bg-heritage-light/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </main>
    );
}
