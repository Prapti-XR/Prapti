/**
 * Footer Component
 * Site-wide footer with links and information
 */

import Link from 'next/link';
import { FaYoutube, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const navigationLinks = [
        { label: 'Gallery', href: '/images' },
        { label: 'About', href: '/about' },
        { label: 'Trivia', href: '/trivia' },
        { label: 'Profile', href: '/profile' },
    ];

    const socialLinks = [
        { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
        { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
        { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
        { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-white w-full border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-8 md:px-20 py-12">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
                    {/* Navigation Menu - Left */}
                    <nav className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-2 py-4 text-heritage-dark font-medium text-base hover:text-heritage-primary transition-colors rounded-full hover:bg-heritage-light/30"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Logo - Center */}
                    <Link href="/" className="flex items-center justify-center">
                        <h2 className="text-heritage-dark font-bold text-[34px] leading-tight tracking-tight">
                            Prapti
                        </h2>
                    </Link>

                    {/* Social Icons - Right */}
                    <div className="flex items-center justify-center md:justify-end gap-4">
                        {socialLinks.map((social) => {
                            const Icon = social.icon;
                            return (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="text-heritage-dark hover:text-heritage-primary transition-colors"
                                >
                                    <Icon className="w-6 h-6" />
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section - Copyright */}
                <div className="text-center">
                    <p className="text-heritage-dark font-medium text-sm">
                        Prapti @ {currentYear}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
