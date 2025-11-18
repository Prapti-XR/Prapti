/**
 * Media Card Base Component
 * A reusable base component for media-based cards (images, models, videos)
 * Follows home page card pattern with all content inside border
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface MediaCardProps {
    /** Card title */
    title: string;
    /** Location text */
    location: string;
    /** Description text */
    description: string;
    /** Optional click handler */
    onClick?: () => void;
    /** Optional class name */
    className?: string;
    /** Media content (image, 3D preview, etc.) */
    mediaContent: React.ReactNode;
    /** Badge text (e.g., "3D Model", "360°") */
    badgeText?: string;
    /** Badge position */
    badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Optional metadata items to display */
    metadata?: Array<{ icon: React.ReactNode; text: string }>;
    /** Optional action buttons */
    actions?: React.ReactNode;
    /** Additional info (e.g., year, era) */
    additionalInfo?: React.ReactNode;
    children?: React.ReactNode;
}

export function MediaCard({
    title,
    location,
    description,
    onClick,
    className,
    mediaContent,
    badgeText,
    badgePosition = 'top-left',
    metadata,
    actions,
    additionalInfo,
    children,
}: MediaCardProps) {
    const badgePositionStyles = {
        'top-left': 'top-3 left-3',
        'top-right': 'top-3 right-3',
        'bottom-left': 'bottom-3 left-3',
        'bottom-right': 'bottom-3 right-3',
    };

    return (
        <div
            className={cn(
                'group bg-white border border-gray-100 rounded-lg overflow-hidden',
                'transition-all duration-200 hover:border-heritage-primary hover:shadow-md',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {/* Media Preview Section */}
            <div className="relative overflow-hidden transition-all duration-300">
                {mediaContent}

                {/* Badge */}
                {badgeText && (
                    <span
                        className={cn(
                            'absolute px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm',
                            'bg-heritage-primary/90 text-heritage-dark',
                            badgePositionStyles[badgePosition]
                        )}
                    >
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Card Content - Inside border */}
            <div className="p-6 space-y-3">
                {/* Title */}
                <h3 className="text-xl font-semibold transition-colors font-serif text-heritage-dark group-hover:text-heritage-secondary">
                    {title}
                </h3>

                {/* Location */}
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg
                        className="w-4 h-4 text-heritage-secondary flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="flex-1">{location}</span>
                    {additionalInfo}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                    {description}
                </p>

                {/* Metadata/Features */}
                {metadata && metadata.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {metadata.map((item, index) => (
                            <React.Fragment key={index}>
                                <span className="inline-flex items-center gap-1">
                                    {item.icon}
                                    {item.text}
                                </span>
                                {index < metadata.length - 1 && (
                                    <span className="text-heritage-light">•</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Custom children */}
                {children}

                {/* Action Buttons */}
                {actions && <div className="mt-4">{actions}</div>}
            </div>
        </div>
    );
}

// Export helper components for media content
export interface MediaContentProps {
    /** Aspect ratio */
    aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
    /** Background gradient */
    gradient?: string;
    /** Whether to show hover scale effect */
    hoverScale?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function MediaContent({
    aspectRatio = 'square',
    gradient = 'from-heritage-light/30 to-heritage-accent/20',
    hoverScale = true,
    children,
    className,
}: MediaContentProps) {
    const aspectRatioStyles = {
        square: 'aspect-square',
        video: 'aspect-video',
        wide: 'aspect-[21/9]',
        portrait: 'aspect-[3/4]',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden transition-all duration-300',
                `bg-gradient-to-br ${gradient}`,
                aspectRatioStyles[aspectRatio],
                className
            )}
        >
            <div
                className={cn(
                    'w-full h-full',
                    hoverScale && 'group-hover:scale-110 transition-transform duration-500'
                )}
            >
                {children}
            </div>
        </div>
    );
}
