'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Navbar Component
 * Modern glassmorphic navigation with dropdown menus
 */

interface NavItem {
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    {
        label: 'Gallery',
        children: [
            { label: 'Images', href: '/images' },
            { label: '3D Models', href: '/models' },
            { label: 'Map View', href: '/map' },
        ],
    },
    {
        label: 'About',
        children: [
            { label: 'About Us', href: '/about' },
            { label: 'Documentation', href: '/docs' },
        ],
    },
    {
        label: 'Trivia',
        href: '/trivia',
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

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
            <div className="relative border rounded-full shadow-lg bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-black/5">
                <div className="flex items-center justify-between px-8 py-3">
                    {/* Left section - Gallery & About */}
                    <div className="flex items-center gap-1">
                        {navItems.slice(0, 2).map((item) => (
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
                        className="absolute font-serif text-xl font-semibold transition-colors duration-200 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-heritage-dark hover:text-heritage-primary"
                    >
                        Prapti
                    </Link>

                    {/* Right section - Trivia & Profile */}
                    <div className="flex items-center gap-1">
                        {navItems.slice(2).map((item) => (
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

    return (
        <div
            className="relative"
            onMouseEnter={() => hasDropdown && setHoveredItem(item.label)}
            onMouseLeave={() => hasDropdown && setHoveredItem(null)}
        >
            {/* Main nav item */}
            {item.href ? (
                <Link
                    href={item.href}
                    className={`block px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${isActive
                        ? 'text-heritage-primary bg-heritage-primary/10'
                        : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/50'
                        }`}
                >
                    {item.label}
                </Link>
            ) : (
                <button
                    className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 ${isActive || hoveredItem === item.label
                        ? 'text-heritage-primary bg-heritage-primary/10'
                        : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/50'
                        }`}
                >
                    {item.label}
                </button>
            )}

            {/* Dropdown menu */}
            {hasDropdown && (
                <div
                    className={`absolute top-full left-0 mt-2 min-w-[200px] transition-all duration-200 origin-top ${hoveredItem === item.label
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}
                >
                    <div className="px-1 py-2 border shadow-xl bg-white/90 backdrop-blur-xl border-gray-200/50 rounded-2xl shadow-black/10">
                        {item.children?.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`block px-4 py-2.5 text-sm rounded-xl transition-all duration-150 ${pathname === child.href
                                    ? 'text-heritage-primary bg-heritage-primary/10 font-medium'
                                    : 'text-gray-700 hover:text-heritage-dark hover:bg-gray-100/70'
                                    }`}
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
