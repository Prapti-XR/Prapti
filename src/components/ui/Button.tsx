'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    // Base styles - neumorphic design with mobile-first approach
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap border border-transparent',
    {
        variants: {
            variant: {
                default:
                    'bg-[#E8E4E6] text-[#6E6D7A] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:bg-heritage-light hover:text-heritage-dark hover:border-heritage-dark/20 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] md:shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.8)] md:hover:shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.8)] md:active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]',
                pressed:
                    'bg-[#E8E4E6] text-[#6E6D7A] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] md:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]',
                primary:
                    'bg-heritage-dark text-white shadow-[4px_4px_8px_rgba(62,39,35,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:bg-heritage-primary hover:border-heritage-primary/30 hover:shadow-[3px_3px_6px_rgba(139,69,19,0.4),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(62,39,35,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] md:shadow-[6px_6px_12px_rgba(62,39,35,0.3),-6px_-6px_12px_rgba(255,255,255,0.8)] md:hover:shadow-[4px_4px_8px_rgba(139,69,19,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] md:active:shadow-[inset_6px_6px_12px_rgba(62,39,35,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]',
                secondary:
                    'bg-heritage-secondary text-white shadow-[4px_4px_8px_rgba(210,105,30,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:bg-heritage-accent hover:border-heritage-accent/30 hover:shadow-[3px_3px_6px_rgba(205,133,63,0.4),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(210,105,30,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] md:shadow-[6px_6px_12px_rgba(210,105,30,0.3),-6px_-6px_12px_rgba(255,255,255,0.8)] md:hover:shadow-[4px_4px_8px_rgba(205,133,63,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] md:active:shadow-[inset_6px_6px_12px_rgba(210,105,30,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]',
                ghost:
                    'bg-transparent text-heritage-dark hover:bg-[#E8E4E6] hover:text-heritage-primary hover:border-heritage-primary/20 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)] md:hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.6)]',
            },
            size: {
                sm: 'h-9 w-[100px] px-4 text-sm md:h-10 md:w-[160px]',
                md: 'h-11 w-[110px] px-4 text-base md:h-12 md:w-[180px]',
                lg: 'h-12 w-[120px] px-4 text-base md:h-14 md:w-[200px] md:text-lg',
                xl: 'h-14 w-[140px] px-4 text-lg md:h-16 md:w-[220px] md:text-xl',
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
