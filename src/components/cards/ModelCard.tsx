/**
 * Model Card Component
 * Displays 3D model preview with heritage site information
 * Built using MediaCard base component for modularity
 */

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MediaCard, MediaContent } from './MediaCard';

export interface ModelCardProps {
    id: string;
    name: string;
    location: string;
    description: string;
    modelUrl?: string;
    thumbnail?: string;
    era?: string;
    yearBuilt?: number;
    tags?: string[];
    onClick?: () => void;
    className?: string;
}

export function ModelCard({
    id,
    name,
    location,
    description,
    modelUrl: _modelUrl,
    thumbnail,
    era,
    yearBuilt,
    tags: _tags,
    onClick,
    className,
}: ModelCardProps) {
    // Media content for the card
    const mediaContent = (
        <MediaContent aspectRatio="square">
            {thumbnail ? (
                <>
                    <img
                        src={thumbnail}
                        alt={name}
                        className="object-cover w-full h-full"
                    />
                    {/* Gradient Overlay on image for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-heritage-dark/20 to-transparent"></div>

                    {/* Era Badge on image */}
                    {era && yearBuilt && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-heritage-dark bg-white/90 backdrop-blur-sm shadow-md">
                                {era} • {yearBuilt}
                            </span>
                        </div>
                    )}
                </>
            ) : (
                /* Fallback: Stylish heritage-themed placeholder */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white/50 to-transparent backdrop-blur-sm">
                    {/* 3D Icon */}
                    <div className="flex items-center justify-center w-20 h-20 mb-4 transition-transform rounded-full shadow-lg bg-gradient-to-br from-heritage-primary to-heritage-accent group-hover:scale-110">
                        <svg className="w-10 h-10 text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>

                    {/* Era Badge */}
                    {era && yearBuilt && (
                        <div className="text-center">
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-heritage-dark bg-white/80 backdrop-blur-sm shadow-sm">
                                {era} • {yearBuilt}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </MediaContent>
    );

    // Metadata/features
    const metadata = [
        {
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
            ),
            text: '3D Model',
        },
        {
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
            ),
            text: 'AR Ready',
        },
    ];

    // Action buttons
    const actions = (
        <div className="grid grid-cols-2 gap-2">
            {/* View 3D Model Button */}
            <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
            >
                <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>View 3D</span>
                </span>
            </Button>

            {/* AR Button */}
            <Link href={`/site/${id}`} onClick={(e) => e.stopPropagation()} className="block">
                <Button variant="primary" size="sm" className="w-full">
                    <span className="flex items-center justify-center gap-1.5">
                        <span>📱</span>
                        <span>AR</span>
                    </span>
                </Button>
            </Link>
        </div>
    );

    return (
        <MediaCard
            title={name}
            location={location}
            description={description}
            onClick={onClick}
            className={className}
            mediaContent={mediaContent}
            badgeText="3D Model"
            badgePosition="top-left"
            metadata={metadata}
            actions={actions}
        />
    );
}
