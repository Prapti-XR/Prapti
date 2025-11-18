/**
 * Feature Card Component
 * Displays key features or benefits on landing/about pages
 */

import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'glass' | 'elevated';
    className?: string;
}

export function FeatureCard({
    title,
    description,
    icon,
    variant = 'default',
    className,
}: FeatureCardProps) {
    return (
        <Card
            variant={variant}
            padding="lg"
            hover={true}
            className={cn('group text-center', className)}
        >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-heritage-primary/20 to-heritage-accent/20 transition-transform duration-300 group-hover:scale-110">
                {icon || (
                    <svg className="w-8 h-8 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                )}
            </div>

            {/* Content */}
            <h3 className="mb-3 text-xl font-semibold transition-colors font-serif text-heritage-dark group-hover:text-heritage-secondary">
                {title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
                {description}
            </p>
        </Card>
    );
}
