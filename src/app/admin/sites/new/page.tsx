'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

export default function NewSitePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            location: formData.get('location'),
            latitude: parseFloat(formData.get('latitude') as string),
            longitude: parseFloat(formData.get('longitude') as string),
            country: formData.get('country'),
            city: formData.get('city'),
            era: formData.get('era'),
            yearBuilt: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : null,
            culturalContext: formData.get('culturalContext'),
            historicalFacts: formData.get('historicalFacts'),
            visitingInfo: formData.get('visitingInfo'),
            accessibility: formData.get('accessibility'),
            isPublished: formData.get('isPublished') === 'on',
            isFeatured: formData.get('isFeatured') === 'on',
        };

        try {
            const response = await fetch('/api/admin/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create site');
            }

            const result = await response.json();
            router.push(`/site/${result.data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create site');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">
                            Add New Heritage Site
                        </h1>
                        <p className="text-gray-600">Create a new heritage site entry</p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Basic Information
                                </h2>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="era" className="block text-sm font-medium text-gray-700 mb-1">
                                            Era
                                        </label>
                                        <input
                                            type="text"
                                            id="era"
                                            name="era"
                                            placeholder="e.g., Ancient, Medieval"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                                            Year Built
                                        </label>
                                        <input
                                            type="number"
                                            id="yearBuilt"
                                            name="yearBuilt"
                                            placeholder="e.g., 1632"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Location */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Location
                                </h2>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Location Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                            Latitude *
                                        </label>
                                        <input
                                            type="number"
                                            id="latitude"
                                            name="latitude"
                                            step="any"
                                            required
                                            placeholder="e.g., 27.1751"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                            Longitude *
                                        </label>
                                        <input
                                            type="number"
                                            id="longitude"
                                            name="longitude"
                                            step="any"
                                            required
                                            placeholder="e.g., 78.0421"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Additional Information */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Additional Information
                                </h2>

                                <div>
                                    <label htmlFor="culturalContext" className="block text-sm font-medium text-gray-700 mb-1">
                                        Cultural Context
                                    </label>
                                    <textarea
                                        id="culturalContext"
                                        name="culturalContext"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="historicalFacts" className="block text-sm font-medium text-gray-700 mb-1">
                                        Historical Facts
                                    </label>
                                    <textarea
                                        id="historicalFacts"
                                        name="historicalFacts"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="visitingInfo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Visiting Information
                                    </label>
                                    <textarea
                                        id="visitingInfo"
                                        name="visitingInfo"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="accessibility" className="block text-sm font-medium text-gray-700 mb-1">
                                        Accessibility
                                    </label>
                                    <textarea
                                        id="accessibility"
                                        name="accessibility"
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>
                            </section>

                            {/* Publishing Options */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Publishing Options
                                </h2>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isPublished"
                                            className="w-5 h-5 text-heritage-primary border-gray-300 rounded focus:ring-heritage-primary"
                                        />
                                        <span className="text-sm text-gray-700">Publish immediately</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            className="w-5 h-5 text-heritage-primary border-gray-300 rounded focus:ring-heritage-primary"
                                        />
                                        <span className="text-sm text-gray-700">Feature this site</span>
                                    </label>
                                </div>
                            </section>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-heritage-primary text-white rounded-lg hover:bg-heritage-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Create Site'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
