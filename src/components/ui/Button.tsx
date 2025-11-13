'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    // Base styles - soft, minimalist design with heritage elegance
    'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap border border-transparent',
    {
        variants: {
            variant: {
                default:
                    'bg-heritage-light text-heritage-dark shadow-sm hover:shadow-md hover:bg-heritage-light/80 active:shadow-sm',
                pressed:
                    'bg-heritage-light text-heritage-dark shadow-inner',
                primary:
                    'bg-heritage-primary text-heritage-dark font-semibold shadow-sm hover:shadow-md hover:bg-heritage-primary/90 active:shadow-sm',
                secondary:
                    'bg-heritage-secondary text-white font-semibold shadow-sm hover:shadow-md hover:bg-heritage-secondary/90 active:shadow-sm',
                accent:
                    'bg-heritage-accent text-white font-semibold shadow-sm hover:shadow-md hover:bg-heritage-accent/90 active:shadow-sm',
                ghost:
                    'bg-transparent text-heritage-dark hover:bg-heritage-light/50 hover:text-heritage-primary',
                outline:
                    'bg-transparent border-2 border-heritage-dark text-heritage-dark hover:bg-heritage-dark hover:text-white',
            },
            size: {
                sm: 'h-9 px-4 text-sm md:h-10',
                md: 'h-11 px-6 text-base md:h-12',
                lg: 'h-12 px-8 text-base md:h-14 md:text-lg',
                xl: 'h-14 px-10 text-lg md:h-16 md:text-xl',
                icon: 'h-10 w-10 md:h-11 md:w-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isPressed?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isPressed, ...props }, ref) => {
        return (
            <button
                className={cn(
                    buttonVariants({
                        variant: isPressed ? 'pressed' : variant,
                        size,
                        className
                    })
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
