/**
 * Image Card Component
 * Displays 360° panoramic image preview
 * Built using MediaCard base component for modularity
 */

import React from 'react';
import { MediaCard, MediaContent } from './MediaCard';

export interface ImageCardProps {
    id?: string;
    name: string;
    location: string;
    description: string;
    imageUrl?: string;
    capturedYear?: number;
    site?: string;
    onClick?: () => void;
    className?: string;
}

export function ImageCard({
    id: _id,
    name,
    location,
    description,
    imageUrl,
    capturedYear,
    site,
    onClick,
    className,
}: ImageCardProps) {
    // Media content for the card
    const mediaContent = (
        <MediaContent
            aspectRatio="video"
            gradient="from-heritage-dark to-heritage-secondary"
        >
            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={name}
                        className="object-cover w-full h-full"
                    />
                    {/* Gradient Overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-heritage-dark/30 to-transparent"></div>
                </>
            ) : (
                <>
                    {/* Pattern Overlay - Fallback */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNC40MiAxLjYgOC40OCA0LjI0IDExLjZDLjkyIDMyLjkyLjA4IDM3LjMxLjA4IDQyYzAgOS45NCA4LjA2IDE4IDE4IDE4czE4LTguMDYgMTgtMThjMC00LjY5LS44NC05LjA4LTQuMTYtMTIuNEMzNC40IDI2LjQ4IDM2IDIyLjQyIDM2IDE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-heritage-primary/20 to-heritage-accent/20"></div>

                    {/* Icon - Fallback */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-20 h-20 mb-3 transition-transform rounded-full shadow-lg bg-gradient-to-br from-heritage-primary to-heritage-accent group-hover:scale-110">
                                <svg className="w-10 h-10 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="inline-block px-4 py-1.5 bg-heritage-primary/90 backdrop-blur-sm text-heritage-dark text-sm font-bold rounded-full shadow-md">
                                360° Panorama
                            </span>
                        </div>
                    </div>
                </>
            )}
        </MediaContent>
    );

    // Metadata/features
    const metadata = [
        {
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
            ),
            text: 'Immersive View',
        },
    ];

    // Add site to metadata if provided
    if (site) {
        metadata.push({
            icon: <span className="w-3 h-3" />,
            text: site,
        });
    }

    // Additional info (captured year)
    const additionalInfo = capturedYear && (
        <span className="text-gray-500"> • Captured {capturedYear}</span>
    );

    return (
        <MediaCard
            title={name}
            location={location}
            description={description}
            onClick={onClick}
            className={className}
            mediaContent={mediaContent}
            badgeText="360°"
            badgePosition="top-right"
            metadata={metadata}
            additionalInfo={additionalInfo}
        />
    );
}
