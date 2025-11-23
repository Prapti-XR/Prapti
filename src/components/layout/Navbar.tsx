'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Navbar Component
 * Modern glassmorphic navigation with dropdown menus, mobile support, and smooth animations
 */

interface NavItem {
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    // Left section (before Prapti logo)
    {
        label: 'Gallery',
        children: [
            { label: '360° Images', href: '/images' },
            { label: '3D Models', href: '/models' },
        ],
    },
    {
        label: 'Heritage Map',
        href: '/map',
    },
    {
        label: 'Site Details',
        href: '/site',
    },
    // Right section (after Prapti logo)
    {
        label: 'Trivia',
        href: '/trivia',
    },
    {
        label: 'About',
        children: [
            { label: 'About Us', href: '/about' },
            { label: 'Walkthrough', href: '/doc' },
        ],
    },
    {
        label: 'Profile',
        children: [
            { label: 'My Profile', href: '/profile' },
            { label: 'Sign Up', href: '/auth/signup' },
            { label: 'Sign In', href: '/auth/signin' },
        ],
    },
];

export function Navbar() {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Desktop Navigation */}
            <nav 
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl hidden md:block transition-all duration-300 ${
                    scrolled ? 'top-4' : 'top-6'
                }`}
                aria-label="Main navigation"
            >
                <div className={`relative border rounded-full shadow-lg bg-white/70 backdrop-blur-xl border-gray-200/50 transition-all duration-300 ${
                    scrolled ? 'shadow-xl shadow-black/10' : 'shadow-black/5'
                }`}>
                    <div className="relative flex items-center px-10 py-4">
                        {/* Left section - Gallery, Heritage Map, Site Details */}
                        <div className="flex items-center gap-3 flex-1 justify-start">
                            {navItems.slice(0, 3).map((item) => (
                                <NavItemComponent
                                    key={item.label}
                                    item={item}
                                    pathname={pathname}
                                    hoveredItem={hoveredItem}
                                    setHoveredItem={setHoveredItem}
                                />
                            ))}
                        </div>

                        {/* Center - Prapti Logo/Home */}
                        <Link
                            href="/"
                            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl font-semibold transition-all duration-200 text-heritage-dark hover:text-heritage-primary hover:scale-105 px-8"
                            aria-label="Prapti Home"
                        >
                            Prapti
                        </Link>

                        {/* Right section - Trivia, About, Profile */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            {navItems.slice(3).map((item) => (
                                <NavItemComponent
                                    key={item.label}
                                    item={item}
                                    pathname={pathname}
                                    hoveredItem={hoveredItem}
                                    setHoveredItem={setHoveredItem}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 md:hidden" aria-label="Mobile navigation">
                <div className="flex items-center justify-between px-4 py-3 border-b shadow-md bg-white/90 backdrop-blur-xl border-gray-200/50">
                    {/* Prapti Logo */}
                    <Link
                        href="/"
                        className="text-xl font-semibold transition-colors duration-200 font-serif text-heritage-dark hover:text-heritage-primary"
                        aria-label="Prapti Home"
                    >
                        Prapti
                    </Link>

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 transition-colors rounded-lg text-heritage-dark hover:bg-heritage-light/30"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <div className="relative w-6 h-5">
                            <span
                                className={`absolute w-6 h-0.5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? 'top-2 rotate-45' : 'top-0'
                                }`}
                            />
                            <span
                                className={`absolute top-2 w-6 h-0.5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                            <span
                                className={`absolute w-6 h-0.5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? 'top-2 -rotate-45' : 'top-4'
                                }`}
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm top-[60px]" />
                )}

                {/* Mobile Menu Panel */}
                <div
                    ref={mobileMenuRef}
                    className={`fixed top-[60px] left-0 right-0 bg-white shadow-xl border-b border-gray-200 transition-all duration-300 overflow-y-auto max-h-[calc(100vh-60px)] ${
                        mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                    }`}
                >
                    <div className="px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <MobileNavItem key={item.label} item={item} pathname={pathname} />
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}

interface NavItemComponentProps {
    item: NavItem;
    pathname: string;
    hoveredItem: string | null;
    setHoveredItem: (label: string | null) => void;
}

function NavItemComponent({ item, pathname, hoveredItem, setHoveredItem }: NavItemComponentProps) {
    const isActive = item.href === pathname || item.children?.some((child) => child.href === pathname);
    const hasDropdown = !!item.children;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsDropdownOpen(hoveredItem === item.label);
    }, [hoveredItem, item.label]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (hasDropdown) {
                setHoveredItem(hoveredItem === item.label ? null : item.label);
            }
        } else if (e.key === 'Escape') {
            setHoveredItem(null);
        }
    };

    const handleMouseEnter = () => {
        if (hasDropdown) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setHoveredItem(item.label);
        }
    };

    const handleMouseLeave = () => {
        if (hasDropdown) {
            // Delay closing to allow moving to dropdown
            timeoutRef.current = setTimeout(() => {
                setHoveredItem(null);
            }, 150);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main nav item */}
            {item.href ? (
                <Link
                    href={item.href}
                    className={`block px-5 py-2 text-base rounded-full transition-all duration-200 ${
                        isActive
                            ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                            : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {item.label}
                </Link>
            ) : (
                <button
                    className={`flex items-center gap-2 px-5 py-2 text-base rounded-full transition-all duration-200 ${
                        isActive || hoveredItem === item.label
                            ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                            : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/50'
                    }`}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                >
                    <span>{item.label}</span>
                    {hasDropdown && (
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                                isDropdownOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            )}

            {/* Dropdown menu */}
            {hasDropdown && (
                <div
                    className={`absolute top-full left-0 mt-2 min-w-[240px] transition-all duration-200 origin-top ${
                        isDropdownOpen
                            ? 'opacity-100 scale-100 translate-y-0 visible'
                            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="px-1 py-2 border shadow-xl bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-2xl shadow-black/10">
                        {item.children?.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`block px-5 py-3 text-base rounded-xl transition-all duration-150 ${
                                    pathname === child.href
                                        ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                                        : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/70'
                                }`}
                                role="menuitem"
                                tabIndex={isDropdownOpen ? 0 : -1}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Mobile Navigation Item Component
interface MobileNavItemProps {
    item: NavItem;
    pathname: string;
}

function MobileNavItem({ item, pathname }: MobileNavItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isActive = item.href === pathname || item.children?.some((child) => child.href === pathname);
    const hasChildren = !!item.children;

    return (
        <div className="space-y-1">
            {item.href ? (
                <Link
                    href={item.href}
                    className={`block px-4 py-3 text-base rounded-xl transition-all duration-200 ${
                        isActive
                            ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {item.label}
                </Link>
            ) : (
                <>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive || isExpanded
                                ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-expanded={isExpanded}
                    >
                        <span className="text-base">{item.label}</span>
                        {hasChildren && (
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>

                    {/* Mobile Submenu */}
                    {hasChildren && (
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="pt-1 pl-4 space-y-1">
                                {item.children?.map((child) => (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                            pathname === child.href
                                                ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                                                : 'text-gray-600 hover:text-heritage-dark hover:bg-gray-100'
                                        }`}
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
