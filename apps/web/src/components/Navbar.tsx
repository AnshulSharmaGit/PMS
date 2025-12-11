import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
    const { user, logout, hasPermission } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', show: true },
        { label: 'Inventory', path: '/inventory', show: hasPermission('INVENTORY') },
        { label: 'Prescriptions', path: '/prescriptions', show: hasPermission('PRESCRIPTIONS') },
        { label: 'Appointments', path: '/appointments', show: hasPermission('APPOINTMENTS') },
        { label: 'POS / Billing', path: '/billing', show: hasPermission('BILLING') },
        { label: 'Reports', path: '/reports', show: hasPermission('REPORTS') },
        { label: 'Users', path: '/users', show: hasPermission('USERS') },
    ].filter(item => item.show);

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-sky-600">PharmacyOS</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(item.path)
                                        ? 'border-sky-500 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-slate-600 mr-4">
                            {user.name} ({user.role})
                        </span>
                        <button
                            onClick={logout}
                            className="text-slate-500 hover:text-red-600 text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
