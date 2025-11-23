'use client';

import { useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Search } from '@/components';
import { GoogleMap } from '@/components/map/GoogleMap';
import { MapMarker } from '@/components/map/MapMarker';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useMapInteraction } from '@/hooks/useMapInteraction';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapFilters } from '@/hooks/useMapFilters';
import { useNearbySites } from '@/hooks/useNearbySites';
import type { MapCoordinates, MapBounds } from '@/types';

export default function MapPage() {
    const { isLoaded, loadError } = useGoogleMaps();
    const [mapCenter, setMapCenter] = useState<MapCoordinates>({
        lat: 14.7206, // Center between the 3 sites
        lng: 74.8141,
    });
    const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
    const [zoom, setZoom] = useState(10);

    const { location, loading: geoLoading, requestLocation } = useGeolocation();
    const { filters } = useMapFilters();
    const { sites, loading: sitesLoading } = useNearbySites(mapBounds, filters);

    const {
        selectedSite,
        hoveredMarkerId,
        isPreviewCardOpen,
        handleMarkerClick,
        handleMarkerHover,
        handleMapClick,
        closePreviewCard,
        setMapInstance,
        handleView3D,
        handleViewVR,
        handleViewDetails,
    } = useMapInteraction();

    // Handle user location
    const handleLocateMe = useCallback(() => {
        requestLocation();
        if (location) {
            setMapCenter(location);
            setZoom(12);
        }
    }, [requestLocation, location]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 1, 20));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 1, 3));
    }, []);

    if (loadError) {
        console.error('Google Maps load error:', loadError);
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                        <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-2">Error Loading Maps</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {loadError.message || 'Please check your Google Maps API key configuration'}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg text-left">
                            <p className="text-xs text-gray-600 mb-2">To fix this:</p>
                            <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
                                <li>Check if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env.local</li>
                                <li>Verify the API key is valid</li>
                                <li>Enable Maps JavaScript API in Google Cloud Console</li>
                                <li>Restart the dev server after changing .env.local</li>
                            </ol>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!isLoaded) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-heritage-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading Maps...</p>
                    </div>
                </main>
            </>
        );
    }
    return (
        <>
            <main className="h-screen bg-white flex flex-col">
                {/* Map Container - Full Page */}
                <div className="flex-1 relative" style={{ minHeight: '500px' }}>
                    <GoogleMap
                        center={mapCenter}
                        zoom={zoom}
                        onBoundsChanged={setMapBounds}
                        onMapLoad={setMapInstance}
                        onClick={handleMapClick}
                    >
                        {/* Render Markers */}
                        {sites.map((site) => (
                            <MapMarker
                                key={site.id}
                                site={site}
                                isSelected={selectedSite?.id === site.id}
                                isHovered={hoveredMarkerId === site.id}
                                onClick={() => handleMarkerClick(site)}
                                onMouseOver={() => handleMarkerHover(site.id)}
                                onMouseOut={() => handleMarkerHover(null)}
                            />
                        ))}
                    </GoogleMap>

                    {/* Navbar Overlay */}
                    <div className="absolute top-0 left-0 right-0 z-20">
                        <Navbar />
                    </div>

                    {/* Search Bar - Overlay on Map (Left Aligned) */}
                    <div className="absolute top-20 left-4 right-4 md:top-24 md:left-6 md:right-auto z-10">
                        <div className="w-full md:w-[32rem] lg:w-[40rem]">
                            <Search
                                placeholder="Search heritage sites..."
                                size="md"
                                containerClassName="w-full shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Essential Map Controls - Bottom Left */}
                    <div className="absolute bottom-28 left-16 md:bottom-4 md:left-24 lg:bottom-4 lg:left-28 flex gap-2 z-[5]">
                        {/* Locate Me */}
                        <button
                            onClick={handleLocateMe}
                            disabled={geoLoading}
                            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 disabled:opacity-50"
                            aria-label="Locate me"
                        >
                            {geoLoading ? (
                                <svg className="w-5 h-5 text-heritage-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Site Preview Card or List */}
                    {isPreviewCardOpen && selectedSite ? (
                        <div className="absolute bottom-0 left-0 right-0 md:left-auto md:top-28 lg:top-32 md:right-4 lg:right-6 md:bottom-auto md:max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-9rem)] md:w-96 lg:w-[28rem] z-20">
                            <SitePreviewCard
                                site={selectedSite}
                                onView3D={() => handleView3D(selectedSite.id)}
                                onViewVR={() => handleViewVR(selectedSite.id)}
                                onViewDetails={() => handleViewDetails(selectedSite.id)}
                                onClose={closePreviewCard}
                            />
                        </div>
                    ) : (
                        <div className="absolute bottom-0 left-0 right-0 md:left-auto md:top-28 lg:top-32 md:right-4 lg:right-6 md:bottom-auto md:max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-9rem)] md:w-96 lg:w-[28rem] bg-white md:rounded-lg shadow-lg border-t md:border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-heritage-dark">
                                    {sitesLoading ? 'Loading sites...' : `${sites.length} Sites Found`}
                                </h3>
                            </div>
                            <div className="overflow-y-auto max-h-60 md:max-h-full">
                                <div className="p-4 space-y-3">
                                    {sitesLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-primary mx-auto"></div>
                                        </div>
                                    ) : sites.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No sites found in this area</p>
                                        </div>
                                    ) : (
                                        sites.slice(0, 10).map((site) => (
                                            <SiteListCard
                                                key={site.id}
                                                site={site}
                                                onClick={() => handleMarkerClick(site)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

// Simple site preview card component (will be enhanced with custom UI later)
function SitePreviewCard({
    site,
    onView3D,
    onViewVR,
    onViewDetails,
    onClose,
}: {
    site: any;
    onView3D: () => void;
    onViewVR: () => void;
    onViewDetails: () => void;
    onClose: () => void;
}) {
    const has3D = site.assets.some((a: any) => a.type === 'MODEL_3D');
    const hasVR = site.assets.some((a: any) => a.type === 'PANORAMA_360');
    const thumbnail = site.assets.find((a: any) => a.type === 'IMAGE')?.storageUrl;

    return (
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
            {/* Header with Close Button */}
            <div className="relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Thumbnail */}
                <div className="relative w-full h-40 bg-gray-100">
                    {thumbnail ? (
                        <img src={thumbnail} alt={site.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Title & Location */}
                <div>
                    <h3 className="text-xl font-bold text-heritage-dark font-serif mb-1">
                        {site.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {site.city}, {site.country}
                    </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2">
                    {site.description}
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                    {has3D && (
                        <button
                            onClick={onView3D}
                            className="px-4 py-2 bg-heritage-primary text-white rounded-lg hover:bg-heritage-dark transition-colors text-sm"
                        >
                            3D View
                        </button>
                    )}
                    {hasVR && (
                        <button
                            onClick={onViewVR}
                            className="px-4 py-2 bg-heritage-primary text-white rounded-lg hover:bg-heritage-dark transition-colors text-sm"
                        >
                            360° View
                        </button>
                    )}
                    <button
                        onClick={onViewDetails}
                        className="px-4 py-2 bg-gray-100 text-heritage-dark rounded-lg hover:bg-gray-200 transition-colors text-sm col-span-2"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}

function SiteListCard({ site, onClick }: { site: any; onClick: () => void }) {
    const thumbnail = site.assets.find((a: any) => a.type === 'IMAGE')?.storageUrl;

    return (
        <div
            onClick={onClick}
            className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-heritage-primary transition-colors cursor-pointer"
        >
            <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                {thumbnail ? (
                    <img src={thumbnail} alt={site.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-heritage-dark text-sm mb-1 truncate">
                    {site.name}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                    {site.city}, {site.country}
                </p>
                {site.era && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {site.era}
                    </span>
                )}
            </div>
        </div>
    );
}

