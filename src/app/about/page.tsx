import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-dark font-serif mb-6 md:mb-8 tracking-tight">
                            About Prapti
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                            Bridging the past and future through immersive technology
                        </p>
                    </div>
                </header>

                {/* Content */}
                <article className="px-4 md:px-6 pb-16 md:pb-24">
                    <div className="max-w-3xl mx-auto space-y-12">
                        {/* Mission */}
                        <section className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-semibold text-heritage-dark font-serif">
                                Our Mission
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    Prapti is dedicated to preserving and sharing cultural heritage through
                                    cutting-edge AR/VR technology. We believe that everyone should have access
                                    to explore and learn about historical sites, regardless of physical location
                                    or mobility constraints.
                                </p>
                            </div>
                        </section>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* What We Offer */}
                        <section className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-semibold text-heritage-dark font-serif">
                                What We Offer
                            </h2>
                            <div className="space-y-6">
                                <FeatureItem
                                    title="Immersive 3D Models"
                                    description="High-fidelity 3D reconstructions of heritage sites that you can explore from any angle."
                                />
                                <FeatureItem
                                    title="360° Panoramas"
                                    description="Step inside historical locations with our panoramic imagery and virtual tours."
                                />
                                <FeatureItem
                                    title="Interactive Learning"
                                    description="Engage with history through trivia, games, and educational content."
                                />
                                <FeatureItem
                                    title="Global Access"
                                    description="Visit world heritage sites from anywhere, making culture accessible to all."
                                />
                            </div>
                        </section>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Technology */}
                        <section className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-semibold text-heritage-dark font-serif">
                                Technology
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    Built with modern web technologies including Next.js, Three.js, and WebXR,
                                    Prapti delivers seamless experiences across devices. Our platform supports
                                    both augmented reality (AR) on mobile devices and virtual reality (VR)
                                    headsets for fully immersive exploration.
                                </p>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="pt-8">
                            <div className="bg-gray-50 rounded-lg p-8 md:p-10 border border-gray-200">
                                <h3 className="text-xl md:text-2xl font-semibold text-heritage-dark mb-4">
                                    Ready to explore?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Start your journey through heritage sites around the world.
                                </p>
                                <Link href="/map">
                                    <Button variant="primary" size="lg">
                                        Explore Now
                                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Button>
                                </Link>
                            </div>
                        </section>
                    </div>
                </article>
            </main>
        </>
    );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-2 h-2 bg-heritage-primary rounded-full mt-2"></div>
            <div>
                <h3 className="text-lg font-semibold text-heritage-dark mb-1">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
