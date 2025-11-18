/**
 * Stat Card Component
 * Displays statistics with icon and label
 */

import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    label: string;
    value: string | number;
    icon?: string | React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'default' | 'primary' | 'secondary' | 'accent';
    className?: string;
}

export function StatCard({
    label,
    value,
    icon,
    trend,
    variant = 'default',
    className,
}: StatCardProps) {
    const variantStyles = {
        default: 'border-heritage-light/20',
        primary: 'border-heritage-primary/40 bg-heritage-primary/5',
        secondary: 'border-heritage-secondary/40 bg-heritage-secondary/5',
        accent: 'border-heritage-accent/40 bg-heritage-accent/5',
    };

    return (
        <Card
            variant="default"
            padding="md"
            hover={true}
            className={cn(variantStyles[variant], className)}
        >
            <div className="flex items-center justify-between mb-3">
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-heritage-primary/20 to-heritage-accent/20">
                    {typeof icon === 'string' ? (
                        <span className="text-2xl">{icon}</span>
                    ) : (
                        icon || (
                            <svg className="w-6 h-6 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        )
                    )}
                </div>

                {/* Value */}
                <div className="text-3xl font-bold font-serif text-heritage-dark">
                    {value}
                </div>
            </div>

            {/* Label and Trend */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600">{label}</div>

                {trend && (
                    <div className={cn(
                        'text-xs font-semibold flex items-center gap-1',
                        trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                        {trend.isPositive ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </Card>
    );
}
