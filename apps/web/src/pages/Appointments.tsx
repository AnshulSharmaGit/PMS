import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Appointment {
    id: number;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

export const Appointments: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isBookOpen, setIsBookOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        patientName: '',
        doctorName: '',
        date: '',
        time: '',
        notes: ''
    });

    // Fetch appointments
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const res = await client.get('/appointments');
            return res.data as Appointment[];
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return await client.post('/appointments', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setIsBookOpen(false);
            setFormData({ patientName: '', doctorName: '', date: '', time: '', notes: '' });
        }
    });

    // Status update mutation
    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: string }) => {
            return await client.put(`/appointments/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-sky-100 text-sky-700';
            case 'CHECKED_IN': return 'bg-amber-100 text-amber-700';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-slate-100 text-slate-500 line-through';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
                    <button
                        onClick={() => setIsBookOpen(true)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
                    >
                        + Book Appointment
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date & Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Patient</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Doctor</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {appointments?.map((appt) => (
                                <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex flex-col">
                                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                                            <span className="text-sm text-slate-500">{appt.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{appt.patientName}</td>
                                    <td className="px-6 py-4 text-slate-600">Dr. {appt.doctorName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(appt.status)}`}>
                                            {appt.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {appt.status === 'SCHEDULED' && (
                                            <>
                                                <button
                                                    onClick={() => statusMutation.mutate({ id: appt.id, status: 'CHECKED_IN' })}
                                                    className="text-xs px-2 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded border border-amber-200"
                                                >
                                                    Check In
                                                </button>
                                                <button
                                                    onClick={() => statusMutation.mutate({ id: appt.id, status: 'CANCELLED' })}
                                                    className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {appt.status === 'CHECKED_IN' && (
                                            <button
                                                onClick={() => statusMutation.mutate({ id: appt.id, status: 'COMPLETED' })}
                                                className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-200"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {appointments?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        No appointments scheduled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isBookOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Book New Appointment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formData.patientName}
                                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formData.doctorName}
                                    onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                    placeholder="e.g. Smith"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsBookOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
