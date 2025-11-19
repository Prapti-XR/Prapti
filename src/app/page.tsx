'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Parallax Hero Section - Extended */}
                <section className="relative h-[400vh] overflow-hidden">
                    {/* Background Layer - Behind (slowest) */}
                    <div 
                        className="fixed inset-0 z-0"
                        style={{
                            transform: `translateY(${scrollY * 0.2}px)`,
                            willChange: 'transform'
                        }}
                    >
                        <img
                            src="/pagesrc/background-behind.png"
                            alt="Background"
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Indian Map Layer */}
                    <div 
                        className="fixed inset-0 z-10"
                        style={{
                            transform: `translateY(${scrollY * 0.1}px)`,
                            opacity: scrollY < 2500 ? 0.3 :
                                     scrollY < 3000 ? 0.3 - ((scrollY - 2500) / 500) * 0.2 : 0.1,
                            willChange: 'transform, opacity'
                        }}
                    >
                        <img
                            src="/pagesrc/map.png"
                            alt="Indian Heritage Map"
                            className="object-contain w-full h-full"
                        />
                    </div>

                    {/* Foreground Background Layer */}
                    <div 
                        className="fixed inset-0 z-20"
                        style={{
                            transform: `translateY(${scrollY * 0.15}px)`,
                            willChange: 'transform'
                        }}
                    >
                        <img
                            src="/pagesrc/background-front.png"
                            alt="Foreground"
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Hero Text Content */}
                    <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
                        <div 
                            className="max-w-4xl mx-auto"
                            style={{
                                transform: `translateY(${scrollY * 0.3}px)`,
                                opacity: Math.max(0, 1 - scrollY / 400),
                                willChange: 'transform, opacity'
                            }}
                        >
                            <div className="space-y-6 text-center md:space-y-8">
                                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight drop-shadow-lg md:text-6xl lg:text-7xl text-heritage-dark">
                                    Discover Heritage,<br />Experience History
                                </h1>
                                <p className="max-w-2xl mx-auto text-lg leading-relaxed drop-shadow-md text-heritage-dark md:text-xl">
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
                    </div>

                    {/* Temple 1 - Diagonal entrance from left to bottom-left */}
                    <div 
                        className="fixed z-40"
                        style={{
                            // Scroll progress: 100-400px entrance, 400-800px stay, 800-1100px exit
                            left: scrollY < 100 ? '-50%' : 
                                  scrollY < 400 ? `${-50 + ((scrollY - 100) / 300) * 40}%` :
                                  scrollY < 800 ? '-10%' :
                                  scrollY < 1100 ? `${-10 - ((scrollY - 800) / 300) * 40}%` : '-50%',
                            bottom: scrollY < 100 ? '-50%' : 
                                    scrollY < 400 ? `${-50 + ((scrollY - 100) / 300) * 45}%` :
                                    scrollY < 800 ? '-5%' :
                                    scrollY < 1100 ? `${-5 - ((scrollY - 800) / 300) * 45}%` : '-50%',
                            opacity: 
                                scrollY < 100 ? 0 : 
                                scrollY < 300 ? (scrollY - 100) / 200 : 
                                scrollY < 800 ? 1 :
                                scrollY < 1100 ? 1 - (scrollY - 800) / 300 : 0,
                            willChange: 'left, bottom, opacity'
                        }}
                    >
                        <img
                            src="/pagesrc/temple-1.png"
                            alt="Heritage Temple 1"
                            className="object-contain w-auto h-[70vh] drop-shadow-2xl"
                            style={{
                                transform: 'scale(1)'
                            }}
                        />
                    </div>

                    {/* Temple 2 - Fade from bottom center, rise to final position, stay, then sink back */}
                    <div 
                        className="fixed z-40 left-1/2 -translate-x-1/2"
                        style={{
                            // Scroll progress: 1100-1400px fade in and rise, 1400-1800px stay, 1800-2100px sink back and fade out
                            bottom: scrollY < 1100 ? '-100%' :
                                    scrollY < 1400 ? `${-100 + ((scrollY - 1100) / 300) * 95}%` :
                                    scrollY < 1800 ? '-5%' :
                                    scrollY < 2100 ? `${-5 - ((scrollY - 1800) / 300) * 95}%` : '-100%',
                            opacity: 
                                scrollY < 1100 ? 0 : 
                                scrollY < 1300 ? (scrollY - 1100) / 200 : 
                                scrollY < 1800 ? 1 :
                                scrollY < 2100 ? 1 - ((scrollY - 1800) / 300) : 0,
                            willChange: 'bottom, opacity'
                        }}
                    >
                        <img
                            src="/pagesrc/temple-2.png"
                            alt="Heritage Temple 2"
                            className="object-contain w-auto h-[70vh] drop-shadow-2xl"
                        />
                    </div>

                    {/* Temple 3 - Diagonal entrance from right to bottom-right (opposite of Temple 1) */}
                    <div 
                        className="fixed z-40"
                        style={{
                            // Scroll progress: 2100-2400px entrance, 2400-2800px stay, 2800-3100px exit
                            right: scrollY < 2100 ? '-50%' : 
                                   scrollY < 2400 ? `${-50 + ((scrollY - 2100) / 300) * 40}%` :
                                   scrollY < 2800 ? '-10%' :
                                   scrollY < 3100 ? `${-10 - ((scrollY - 2800) / 300) * 40}%` : '-50%',
                            bottom: scrollY < 2100 ? '-50%' : 
                                    scrollY < 2400 ? `${-50 + ((scrollY - 2100) / 300) * 45}%` :
                                    scrollY < 2800 ? '-5%' :
                                    scrollY < 3100 ? `${-5 - ((scrollY - 2800) / 300) * 45}%` : '-50%',
                            opacity: 
                                scrollY < 2100 ? 0 : 
                                scrollY < 2300 ? (scrollY - 2100) / 200 : 
                                scrollY < 2800 ? 1 :
                                scrollY < 3100 ? 1 - (scrollY - 2800) / 300 : 0,
                            willChange: 'right, bottom, opacity'
                        }}
                    >
                        <img
                            src="/pagesrc/temple-3.png"
                            alt="Heritage Temple 3"
                            className="object-contain w-auto h-[70vh] drop-shadow-2xl"
                            style={{
                                transform: 'scale(1)'
                            }}
                        />
                    </div>

                    {/* Scroll Indicator */}
                    <div 
                        className="fixed z-50 transform -translate-x-1/2 bottom-8 left-1/2"
                        style={{
                            opacity: Math.max(0, 1 - scrollY / 200),
                            willChange: 'opacity'
                        }}
                    >
                        <div className="flex flex-col items-center gap-2 animate-bounce">
                            <span className="text-sm font-medium text-heritage-dark">Scroll to explore</span>
                            <svg className="w-6 h-6 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
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
