import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
}

export const AdminUsers: React.FC = () => {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'PHARMACIST'
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await client.get('/users');
            return res.data as User[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return await client.post('/auth/register', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsAddOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'PHARMACIST' });
            alert('User created successfully');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    });

    const updatePermsMutation = useMutation({
        mutationFn: async (data: { id: number, permissions: string[] }) => {
            return await client.put(`/users/${data.id}/permissions`, { permissions: data.permissions });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsPermissionModalOpen(false);
            alert('Permissions updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await client.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            alert('User deleted successfully');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (isLoading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
                    >
                        + Add User
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users?.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-emerald-100 text-emerald-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setSelectedPermissions(u.permissions || []);
                                                    setIsPermissionModalOpen(true);
                                                }}
                                                className="text-sky-600 hover:text-sky-800 font-medium px-3 py-1 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                                            >
                                                Access
                                            </button>
                                            {u.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this user?')) {
                                                            deleteMutation.mutate(u.id);
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>




                {/* Permission Modal */}
                {
                    isPermissionModalOpen && selectedUser && (
                        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Manage Permissions</h2>
                                <p className="text-sm text-slate-500 mb-6">For user: {selectedUser.name}</p>

                                <div className="space-y-3 mb-6">
                                    {['INVENTORY', 'PRESCRIPTIONS', 'APPOINTMENTS', 'BILLING', 'REPORTS', 'USERS'].map(perm => (
                                        <label key={perm} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                                                checked={selectedPermissions.includes(perm)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPermissions([...selectedPermissions, perm]);
                                                    } else {
                                                        setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                                                    }
                                                }}
                                            />
                                            <span className="font-medium text-slate-700 capitalize">{perm.toLowerCase().replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsPermissionModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => updatePermsMutation.mutate({ id: selectedUser.id, permissions: selectedPermissions })}
                                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    isAddOpen && (
                        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Create New User</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Passsword</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="PHARMACIST">Pharmacist</option>
                                            <option value="DOCTOR">Doctor</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SALES_REP">Sales Rep</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddOpen(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
                                        >
                                            Create User
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>
        </div >
    );
};
