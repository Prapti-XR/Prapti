'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    _count: {
        contributions: number;
        uploadedAssets: number;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const result = await response.json();
            setUsers(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            // Refresh the users list
            fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-heritage-secondary text-white';
            case 'MODERATOR':
                return 'bg-heritage-accent text-white';
            case 'CONTRIBUTOR':
                return 'bg-heritage-primary text-heritage-dark';
            default:
                return 'bg-heritage-light text-heritage-dark';
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-heritage-light/30 animate-fade-in">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">
                            User Management
                        </h1>
                        <p className="text-heritage-dark/70">Manage user accounts and roles</p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-primary"></div>
                                <p className="mt-4 text-heritage-dark/70">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="bg-heritage-light/20 rounded-lg p-8 text-center border border-heritage-light/40">
                                <svg className="w-12 h-12 text-heritage-dark/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="text-heritage-dark/70">No users found</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-heritage-light/40 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-heritage-light/40">
                                        <thead className="bg-heritage-light/20">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    Contributions
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    Uploads
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    Joined
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-heritage-dark/60 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-heritage-light/40">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-heritage-light/20">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-heritage-dark">
                                                                {user.name || 'No name'}
                                                            </div>
                                                            <div className="text-sm text-heritage-dark/60">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-heritage-dark/60">
                                                        {user._count.contributions}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-heritage-dark/60">
                                                        {user._count.uploadedAssets}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-heritage-dark/60">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                            className="border border-heritage-light/60 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                                                        >
                                                            <option value="USER">User</option>
                                                            <option value="CONTRIBUTOR">Contributor</option>
                                                            <option value="MODERATOR">Moderator</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
