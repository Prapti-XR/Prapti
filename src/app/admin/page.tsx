import { Navbar } from '@/components/layout/Navbar';

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
                            <StatCard label="Total Sites" value="0" icon="🏛️" />
                            <StatCard label="3D Models" value="0" icon="📦" />
                            <StatCard label="360° Images" value="0" icon="🖼️" />
                            <StatCard label="Active Users" value="0" icon="👥" />
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
                                    icon="+"
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
                                {[1, 2, 3].map((item) => (
                                    <ActivityItem key={item} />
                                ))}
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <div className="text-3xl font-bold text-heritage-dark">{value}</div>
            </div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
}

function ActionCard({ title, description, icon }: { title: string; description: string; icon: string }) {
    return (
        <button className="text-left bg-white p-6 rounded-lg border border-gray-200 hover:border-heritage-primary transition-all duration-200 hover:shadow-md">
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-heritage-dark mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </button>
    );
}

function ActivityItem() {
    return (
        <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                    <span className="font-medium">Activity description</span> • Content action performed
                </p>
                <p className="text-xs text-gray-500 mt-1">Just now</p>
            </div>
        </div>
    );
}
