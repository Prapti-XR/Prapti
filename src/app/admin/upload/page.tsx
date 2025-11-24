'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

interface Site {
    id: string;
    name: string;
}

export default function UploadPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const assetType = typeParam === 'model' ? 'MODEL_3D' :
        typeParam === 'image' ? 'IMAGE' :
            typeParam === 'panorama' ? 'PANORAMA_360' : 'IMAGE';

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const response = await fetch('/api/admin/sites');
            if (response.ok) {
                const result = await response.json();
                setSites(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch sites:', err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        formData.append('file', selectedFile);
        formData.append('assetType', assetType);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload asset');
            }

            const result = await response.json();
            router.push(`/site/${formData.get('siteId')}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload asset');
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
                            Upload {typeParam === 'model' ? '3D Model' : typeParam === 'panorama' ? 'Panorama' : 'Image'}
                        </h1>
                        <p className="text-gray-600">Add assets to heritage sites</p>
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
                            {/* Site Selection */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Select Site
                                </h2>

                                <div>
                                    <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Heritage Site *
                                    </label>
                                    <select
                                        id="siteId"
                                        name="siteId"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    >
                                        <option value="">Select a site...</option>
                                        {sites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </section>

                            {/* File Upload */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Upload File
                                </h2>

                                <div>
                                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                                        File *
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={handleFileChange}
                                        accept={
                                            typeParam === 'model' ? '.glb,.gltf' :
                                                typeParam === 'panorama' ? 'image/*' :
                                                    'image/*'
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {typeParam === 'model' ? 'Supported formats: GLB, GLTF' :
                                            typeParam === 'panorama' ? 'Supported formats: JPG, PNG (360° images)' :
                                                'Supported formats: JPG, PNG'}
                                    </p>
                                </div>

                                {selectedFile && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            Selected: <span className="font-medium">{selectedFile.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Asset Details */}
                            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-heritage-dark font-serif">
                                    Asset Details
                                </h2>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="attribution" className="block text-sm font-medium text-gray-700 mb-1">
                                        Attribution
                                    </label>
                                    <input
                                        type="text"
                                        id="attribution"
                                        name="attribution"
                                        placeholder="e.g., Created by John Doe"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
                                        License
                                    </label>
                                    <select
                                        id="license"
                                        name="license"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                    >
                                        <option value="">Select license...</option>
                                        <option value="CC0">CC0 - Public Domain</option>
                                        <option value="CC-BY-4.0">CC BY 4.0</option>
                                        <option value="CC-BY-SA-4.0">CC BY-SA 4.0</option>
                                        <option value="CC-BY-NC-4.0">CC BY-NC 4.0</option>
                                    </select>
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
                                    disabled={loading || !selectedFile}
                                    className="px-6 py-2 bg-heritage-primary text-white rounded-lg hover:bg-heritage-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
