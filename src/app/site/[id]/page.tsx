import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import Link from 'next/link';

export default function SiteInfoPage({ params }: { params: { id: string } }) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Image */}
                <div className="relative w-full h-64 bg-gray-200 md:h-96">
                    <div className="absolute inset-0 flex items-end bg-gradient-to-b from-transparent to-black/50">
                        <div className="w-full max-w-6xl px-4 pb-8 mx-auto md:px-6">
                            <div className="inline-flex items-center gap-2 mb-2 text-sm text-white/80">
                                <Link href="/map" className="hover:text-white">Map</Link>
                                <span>/</span>
                                <span>Site Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <article className="px-4 py-12 md:px-6 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="pb-8 mb-12 border-b border-gray-100">
                            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark">
                                Heritage Site Name
                            </h1>
                            <div className="flex flex-wrap gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Location, State</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Built in 16th Century</span>
                                </div>
                            </div>
                        </header>

                        {/* Description */}
                        <section className="mb-12 prose prose-lg max-w-none">
                            <p className="mb-4 text-lg leading-relaxed text-gray-700">
                                This is a placeholder description for the heritage site. The actual content
                                will be dynamically loaded based on the site ID: <strong>{params.id}</strong>.
                            </p>
                            <p className="leading-relaxed text-gray-700">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                quis nostrud exercitation ullamco laboris.
                            </p>
                        </section>

                        {/* Quick Actions */}
                        <section className="grid gap-4 mb-12 sm:grid-cols-3">
                            <ActionButton icon="📦" label="View 3D Model" />
                            <ActionButton icon="🖼️" label="360° Images" />
                            <ActionButton icon="🗺️" label="View on Map" />
                        </section>

                        {/* Details Grid */}
                        <section className="mb-12 space-y-6">
                            <h2 className="font-serif text-2xl font-semibold md:text-3xl text-heritage-dark">
                                Details
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <DetailItem label="Type" value="Monument" />
                                <DetailItem label="Period" value="16th Century" />
                                <DetailItem label="Architecture" value="Indo-Islamic" />
                                <DetailItem label="Status" value="UNESCO World Heritage" />
                            </div>
                        </section>

                        {/* Historical Significance */}
                        <section className="p-6 space-y-4 border border-gray-200 rounded-lg bg-gray-50 md:p-8">
                            <h3 className="text-xl font-semibold text-heritage-dark">
                                Historical Significance
                            </h3>
                            <p className="leading-relaxed text-gray-700">
                                Information about the historical importance and cultural significance
                                of this heritage site will be displayed here.
                            </p>
                        </section>
                    </div>
                </article>
            </main>
        </>
    );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
    return (
        <Button variant="default" size="lg" className="flex-col h-auto py-6">
            <span className="mb-2 text-3xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </Button>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">{label}</div>
            <div className="text-lg text-heritage-dark">{value}</div>
        </div>
    );
}
