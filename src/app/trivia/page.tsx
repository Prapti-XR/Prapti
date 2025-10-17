import { Navbar } from '@/components/layout/Navbar';

export default function TriviaPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-gray-100">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heritage-dark font-serif mb-4 md:mb-6 tracking-tight">
                            Heritage Trivia
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                            Test your knowledge about cultural heritage and historical sites
                        </p>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Coming Soon */}
                        <div className="bg-gradient-to-br from-heritage-light to-gray-50 rounded-lg p-12 md:p-16 text-center border border-gray-200">
                            <div className="text-6xl mb-6">🎮</div>
                            <h2 className="text-2xl md:text-3xl font-bold text-heritage-dark mb-4 font-serif">
                                Coming Soon
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Interactive trivia games and educational challenges are currently in development.
                                Check back soon to test your heritage knowledge!
                            </p>
                        </div>

                        {/* Features Preview */}
                        <section className="space-y-6">
                            <h3 className="text-xl md:text-2xl font-semibold text-heritage-dark font-serif text-center">
                                What's Coming
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                                <FeaturePreview
                                    icon="🧩"
                                    title="Quiz Challenges"
                                    description="Multiple-choice questions about heritage sites"
                                />
                                <FeaturePreview
                                    icon="🏆"
                                    title="Leaderboards"
                                    description="Compete with others and earn achievements"
                                />
                                <FeaturePreview
                                    icon="📚"
                                    title="Learn Mode"
                                    description="Discover facts while you play"
                                />
                                <FeaturePreview
                                    icon="⚡"
                                    title="Quick Play"
                                    description="Fast-paced trivia sessions"
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

function FeaturePreview({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-semibold text-heritage-dark mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );
}
