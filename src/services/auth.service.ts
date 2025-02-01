import axios from 'axios';
import { User } from '@/types/user';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true },
    );
    return response.data;
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
  }): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/register`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  },

  async verifyEmail(token: string): Promise<void> {
    await axios.post(
      `${API_URL}/auth/verify-email`,
      { token },
      {
        withCredentials: true,
      },
    );
  },

  async forgotPassword(email: string): Promise<void> {
    await axios.post(
      `${API_URL}/auth/forgot-password`,
      { email },
      {
        withCredentials: true,
      },
    );
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(
      `${API_URL}/auth/reset-password`,
      { token, newPassword },
      {
        withCredentials: true,
      },
    );
  },

  async refreshToken(): Promise<User> {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
}; 