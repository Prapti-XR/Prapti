/**
 * Heritage Site Card Component
 * Displays site thumbnail with basic information
 */

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface SiteCardProps {
    id: string;
    name: string;
    location: string;
    description: string;
    thumbnail?: string;
    category?: string;
    yearBuilt?: number;
    tags?: string[];
    hasModel?: boolean;
    hasPanorama?: boolean;
    hasAR?: boolean;
    className?: string;
}

export function SiteCard({
    id,
    name,
    location,
    description,
    thumbnail,
    category,
    yearBuilt,
    tags,
    hasModel = false,
    hasPanorama = false,
    hasAR = false,
    className,
}: SiteCardProps) {
    return (
        <Link href={`/site/${id}`} className={cn('group block', className)}>
            <div className="overflow-hidden transition-all duration-300 bg-white border rounded-xl shadow-lg border-heritage-primary/20 md:shadow-none md:hover:shadow-2xl md:border-heritage-light/30 md:hover:border-heritage-primary md:hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-heritage-light/30 to-heritage-accent/20">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={name}
                            className="object-cover w-full h-full transition-transform duration-500 scale-105 md:scale-100 md:group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full">
                            <svg className="w-16 h-16 text-heritage-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    )}

                    {/* Category Badge */}
                    {category && (
                        <span className="absolute px-3 py-1 text-xs font-semibold rounded-full shadow-md top-3 left-3 bg-heritage-primary/90 backdrop-blur-sm text-heritage-dark">
                            {category}
                        </span>
                    )}

                    {/* Year Badge */}
                    {yearBuilt && (
                        <span className="absolute px-3 py-1 text-xs font-semibold text-white rounded-full shadow-md top-3 right-3 bg-heritage-secondary/90 backdrop-blur-sm">
                            {yearBuilt}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold transition-colors font-serif text-heritage-secondary md:text-heritage-dark md:group-hover:text-heritage-secondary line-clamp-1">
                        {name}
                    </h3>

                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <svg className="w-4 h-4 flex-shrink-0 text-heritage-secondary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">
                        {description}
                    </p>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs rounded-full bg-heritage-light/40 text-heritage-dark"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Features */}
                    <div className="flex items-center gap-3 pt-2 text-xs text-gray-500">
                        {hasModel && (
                            <span className="inline-flex items-center gap-1" title="3D Model Available">
                                <svg className="w-3.5 h-3.5 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                3D
                            </span>
                        )}
                        {hasPanorama && (
                            <span className="inline-flex items-center gap-1" title="360° View Available">
                                <svg className="w-3.5 h-3.5 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                360°
                            </span>
                        )}
                        {hasAR && (
                            <span className="inline-flex items-center gap-1 font-medium text-heritage-secondary" title="AR Experience Available">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                AR Ready
                            </span>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Button variant="primary" size="sm" className="w-full mt-4">
                        Explore Site
                    </Button>
                </div>
            </div>
        </Link>
    );
}
