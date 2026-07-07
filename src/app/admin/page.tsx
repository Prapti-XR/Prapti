import { Navbar } from '@/components/layout/Navbar';
import { StatCard, ActionCard } from '@/components';

export default function AdminPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="px-4 pt-24 pb-12 border-b border-heritage-light/30 md:pt-32 md:pb-16 md:px-6 animate-fade-in">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="mb-2 font-serif text-4xl font-bold md:text-5xl text-heritage-dark">
                            Admin Dashboard
                        </h1>
                        <p className="text-heritage-dark/70">Manage content and site settings</p>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 py-12 md:px-6 md:py-16">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Stats Overview */}
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                            <StatCard label="Total Sites" value="0" icon="🏛️" variant="primary" />
                            <StatCard label="3D Models" value="0" icon="📦" variant="secondary" />
                            <StatCard label="360° Images" value="0" icon="🖼️" variant="accent" />
                            <StatCard label="Active Users" value="0" icon="👥" variant="default" />
                        </section>

                        {/* Quick Actions */}
                        <section className="space-y-4">
                            <h2 className="font-serif text-2xl font-semibold text-heritage-dark">
                                Quick Actions
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <ActionCard
                                    title="Add New Site"
                                    description="Upload a new heritage site with details"
                                    icon="🏛️"
                                    variant="primary"
                                    href="/admin/sites/new"
                                />
                                <ActionCard
                                    title="Upload 3D Model"
                                    description="Add 3D models to existing sites"
                                    icon="📦"
                                    href="/admin/upload?type=model"
                                />
                                <ActionCard
                                    title="Upload Images"
                                    description="Add 360° panoramic images"
                                    icon="🖼️"
                                    href="/admin/upload?type=image"
                                />
                                <ActionCard
                                    title="Manage Users"
                                    description="View and manage user accounts"
                                    icon="👥"
                                    href="/admin/users"
                                />
                                <ActionCard
                                    title="Content Review"
                                    description="Review pending submissions"
                                    icon="📝"
                                    href="/admin/contributions"
                                />
                                <ActionCard
                                    title="Analytics"
                                    description="View usage statistics"
                                    icon="📊"
                                    href="/admin/analytics"
                                />
                            </div>
                        </section>

                        {/* Content Management */}
                        <section className="space-y-4">
                            <h2 className="font-serif text-2xl font-semibold text-heritage-dark">
                                Content Management
                            </h2>
                            <div className="p-8 text-center border border-heritage-light/40 rounded-lg bg-heritage-light/20">
                                <svg className="w-12 h-12 mx-auto mb-3 text-heritage-dark/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-heritage-dark/70">No sites yet</p>
                                <p className="mt-2 text-sm text-heritage-dark/60">Start adding heritage sites to populate the platform</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
