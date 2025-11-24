'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';

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

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'UNDER_REVIEW':
                return 'bg-blue-100 text-blue-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'MERGED':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'NEW_SITE':
                return 'bg-indigo-100 text-indigo-800';
            case 'ADD_ASSET':
                return 'bg-cyan-100 text-cyan-800';
            case 'EDIT_SITE':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">
                            Content Review
                        </h1>
                        <p className="text-gray-600">Review and manage user contributions</p>
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                            ? 'bg-heritage-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                <p className="mt-4 text-gray-600">Loading contributions...</p>
                            </div>
                        ) : contributions.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600">No contributions found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {contributions.map((contribution) => (
                                    <div
                                        key={contribution.id}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-heritage-dark">
                                                        {contribution.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(contribution.type)}`}>
                                                        {contribution.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2">{contribution.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>By {contribution.author.name || contribution.author.email}</span>
                                                    {contribution.site && <span>• {contribution.site.name}</span>}
                                                    <span>• {new Date(contribution.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(contribution.status)}`}>
                                                {contribution.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {contribution.status === 'PENDING' && (
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'UNDER_REVIEW')}
                                                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    Start Review
                                                </button>
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'APPROVED')}
                                                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
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
                                                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {contribution.status === 'APPROVED' && (
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => updateContributionStatus(contribution.id, 'MERGED')}
                                                    className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
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
