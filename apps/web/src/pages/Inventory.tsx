import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Medicine {
    id: number;
    name: string;
    manufacturer: string;
    batchNumber: string;
    expiryDate: string;
    mrp: number;
    stock: number;
}

export const Inventory: React.FC = () => {
    useAuth();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch medicines
    const { data: medicines, isLoading } = useQuery({
        queryKey: ['medicines'],
        queryFn: async () => {
            const res = await client.get('/medicines');
            return res.data as Medicine[];
        }
    });

    // Add medicine mutation
    const addMedicineMutation = useMutation({
        mutationFn: async (newMedicine: Partial<Medicine>) => {
            return await client.post('/medicines', newMedicine);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            setIsAddModalOpen(false);
        }
    });

    const [formData, setFormData] = useState({
        name: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        mrp: '',
        stock: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMedicineMutation.mutate({
            ...formData,
            mrp: Number(formData.mrp),
            stock: Number(formData.stock)
        });
    };

    if (isLoading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
                    >
                        + Add Medicine
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Medicine Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Manufacturer</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Batch No.</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Expiry</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">MRP</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {medicines?.map((med) => (
                                <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{med.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{med.manufacturer}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{med.batchNumber}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(med.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        ${med.mrp.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                                        {med.stock}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${med.stock > 100
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {med.stock > 100 ? 'In Stock' : 'Low Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Medicine</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.manufacturer}
                                        onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.batchNumber}
                                        onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">MRP</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.mrp}
                                        onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
                                >
                                    Save Medicine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
