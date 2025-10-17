import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen relative overflow-hidden">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="space-y-8 animate-slide-up">
                                <h1 className="text-6xl lg:text-7xl font-bold text-heritage-dark font-serif leading-tight">
                                    Let&apos;s Explore
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                                    Experience historical sites and cultural landmarks through immersive AR/VR technology.
                                    Discover heritage like never before.
                                </p>
                                <div className="flex gap-4">
                                    <Link
                                        href="/map"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-heritage-dark text-white rounded-full font-medium hover:bg-heritage-primary transition-all duration-200 hover:scale-105 hover:shadow-xl"
                                    >
                                        NAVIGATE
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur text-heritage-dark rounded-full font-medium hover:bg-white transition-all duration-200 border border-gray-200 hover:border-heritage-primary"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>

                            {/* Right Image Placeholder */}
                            <div className="relative lg:h-[600px] h-[400px] animate-fade-in">
                                <div className="absolute inset-0 bg-gradient-to-br from-heritage-primary/20 via-heritage-secondary/20 to-heritage-accent/20 rounded-3xl backdrop-blur-sm border border-gray-200/50 shadow-2xl overflow-hidden">
                                    {/* Decorative Elements */}
                                    <div className="absolute top-8 right-8 w-32 h-32 bg-heritage-primary/10 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-12 left-12 w-40 h-40 bg-heritage-secondary/10 rounded-full blur-3xl"></div>

                                    {/* Placeholder for Map/Image */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <div className="text-center p-8">
                                            <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <p className="text-sm">Interactive Heritage Map</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon="🎮"
                                title="Interactive Games"
                                description="Engage with heritage through trivia and immersive experiences"
                            />
                            <FeatureCard
                                icon="🗺️"
                                title="Explore Sites"
                                description="Navigate through historical locations with our interactive map"
                            />
                            <FeatureCard
                                icon="📱"
                                title="AR/VR Ready"
                                description="Experience monuments in augmented and virtual reality"
                            />
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="group p-8 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 hover:border-heritage-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-heritage-dark mb-2 font-serif">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
