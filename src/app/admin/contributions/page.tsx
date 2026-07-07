'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Badge, type BadgeProps } from '@/components/ui';

interface Contribution {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    createdAt: string;
    author: {
        name: string | null;
        email: string;
    };
    site: {
        name: string;
    } | null;
}

export default function ContributionsPage() {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchContributions();
    }, [filter]);

    const fetchContributions = async () => {
        try {
            const url = filter === 'ALL'
                ? '/api/admin/contributions'
                : `/api/admin/contributions?status=${filter}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch contributions');
            }
            const result = await response.json();
            setContributions(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch contributions');
        } finally {
            setLoading(false);
        }
    };

    const updateContributionStatus = async (id: string, status: string, reason?: string) => {
        try {
            const response = await fetch('/api/admin/contributions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contributionId: id, status, rejectionReason: reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to update contribution');
            }

            fetchContributions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update contribution');
        }
    };

    const getStatusVariant = (status: string): BadgeProps['variant'] => {
        switch (status) {
            case 'PENDING':
                return 'primary';
            case 'UNDER_REVIEW':
                return 'accent';
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'error';
            case 'MERGED':
                return 'secondary';
            default:
                return 'neutral';
        }
    };

    const getTypeVariant = (type: string): BadgeProps['variant'] => {
        switch (type) {
            case 'NEW_SITE':
                return 'accent';
            case 'ADD_ASSET':
                return 'neutral';
            case 'EDIT_SITE':
                return 'outline';
            default:
                return 'neutral';
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-heritage-light/30 animate-fade-in">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">
                            Content Review
                        </h1>
                        <p className="text-heritage-dark/70">Review and manage user contributions</p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Filters */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 ${filter === status
                                            ? 'bg-heritage-primary text-heritage-dark'
                                            : 'bg-heritage-light/40 text-heritage-dark/70 hover:bg-heritage-light/60'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-primary"></div>
                                <p className="mt-4 text-heritage-dark/70">Loading contributions...</p>
                            </div>
                        ) : contributions.length === 0 ? (
                            <div className="bg-heritage-light/20 rounded-lg p-8 text-center border border-heritage-light/40">
                                <svg className="w-12 h-12 text-heritage-dark/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-heritage-dark/70">No contributions found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {contributions.map((contribution) => (
                                    <div
                                        key={contribution.id}
                                        className="bg-white border border-heritage-light/40 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-heritage-dark">
                                                        {contribution.title}
                                                    </h3>
                                                    <Badge variant={getTypeVariant(contribution.type)} size="sm">
                                                        {contribution.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-heritage-dark/70 mb-2">{contribution.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-heritage-dark/60">
                                                    <span>By {contribution.author.name || contribution.author.email}</span>
                                                    {contribution.site && <span>• {contribution.site.name}</span>}
                                                    <span>• {new Date(contribution.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusVariant(contribution.status)} size="sm">
                                                {contribution.status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        {contribution.status === 'PENDING' && (
                                            <div className="flex items-center gap-2 pt-4 border-t border-heritage-light/30">
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'UNDER_REVIEW')}
                                                    className="px-4 py-2 min-h-[44px] bg-heritage-accent text-white text-sm font-medium rounded-lg hover:bg-heritage-accent/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                                >
                                                    Start Review
                                                </button>
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'APPROVED')}
                                                    className="px-4 py-2 min-h-[44px] bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Reason for rejection:');
                                                        if (reason) {
                                                            updateContributionStatus(contribution.id, 'REJECTED', reason);
                                                        }
                                                    }}
                                                    className="px-4 py-2 min-h-[44px] bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {contribution.status === 'APPROVED' && (
                                            <div className="flex items-center gap-2 pt-4 border-t border-heritage-light/30">
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'MERGED')}
                                                    className="px-4 py-2 min-h-[44px] bg-heritage-secondary text-white text-sm font-medium rounded-lg hover:bg-heritage-secondary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                                >
                                                    Merge
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
