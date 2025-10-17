import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Prapti - Heritage AR/VR Platform',
    description: 'Experience historical sites and cultural landmarks through immersive AR/VR technology',
    keywords: ['AR', 'VR', 'heritage', 'cultural', 'history', 'monuments', 'WebXR'],
    authors: [{ name: 'Prapti Team' }],
    creator: 'Prapti-XR',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://prapti.app',
        siteName: 'Prapti',
        title: 'Prapti - Heritage AR/VR Platform',
        description: 'Experience historical sites and cultural landmarks through immersive AR/VR technology',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Prapti - Heritage AR/VR Platform',
        description: 'Experience historical sites and cultural landmarks through immersive AR/VR technology',
    },
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans bg-gradient-to-br from-gray-50 via-white to-heritage-light/30 min-h-screen">
                {children}
            </body>
        </html>
    );
}
