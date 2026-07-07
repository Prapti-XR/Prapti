import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    // Base styles - soft pill, heritage elegance
    'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap transition-colors duration-200',
    {
        variants: {
            variant: {
                primary: 'bg-heritage-primary text-heritage-dark',
                secondary: 'bg-heritage-secondary text-white',
                accent: 'bg-heritage-accent text-white',
                neutral: 'bg-heritage-light text-heritage-dark',
                outline: 'bg-transparent border border-heritage-dark/20 text-heritage-dark',
                // Semantic colors from the design system's form palette
                success: 'bg-green-50 text-green-800 border border-green-200',
                error: 'bg-red-50 text-red-700 border border-red-200',
            },
            size: {
                sm: 'px-2.5 py-0.5 text-xs',
                md: 'px-3 py-1 text-sm',
                lg: 'px-4 py-1.5 text-sm md:text-base',
            },
        },
        defaultVariants: {
            variant: 'neutral',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
