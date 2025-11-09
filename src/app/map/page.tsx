import { Navbar } from '@/components/layout/Navbar';
import { Search } from '@/components';

export default function MapPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white flex flex-col">
                {/* Search Bar */}
                <div className="pt-20 md:pt-24 px-4 md:px-6 py-4 bg-white border-b border-gray-200 sticky top-16 z-10">
                    <div className="max-w-6xl mx-auto">
                        <Search
                            placeholder="Search heritage sites..."
                            size="lg"
                        />
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="text-center p-8">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p className="text-gray-600 font-medium">Interactive Map</p>
                            <p className="text-sm text-gray-500 mt-2">Map component will be integrated here</p>
                        </div>
                    </div>

                    {/* Floating Site Cards (Mobile Bottom Sheet / Desktop Sidebar) */}
                    <div className="absolute bottom-0 left-0 right-0 md:left-auto md:top-4 md:right-4 md:bottom-4 md:w-96 bg-white md:rounded-lg shadow-lg border-t md:border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 hidden md:block">
                            <h3 className="font-semibold text-heritage-dark">Nearby Sites</h3>
                        </div>
                        <div className="overflow-y-auto max-h-60 md:max-h-full">
                            {/* Drag Handle (Mobile) */}
                            <div className="md:hidden flex justify-center py-2 border-b border-gray-100">
                                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                            </div>

                            {/* Site Cards */}
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <SitePreviewCard key={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

function SitePreviewCard() {
    return (
        <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-heritage-primary transition-colors cursor-pointer">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-heritage-dark text-sm mb-1 truncate">
                    Heritage Site Name
                </h4>
                <p className="text-xs text-gray-600 mb-2">Location, State</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>2.5 km away</span>
                </div>
            </div>
        </div>
    );
}
