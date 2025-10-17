import { Navbar } from '@/components/layout/Navbar';

export default function ImagesPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-dark font-serif mb-4 md:mb-6 tracking-tight">
                                360° Images
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                Immerse yourself in panoramic views. Experience heritage sites
                                as if you're standing right there.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <section className="py-6 md:py-8 px-4 md:px-6 bg-gray-50 sticky top-16 z-10 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button className="px-4 md:px-5 py-2 bg-heritage-dark text-white rounded-full text-sm font-medium whitespace-nowrap">
                                All Images
                            </button>
                            <button className="px-4 md:px-5 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-heritage-dark transition-colors whitespace-nowrap">
                                Exterior
                            </button>
                            <button className="px-4 md:px-5 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-heritage-dark transition-colors whitespace-nowrap">
                                Interior
                            </button>
                            <button className="px-4 md:px-5 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-heritage-dark transition-colors whitespace-nowrap">
                                Aerial
                            </button>
                        </div>
                    </div>
                </section>

                {/* Images Grid */}
                <section className="py-12 md:py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                            {/* Image Card Placeholders */}
                            {[1, 2, 3, 4].map((item) => (
                                <ImageCard key={item} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function ImageCard() {
    return (
        <div className="group cursor-pointer">
            <div className="bg-gray-100 rounded-lg aspect-video mb-4 overflow-hidden border border-gray-200 hover:border-heritage-primary transition-all duration-200">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="absolute top-3 right-3 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                        360°
                    </span>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-heritage-dark group-hover:text-heritage-primary transition-colors">
                    Heritage Site Panorama
                </h3>
                <p className="text-sm text-gray-600">Location, State • Captured 2024</p>
            </div>
        </div>
    );
}
