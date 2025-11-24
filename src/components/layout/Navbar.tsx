'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

/**
 * Navbar Component with Authentication
 * Modern glassmorphic navigation with auth state and role-based menus
 */

interface NavItem {
    label: string;
    href?: string;
    children?: { label: string; href: string }[];
}

export function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navItems: NavItem[] = [
        {
            label: 'Gallery',
            children: [
                { label: '360° Images', href: '/images' },
                { label: '3D Models', href: '/models' },
            ],
        },
        { label: 'Heritage Map', href: '/map' },
        { label: 'Site Details', href: '/site' },
        { label: 'Trivia', href: '/trivia' },
        {
            label: 'About',
            children: [
                { label: 'About Us', href: '/about' },
                { label: 'Walkthrough', href: '/doc' },
            ],
        },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    const getUserMenuItems = () => {
        const items = [{ label: 'My Profile', href: '/profile', icon: '👤' }];
        if (session?.user?.role === 'ADMIN') {
            items.push({ label: 'Admin Dashboard', href: '/admin', icon: '⚙️' });
        }
        if (session?.user?.role === 'MODERATOR' || session?.user?.role === 'ADMIN') {
            items.push({ label: 'Moderation', href: '/admin/moderation', icon: '🛡️' });
        }
        items.push({ label: 'Sign Out', href: '#', icon: '🚪' });
        return items;
    };

    return (
        <>
            <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl hidden md:block transition-all duration-300 ${scrolled ? 'top-4' : 'top-6'}`}>
                <div className={`relative border rounded-full shadow-lg bg-white/70 backdrop-blur-xl border-gray-200/50 transition-all duration-300 ${scrolled ? 'shadow-xl shadow-black/10' : 'shadow-black/5'}`}>
                    <div className="relative flex items-center px-10 py-4">
                        <div className="flex items-center justify-start flex-1 gap-3">
                            {navItems.slice(0, 3).map((item) => (
                                <NavItemComponent key={item.label} item={item} pathname={pathname} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} />
                            ))}
                        </div>
                        <Link href="/" className="absolute px-8 font-serif text-2xl font-semibold transition-all duration-200 -translate-x-1/2 left-1/2 text-heritage-dark hover:text-heritage-primary hover:scale-105">
                            Prapti
                        </Link>
                        <div className="flex items-center justify-end flex-1 gap-3">
                            {navItems.slice(3).map((item) => (
                                <NavItemComponent key={item.label} item={item} pathname={pathname} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} />
                            ))}
                            {status === 'loading' ? (
                                <div className="w-8 h-8 rounded-full bg-heritage-light/30 animate-pulse" />
                            ) : session ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 transition-all duration-200 rounded-full hover:bg-heritage-light/50">
                                        <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-heritage-primary/20 text-heritage-dark">
                                            {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 z-50 w-56 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold truncate text-heritage-dark">{session.user.name || 'User'}</p>
                                                <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                                                <p className="mt-1 text-xs capitalize text-heritage-primary">{session.user.role?.toLowerCase()}</p>
                                            </div>
                                            {getUserMenuItems().map((item) => (
                                                item.label === 'Sign Out' ? (
                                                    <button key={item.label} onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center w-full gap-2 px-4 py-2 text-left transition-colors hover:bg-heritage-light/30">
                                                        <span>{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </button>
                                                ) : (
                                                    <Link key={item.label} href={item.href} className="flex items-center block gap-2 px-4 py-2 transition-colors hover:bg-heritage-light/30">
                                                        <span>{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium transition-colors text-heritage-dark hover:text-heritage-primary">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium transition-colors rounded-full bg-heritage-primary text-heritage-dark hover:bg-heritage-primary/90">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b shadow-md bg-white/90 backdrop-blur-xl border-gray-200/50">
                    <Link href="/" className="font-serif text-xl font-semibold text-heritage-dark">Prapti</Link>
                    <div className="flex items-center gap-3">
                        {session && (
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-1">
                                <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-heritage-primary/20">
                                    {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </button>
                        )}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 transition-colors rounded-lg">
                            <div className="relative w-6 h-5">
                                <span className={`absolute w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-2 rotate-45' : 'top-0'}`} />
                                <span className={`absolute top-2 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                                <span className={`absolute w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
                            </div>
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div ref={mobileMenuRef} className="fixed inset-x-0 top-[60px] bottom-0 bg-white shadow-xl overflow-y-auto">
                        <div className="px-4 py-6 space-y-2">
                            {navItems.map((item) => (
                                <MobileNavItem key={item.label} item={item} pathname={pathname} />
                            ))}
                            {!session ? (
                                <div className="pt-4 space-y-2 border-t border-gray-200">
                                    <Link href="/auth/signin" className="block px-4 py-3 font-medium text-center border rounded-lg border-heritage-primary text-heritage-primary">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/signup" className="block px-4 py-3 font-medium text-center rounded-lg bg-heritage-primary text-heritage-dark">
                                        Sign Up
                                    </Link>
                                </div>
                            ) : (
                                <div className="pt-4 space-y-2 border-t border-gray-200">
                                    {getUserMenuItems().map((item) => (
                                        item.label === 'Sign Out' ? (
                                            <button key={item.label} onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center w-full gap-2 px-4 py-3 text-left rounded-lg hover:bg-heritage-light/30">
                                                <span>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </button>
                                        ) : (
                                            <Link key={item.label} href={item.href} className="flex items-center block gap-2 px-4 py-3 rounded-lg hover:bg-heritage-light/30">
                                                <span>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

function NavItemComponent({ item, pathname, hoveredItem, setHoveredItem }: any) {
    const isActive = item.href === pathname || item.children?.some((child: any) => child.href === pathname);
    if (item.children) {
        return (
            <div className="relative" onMouseEnter={() => setHoveredItem(item.label)} onMouseLeave={() => setHoveredItem(null)}>
                <button className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive ? 'bg-heritage-primary/20 text-heritage-primary' : 'text-heritage-dark hover:bg-heritage-light/50'}`}>
                    {item.label}
                </button>
                {hoveredItem === item.label && (
                    <div className="absolute left-0 z-50 w-48 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                        {item.children.map((child: any) => (
                            <Link key={child.href} href={child.href} className="block px-4 py-2 text-sm transition-colors hover:bg-heritage-light/30">
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return (
        <Link href={item.href || '/'} className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive ? 'bg-heritage-primary/20 text-heritage-primary' : 'text-heritage-dark hover:bg-heritage-light/50'}`}>
            {item.label}
        </Link>
    );
}

function MobileNavItem({ item, pathname }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = item.href === pathname || item.children?.some((child: any) => child.href === pathname);
    if (item.children) {
        return (
            <div>
                <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-heritage-primary/20 text-heritage-primary' : 'hover:bg-heritage-light/30'}`}>
                    <span className="font-medium">{item.label}</span>
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="pl-4 mt-1 space-y-1">
                        {item.children.map((child: any) => (
                            <Link key={child.href} href={child.href} className={`block px-4 py-2 rounded-lg text-sm ${pathname === child.href ? 'bg-heritage-primary/10 text-heritage-primary' : 'hover:bg-heritage-light/20'}`}>
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return (
        <Link href={item.href || '/'} className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-heritage-primary/20 text-heritage-primary' : 'hover:bg-heritage-light/30'}`}>
            {item.label}
        </Link>
    );
}

export default Navbar;
