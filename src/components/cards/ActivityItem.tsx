/**
 * Activity Item Component
 * Displays user activity or system events
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ActivityItemProps {
    title: string;
    description?: string;
    timestamp: string;
    icon?: React.ReactNode;
    iconBg?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
    avatar?: string;
    userName?: string;
    onClick?: () => void;
    className?: string;
}

export function ActivityItem({
    title,
    description,
    timestamp,
    icon,
    iconBg = 'default',
    avatar,
    userName,
    onClick,
    className,
}: ActivityItemProps) {
    const iconBgStyles = {
        default: 'bg-heritage-light/40 text-heritage-dark/60',
        primary: 'bg-heritage-primary/20 text-heritage-secondary',
        secondary: 'bg-heritage-secondary/20 text-heritage-secondary',
        accent: 'bg-heritage-accent/20 text-heritage-accent',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-heritage-primary/30 text-heritage-secondary',
        error: 'bg-red-100 text-red-600',
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 transition-colors',
                onClick && 'cursor-pointer hover:bg-heritage-light/10',
                className
            )}
            onClick={onClick}
        >
            {/* Icon or Avatar */}
            <div className="flex-shrink-0">
                {avatar ? (
                    <div className="w-10 h-10 rounded-full bg-heritage-light/50 overflow-hidden border border-heritage-light">
                        <img src={avatar} alt={userName || 'User'} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        iconBgStyles[iconBg]
                    )}>
                        {icon || (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-heritage-dark/80">
                    {userName && <span className="font-medium text-heritage-dark">{userName}</span>}
                    {userName && ' • '}
                    <span className={cn(!userName && 'font-medium text-heritage-dark')}>
                        {title}
                    </span>
                </p>

                {description && (
                    <p className="mt-1 text-xs text-heritage-dark/70 line-clamp-2">
                        {description}
                    </p>
                )}

                <p className="mt-1 text-xs text-heritage-dark/60">{timestamp}</p>
            </div>

            {/* Action Indicator */}
            {onClick && (
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-heritage-dark/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </div>
    );
}
