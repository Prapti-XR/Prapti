import { Navbar } from '@/components/layout/Navbar';
import { StatCard, ActionCard, ActivityItem } from '@/components';

export default function AdminPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-heritage-dark font-serif mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600">Manage content and site settings</p>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Stats Overview */}
                        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard label="Total Sites" value="0" icon="🏛️" variant="primary" />
                            <StatCard label="3D Models" value="0" icon="📦" variant="secondary" />
                            <StatCard label="360° Images" value="0" icon="🖼️" variant="accent" />
                            <StatCard label="Active Users" value="0" icon="👥" variant="default" />
                        </section>

                        {/* Quick Actions */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Quick Actions
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ActionCard
                                    title="Add New Site"
                                    description="Upload a new heritage site with details"
                                    icon="🏛️"
                                    variant="primary"
                                />
                                <ActionCard
                                    title="Upload 3D Model"
                                    description="Add 3D models to existing sites"
                                    icon="📦"
                                />
                                <ActionCard
                                    title="Upload Images"
                                    description="Add 360° panoramic images"
                                    icon="🖼️"
                                />
                                <ActionCard
                                    title="Manage Users"
                                    description="View and manage user accounts"
                                    icon="👥"
                                />
                                <ActionCard
                                    title="Content Review"
                                    description="Review pending submissions"
                                    icon="📝"
                                />
                                <ActionCard
                                    title="Analytics"
                                    description="View usage statistics"
                                    icon="📊"
                                />
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Recent Activity
                            </h2>
                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                <ActivityItem
                                    title="New site added"
                                    description="Sonda Fort heritage site was added with 3D model"
                                    timestamp="2 hours ago"
                                    iconBg="success"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    }
                                />
                                <ActivityItem
                                    title="360° image uploaded"
                                    description="Panoramic view added to Sahasralinga temple"
                                    timestamp="5 hours ago"
                                    iconBg="primary"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                                <ActivityItem
                                    title="Content updated"
                                    description="Somasagara Temple description was updated"
                                    timestamp="Yesterday"
                                    iconBg="accent"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </section>

                        {/* Content Management */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Content Management
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600">No sites yet</p>
                                <p className="text-sm text-gray-500 mt-2">Start adding heritage sites to populate the platform</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
