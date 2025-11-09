import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function DocsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 animate-slide-up">
                        <h1 className="text-5xl font-bold text-heritage-dark font-serif mb-4">
                            Documentation
                        </h1>
                        <p className="text-xl text-gray-600">
                            Learn more about Prapti and how to use the platform
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <DocCard
                            title="Architecture"
                            description="Understand the technical architecture and design decisions behind Prapti"
                            href="/docs/architecture"
                        />
                        <DocCard
                            title="Authentication"
                            description="Learn about authentication methods and OAuth integration"
                            href="/docs/authentication"
                        />
                        <DocCard
                            title="Getting Started"
                            description="Quick start guide to begin your journey with Prapti"
                            href="/docs/getting-started"
                        />
                        <DocCard
                            title="Schema Documentation"
                            description="Database schema and data structure documentation"
                            href="/docs/schema"
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

function DocCard({ title, description, href }: { title: string; description: string; href: string }) {
    return (
        <Link
            href={href}
            className="group block p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 hover:border-heritage-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-heritage-dark mb-2 font-serif group-hover:text-heritage-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
                <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-heritage-primary transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}
