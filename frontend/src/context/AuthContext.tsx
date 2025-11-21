import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUser(parsed);
            setToken(parsed.token);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await authAPI.login({ email, password });
            const userData: AuthResponse = data;

            setUser({
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
            });
            setToken(userData.token);

            localStorage.setItem('userInfo', JSON.stringify(userData));
            toast.success('Login successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, avatar?: string) => {
        try {
            const { data } = await authAPI.register({ name, email, password, avatar });
            const userData: AuthResponse = data;

            setUser({
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
            });
            setToken(userData.token);

            localStorage.setItem('userInfo', JSON.stringify(userData));
            toast.success('Registration successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('userInfo');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
