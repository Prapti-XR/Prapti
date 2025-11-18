/**
 * Base Card Component
 * A flexible card component with heritage theme and glassmorphism effects
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Card variant - affects styling */
    variant?: 'default' | 'glass' | 'elevated' | 'bordered';
    /** Hover effect */
    hover?: boolean;
    /** Card padding */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Card({
    variant = 'default',
    hover = true,
    padding = 'md',
    className,
    children,
    ...props
}: CardProps) {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variantStyles = {
        default: 'bg-white border border-heritage-light/20 shadow-sm',
        glass: 'bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg',
        elevated: 'bg-white shadow-md border border-transparent',
        bordered: 'bg-white border-2 border-heritage-primary/30',
    };

    const hoverStyles = hover
        ? 'hover:shadow-xl hover:border-heritage-primary/40 hover:-translate-y-1'
        : '';

    const paddingStyles = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                hoverStyles,
                paddingStyles[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Card sub-components for composition
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
    as: Component = 'h3',
    className,
    children,
    ...props
}: CardTitleProps) {
    return (
        <Component
            className={cn(
                'font-serif font-semibold text-heritage-dark',
                Component === 'h1' && 'text-3xl',
                Component === 'h2' && 'text-2xl',
                Component === 'h3' && 'text-xl',
                Component === 'h4' && 'text-lg',
                Component === 'h5' && 'text-base',
                Component === 'h6' && 'text-sm',
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
    return (
        <p
            className={cn('text-sm text-gray-600 leading-relaxed', className)}
            {...props}
        >
            {children}
        </p>
    );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div className={cn('space-y-4', className)} {...props}>
            {children}
        </div>
    );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div
            className={cn('mt-6 pt-4 border-t border-heritage-light/30', className)}
            {...props}
        >
            {children}
        </div>
    );
}
