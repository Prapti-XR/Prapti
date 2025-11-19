'use client';

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const searchVariants = cva(
    // Base styles - minimalist design with soft focus state
    'flex items-center gap-3 w-full max-w-full rounded-full bg-white border-2 border-gray-200 transition-all duration-200 focus-within:border-heritage-primary focus-within:shadow-lg hover:border-gray-300',
    {
        variants: {
            variant: {
                default: 'shadow-sm',
                disabled: 'opacity-50 cursor-not-allowed',
            },
            size: {
                sm: 'h-10 px-4 text-sm',
                md: 'h-12 px-5 text-base',
                lg: 'h-14 px-6 text-lg',
                xl: 'h-16 px-7 text-xl',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface SearchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchVariants> {
    containerClassName?: string;
    iconPosition?: 'left' | 'right';
    onSearch?: (value: string) => void;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
    (
        {
            className,
            containerClassName,
            variant,
            size,
            placeholder = 'Search',
            iconPosition = 'right',
            onSearch,
            disabled,
            ...props
        },
        ref
    ) => {
        const [value, setValue] = useState(props.value || '');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setValue(newValue);
            if (props.onChange) {
                props.onChange(e);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && onSearch) {
                onSearch(String(value));
            }
            if (props.onKeyDown) {
                props.onKeyDown(e);
            }
        };

        const handleSearchClick = () => {
            if (onSearch && !disabled) {
                onSearch(String(value));
            }
        };

        return (
            <div
                className={cn(
                    searchVariants({ variant: disabled ? 'disabled' : variant, size }),
                    containerClassName
                )}
            >
                {iconPosition === 'left' && (
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        disabled={disabled}
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-gray-400 hover:text-heritage-primary transition-colors disabled:cursor-not-allowed"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>
                )}

                <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        'flex-1 min-w-0 bg-transparent outline-none placeholder:text-gray-400 text-gray-900 disabled:cursor-not-allowed',
                        className
                    )}
                    {...props}
                />

                {iconPosition === 'right' && (
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        disabled={disabled}
                        className={cn(
                            'flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed',
                            size === 'sm' && 'w-8 h-8',
                            size === 'md' && 'w-9 h-9',
                            size === 'lg' && 'w-10 h-10',
                            size === 'xl' && 'w-12 h-12',
                            disabled
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-heritage-primary text-white hover:bg-heritage-primary/90 shadow-sm hover:shadow-md'
                        )}
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>
                )}
            </div>
        );
    }
);

Search.displayName = 'Search';

// Search Icon Component
const SearchIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
    >
        <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M19 19L14.65 14.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export { Search, searchVariants };
