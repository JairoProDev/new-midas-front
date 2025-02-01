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

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axiosInstance.post('/auth/refresh');
        const { token } = refreshResponse.data;
        
        // Update the token in localStorage
        localStorage.setItem('token', token);
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, only then logout
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'EMPLOYEE' | 'ADMIN';
  company: string | null;
  preferences?: {
    notifications: boolean;
    theme: string;
    language: string;
  };
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
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
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
        setIsLoading(false);
        return;
      }
      
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      // Don't remove token here, let the interceptor handle 401s
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

  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      const response = await axiosInstance.patch('/auth/preferences', { preferences });
      setUser(response.data);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
      throw error;
    }
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
      // Try to call logout endpoint first
      await axiosInstance.post('/auth/logout');
      
      // Then clear local state
      localStorage.removeItem('token');
      setUser(null);
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
        updateUserPreferences,
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