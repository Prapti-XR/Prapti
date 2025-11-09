import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import Link from 'next/link';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Section - Clean & Minimalistic */}
                <section className="px-4 pt-24 pb-16 md:pt-32 md:pb-24 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-6 text-center md:space-y-8">
                            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl text-heritage-dark">
                                Discover Heritage,<br />Experience History
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600 md:text-xl">
                                Explore cultural landmarks through immersive AR/VR technology.
                                Journey through time and space from anywhere.
                            </p>
                            <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row md:gap-4">
                                <Link href="/map">
                                    <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Explore Map
                                    </Button>
                                </Link>
                                <Link href="/about">
                                    <Button variant="default" size="lg" className="w-full sm:w-auto">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-4 py-16 md:py-24 md:px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                            <Link href="/models" className="group">
                                <div className="p-6 transition-all duration-200 bg-white border border-gray-100 rounded-lg md:p-8 hover:border-heritage-primary hover:shadow-md">
                                    <div className="flex items-center justify-center w-12 h-12 mb-4 transition-colors rounded-lg bg-heritage-light group-hover:bg-heritage-primary/10">
                                        <svg className="w-6 h-6 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-heritage-dark">3D Models</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">Explore detailed 3D reconstructions of heritage sites</p>
                                </div>
                            </Link>
                            <Link href="/images" className="group">
                                <div className="p-6 transition-all duration-200 bg-white border border-gray-100 rounded-lg md:p-8 hover:border-heritage-primary hover:shadow-md">
                                    <div className="flex items-center justify-center w-12 h-12 mb-4 transition-colors rounded-lg bg-heritage-light group-hover:bg-heritage-primary/10">
                                        <svg className="w-6 h-6 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-heritage-dark">360° Images</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">Immerse yourself in panoramic views of historic places</p>
                                </div>
                            </Link>
                            <Link href="/map" className="group">
                                <div className="p-6 transition-all duration-200 bg-white border border-gray-100 rounded-lg md:p-8 hover:border-heritage-primary hover:shadow-md">
                                    <div className="flex items-center justify-center w-12 h-12 mb-4 transition-colors rounded-lg bg-heritage-light group-hover:bg-heritage-primary/10">
                                        <svg className="w-6 h-6 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-heritage-dark">Interactive Map</h3>
                                    <p className="text-sm leading-relaxed text-gray-600">Discover heritage sites around you</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
