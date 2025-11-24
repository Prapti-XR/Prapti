'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-heritage-light/30',
                className
            )}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonModelCard() {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonImageCard() {
    return (
        <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function SkeletonMapMarker() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === lines - 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonHeader() {
    return (
        <div className="px-4 pt-24 pb-12 border-b border-gray-100 md:pt-32 md:pb-16 md:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="max-w-3xl space-y-4">
                    <Skeleton className="h-12 w-3/4 md:h-16" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonGrid({
    count = 8,
    component: Component = SkeletonCard
}: {
    count?: number;
    component?: React.ComponentType;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Component key={i} />
            ))}
        </div>
    );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonSiteDetail() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <Skeleton className="absolute inset-0" />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-32 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>

                        {/* Assets Grid */}
                        <div className="pt-6">
                            <Skeleton className="h-8 w-48 mb-4" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-10 w-full rounded-full" />
                            <Skeleton className="h-10 w-full rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
