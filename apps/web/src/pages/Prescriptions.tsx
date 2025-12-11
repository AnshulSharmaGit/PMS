import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Medicine {
    id: number;
    name: string;
}

interface PrescriptionItem {
    medicineId: number;
    medicineName: string;
    dosage: string;
    duration: string;
    quantity: number;
}

export const Prescriptions: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [patientName, setPatientName] = useState('');

    const [currentItem, setCurrentItem] = useState({
        medicineId: 0,
        dosage: '',
        duration: '',
        quantity: 0
    });

    const [items, setItems] = useState<PrescriptionItem[]>([]);

    // Fetch medicines for selection
    const { data: medicines } = useQuery({
        queryKey: ['medicines'],
        queryFn: async () => {
            const res = await client.get('/medicines');
            return res.data as Medicine[];
        }
    });

    // Fetch prescriptions
    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: async () => {
            const res = await client.get('/prescriptions');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return await client.post('/prescriptions', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            setIsCreateOpen(false);
            setItems([]);
            setPatientName('');
        }
    });

    const fulfillMutation = useMutation({
        mutationFn: async (id: number) => {
            return await client.put(`/prescriptions/${id}/fulfill`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        }
    });

    const addItem = () => {
        if (!currentItem.medicineId) return;
        const med = medicines?.find(m => m.id === Number(currentItem.medicineId));
        if (!med) return;

        setItems([...items, {
            ...currentItem,
            medicineId: Number(currentItem.medicineId),
            medicineName: med.name,
            quantity: Number(currentItem.quantity)
        }]);

        setCurrentItem({
            medicineId: 0,
            dosage: '',
            duration: '',
            quantity: 0
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            patientName,
            doctorName: user?.name,
            items
        });
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Prescriptions</h1>
                    {user?.role === 'ADMIN' || user?.role === 'DOCTOR' ? (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
                        >
                            + Write Prescription
                        </button>
                    ) : null}
                </div>

                <div className="grid gap-6">
                    {prescriptions?.map((prescription: any) => (
                        <div key={prescription.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Patient: {prescription.patientName}</h3>
                                    <p className="text-slate-500 text-sm">Doctor: Dr. {prescription.doctorName}</p>
                                    <p className="text-slate-400 text-xs mt-1">ID: #{prescription.id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${prescription.status === 'FULFILLED'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {prescription.status}
                                    </span>
                                    {prescription.status === 'PENDING' && (
                                        <button
                                            onClick={() => fulfillMutation.mutate(prescription.id)}
                                            className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-500 transition-colors"
                                        >
                                            Mark Fulfilled
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="pb-2">Medicine</th>
                                            <th className="pb-2">Dosage</th>
                                            <th className="pb-2">Duration</th>
                                            <th className="pb-2 text-right">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {prescription.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-2 font-medium text-slate-700">{item.medicineName}</td>
                                                <td className="py-2 text-slate-600">{item.dosage}</td>
                                                <td className="py-2 text-slate-600">{item.duration}</td>
                                                <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">New Prescription</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={patientName}
                                    onChange={e => setPatientName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="border-t border-b border-slate-100 py-4 space-y-4">
                                <h3 className="font-medium text-slate-700">Add Items</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-1">
                                        <select
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm"
                                            value={currentItem.medicineId}
                                            onChange={e => setCurrentItem({ ...currentItem, medicineId: Number(e.target.value) })}
                                        >
                                            <option value={0}>Select Med</option>
                                            {medicines?.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        className="col-span-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Dosage (e.g. 1-0-1)"
                                        value={currentItem.dosage}
                                        onChange={e => setCurrentItem({ ...currentItem, dosage: e.target.value })}
                                    />
                                    <input
                                        className="col-span-1 px-2 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Duration (e.g. 5 days)"
                                        value={currentItem.duration}
                                        onChange={e => setCurrentItem({ ...currentItem, duration: e.target.value })}
                                    />
                                    <div className="col-span-1 flex gap-2">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Qty"
                                            value={currentItem.quantity || ''}
                                            onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                        />
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="px-3 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {items.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.medicineName} ({item.dosage})</span>
                                                <span className="text-slate-500">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={items.length === 0}
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50"
                                >
                                    Issue Prescription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
