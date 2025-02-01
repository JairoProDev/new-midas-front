"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'EMPLOYEE' | 'ADMIN';
  company: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Export the context so it can be imported in useAuth
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshUser = async () => {
    await checkAuth();
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
  }) => {
    try {
      await axiosInstance.post('/auth/register', data);
      toast.success('Registration successful. Please verify your email.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear token and user data regardless of API call success
      localStorage.removeItem('token');
      setUser(null);
      
      // Try to call logout endpoint, but don't wait for it
      await axiosInstance.post('/auth/logout').catch(() => {
        // Ignore error if endpoint doesn't exist
      });
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      // Even if there's an error, we still want to clear local state
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      toast.success('Password reset instructions sent to your email');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to send reset instructions');
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        password,
      });
      toast.success('Password reset successful');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to reset password');
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await axiosInstance.post('/auth/verify-email', { token });
      toast.success('Email verified successfully');
      await checkAuth();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to verify email');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 