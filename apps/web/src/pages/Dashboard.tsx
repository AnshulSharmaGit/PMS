import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Link to="/reports" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                            View Reports
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Sales</h3>
                        <p className="text-3xl font-bold text-emerald-600">$12,450</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Prescriptions</h3>
                        <p className="text-3xl font-bold text-sky-600">45</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Low Stock</h3>
                        <p className="text-3xl font-bold text-amber-600">8 Items</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
