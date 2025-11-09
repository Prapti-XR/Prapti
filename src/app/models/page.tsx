import { Navbar } from '@/components/layout/Navbar';
import { Button, Search } from '@/components';

export default function ModelsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-dark font-serif mb-4 md:mb-6 tracking-tight">
                                3D Models Gallery
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                Explore interactive 3D reconstructions of heritage sites.
                                Rotate, zoom, and examine every detail of historical monuments.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Search and Filters */}
                <section className="py-6 md:py-8 px-4 md:px-6 bg-gray-50 sticky top-16 z-10 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search 3D models..."
                            size="md"
                            className="max-w-xl"
                        />
                        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <Button size="sm" variant="primary">
                                All Models
                            </Button>
                            <Button size="sm" variant="default">
                                Temples
                            </Button>
                            <Button size="sm" variant="default">
                                Monuments
                            </Button>
                            <Button size="sm" variant="default">
                                Forts
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Models Grid */}
                <section className="py-12 md:py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Model Card Placeholders */}
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <ModelCard key={item} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function ModelCard() {
    return (
        <div className="group cursor-pointer">
            <div className="bg-gray-100 rounded-lg aspect-square mb-4 overflow-hidden border border-gray-200 hover:border-heritage-primary transition-all duration-200">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-heritage-dark group-hover:text-heritage-primary transition-colors">
                    Heritage Site Name
                </h3>
                <p className="text-sm text-gray-600">Location, State</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>• AR Ready</span>
                    <span>• VR Compatible</span>
                </div>
            </div>
        </div>
    );
}
