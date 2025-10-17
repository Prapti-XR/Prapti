import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function SiteInfoPage({ params }: { params: { id: string } }) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Image */}
                <div className="w-full h-64 md:h-96 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end">
                        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 pb-8">
                            <div className="inline-flex items-center gap-2 text-white/80 text-sm mb-2">
                                <Link href="/map" className="hover:text-white">Map</Link>
                                <span>/</span>
                                <span>Site Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <article className="px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="mb-12 border-b border-gray-100 pb-8">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-dark font-serif mb-6 tracking-tight">
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
                        <section className="prose prose-lg max-w-none mb-12">
                            <p className="text-gray-700 leading-relaxed text-lg mb-4">
                                This is a placeholder description for the heritage site. The actual content
                                will be dynamically loaded based on the site ID: <strong>{params.id}</strong>.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                quis nostrud exercitation ullamco laboris.
                            </p>
                        </section>

                        {/* Quick Actions */}
                        <section className="grid sm:grid-cols-3 gap-4 mb-12">
                            <ActionButton icon="📦" label="View 3D Model" />
                            <ActionButton icon="🖼️" label="360° Images" />
                            <ActionButton icon="🗺️" label="View on Map" />
                        </section>

                        {/* Details Grid */}
                        <section className="space-y-6 mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-heritage-dark font-serif">
                                Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <DetailItem label="Type" value="Monument" />
                                <DetailItem label="Period" value="16th Century" />
                                <DetailItem label="Architecture" value="Indo-Islamic" />
                                <DetailItem label="Status" value="UNESCO World Heritage" />
                            </div>
                        </section>

                        {/* Historical Significance */}
                        <section className="space-y-4 bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200">
                            <h3 className="text-xl font-semibold text-heritage-dark">
                                Historical Significance
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
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
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:border-heritage-primary transition-all duration-200 hover:shadow-md">
            <span className="text-3xl mb-2">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-gray-500 font-medium">{label}</div>
            <div className="text-lg text-heritage-dark">{value}</div>
        </div>
    );
}
