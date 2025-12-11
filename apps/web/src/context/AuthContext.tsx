import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthContext
 * 
 * Provides global authentication state to the entire application.
 * Manages:
 * 1. User session (Token & User Object) persistence via LocalStorage.
 * 2. Login/Logout functionality.
 * 3. Permission checking (RBAC/PBAC) for UI components.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    /**
     * Checks if the current user has access to a specific feature.
     * 
     * @param permission - The permission string to check (e.g. 'BILLING')
     * @returns true if user has permission OR is an ADMIN.
     */
    const hasPermission = (permission: string) => {
        if (!user) return false;
        // Admin gets all by default? Or rely on stored permissions?
        // Let's rely on stored permissions, but assume Admin has everything if array is missing?
        // Better strict: check user.permissions.
        return user.permissions?.includes(permission) || user.role === 'ADMIN';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
