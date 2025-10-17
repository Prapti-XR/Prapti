import { Navbar } from '@/components/layout/Navbar';

export default function ProfilePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-heritage-dark font-serif mb-2">
                                    User Name
                                </h1>
                                <p className="text-gray-600">user@example.com</p>
                            </div>
                            <button className="px-6 py-2 bg-white text-heritage-dark rounded-lg font-medium border border-gray-200 hover:border-heritage-dark transition-colors w-full md:w-auto">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Stats */}
                        <section className="grid grid-cols-3 gap-4">
                            <StatCard label="Sites Visited" value="0" />
                            <StatCard label="Favorites" value="0" />
                            <StatCard label="Points" value="0" />
                        </section>

                        {/* Recent Activity */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Recent Activity
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600">No recent activity</p>
                                <p className="text-sm text-gray-500 mt-2">Start exploring heritage sites to see your activity here</p>
                            </div>
                        </section>

                        {/* Favorites */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Favorite Sites
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <p className="text-gray-600">No favorites yet</p>
                                <p className="text-sm text-gray-500 mt-2">Save your favorite heritage sites for quick access</p>
                            </div>
                        </section>

                        {/* Settings */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Settings
                            </h2>
                            <div className="space-y-3">
                                <SettingItem label="Email Notifications" />
                                <SettingItem label="AR Mode by Default" />
                                <SettingItem label="Show Location on Map" />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl md:text-3xl font-bold text-heritage-dark mb-1">{value}</div>
            <div className="text-xs md:text-sm text-gray-600">{label}</div>
        </div>
    );
}

function SettingItem({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <span className="text-gray-700">{label}</span>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
            </button>
        </div>
    );
}
