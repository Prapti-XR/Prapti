'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components';

interface Analytics {
    totalSites: number;
    publishedSites: number;
    totalAssets: number;
    totalUsers: number;
    totalContributions: number;
    pendingContributions: number;
    assetsByType: {
        type: string;
        count: number;
    }[];
    recentActivity: {
        date: string;
        sites: number;
        assets: number;
    }[];
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/admin/analytics');
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            const result = await response.json();
            setAnalytics(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">
                            Analytics
                        </h1>
                        <p className="text-gray-600">Platform statistics and insights</p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-primary"></div>
                                <p className="mt-4 text-gray-600">Loading analytics...</p>
                            </div>
                        ) : analytics ? (
                            <>
                                {/* Overview Stats */}
                                <section>
                                    <h2 className="text-2xl font-semibold text-heritage-dark font-serif mb-4">
                                        Overview
                                    </h2>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            label="Total Sites"
                                            value={analytics.totalSites.toString()}
                                            icon="🏛️"
                                            variant="primary"
                                        />
                                        <StatCard
                                            label="Published Sites"
                                            value={analytics.publishedSites.toString()}
                                            icon="✅"
                                            variant="secondary"
                                        />
                                        <StatCard
                                            label="Total Assets"
                                            value={analytics.totalAssets.toString()}
                                            icon="📦"
                                            variant="accent"
                                        />
                                        <StatCard
                                            label="Active Users"
                                            value={analytics.totalUsers.toString()}
                                            icon="👥"
                                            variant="default"
                                        />
                                    </div>
                                </section>

                                {/* Contributions */}
                                <section>
                                    <h2 className="text-2xl font-semibold text-heritage-dark font-serif mb-4">
                                        Contributions
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <StatCard
                                            label="Total Contributions"
                                            value={analytics.totalContributions.toString()}
                                            icon="📝"
                                            variant="default"
                                        />
                                        <StatCard
                                            label="Pending Review"
                                            value={analytics.pendingContributions.toString()}
                                            icon="⏳"
                                            variant="primary"
                                        />
                                    </div>
                                </section>

                                {/* Assets by Type */}
                                <section>
                                    <h2 className="text-2xl font-semibold text-heritage-dark font-serif mb-4">
                                        Assets by Type
                                    </h2>
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        {analytics.assetsByType.length === 0 ? (
                                            <p className="text-gray-500 text-center">No assets yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {analytics.assetsByType.map((asset) => (
                                                    <div key={asset.type} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 bg-heritage-light/30 rounded-lg flex items-center justify-center">
                                                                <span className="text-xl">
                                                                    {asset.type === 'MODEL_3D' ? '📦' :
                                                                        asset.type.includes('PANORAMA') ? '🌐' :
                                                                            asset.type === 'IMAGE' ? '🖼️' :
                                                                                asset.type === 'THUMBNAIL' ? '🖼️' : '📄'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-heritage-dark">
                                                                    {asset.type.replace('_', ' ')}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <div className="text-2xl font-bold text-heritage-secondary">
                                                            {asset.count}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Recent Activity */}
                                {analytics.recentActivity.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-semibold text-heritage-dark font-serif mb-4">
                                            Recent Activity (Last 7 Days)
                                        </h2>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Sites Added
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Assets Uploaded
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {analytics.recentActivity.map((activity) => (
                                                        <tr key={activity.date}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(activity.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {activity.sites}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {activity.assets}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </main>
        </>
    );
}
