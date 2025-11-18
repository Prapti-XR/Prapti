/**
 * Action Card Component
 * Interactive card for admin actions or feature selection
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ActionCardProps {
    title: string;
    description: string;
    icon?: string | React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'primary' | 'glass';
    disabled?: boolean;
    className?: string;
}

export function ActionCard({
    title,
    description,
    icon,
    onClick,
    href,
    variant = 'default',
    disabled = false,
    className,
}: ActionCardProps) {
    const baseStyles = cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-300',
        'cursor-pointer text-left p-6',
        !disabled && 'hover:shadow-xl hover:border-heritage-primary hover:-translate-y-1',
        disabled && 'opacity-50 cursor-not-allowed'
    );

    const variantStyles = {
        default: 'bg-white border-heritage-light/30',
        primary: 'bg-gradient-to-br from-heritage-primary/10 to-heritage-accent/10 border-heritage-primary/40',
        glass: 'bg-white/70 backdrop-blur-xl border-gray-200/50',
    };

    const content = (
        <>
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-heritage-primary/5 to-heritage-accent/5 group-hover:opacity-100"></div>

            <div className="relative flex flex-col h-full">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-heritage-primary/20 to-heritage-accent/20 transition-transform duration-300 group-hover:scale-110">
                    {typeof icon === 'string' ? (
                        <span className="text-3xl">{icon}</span>
                    ) : (
                        icon || (
                            <svg className="w-7 h-7 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold transition-colors font-serif text-heritage-dark group-hover:text-heritage-secondary">
                        {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                        {description}
                    </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-end mt-4">
                    <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full bg-heritage-light/30 group-hover:bg-heritage-primary group-hover:translate-x-1">
                        <svg className="w-4 h-4 transition-colors text-heritage-dark group-hover:text-heritage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );

    const Element = href ? 'a' : 'button';

    return (
        <Element
            href={href}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={cn(baseStyles, variantStyles[variant], className)}
        >
            {content}
        </Element>
    );
}
