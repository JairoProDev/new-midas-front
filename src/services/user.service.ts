import axios from 'axios';
import { User } from '@/types/user';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/users/me`, {
      withCredentials: true,
    });
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.put(`${API_URL}/users/profile`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await axios.put(`${API_URL}/users/change-password`, data, {
      withCredentials: true,
    });
  },

  async getAllUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/users`, {
      withCredentials: true,
    });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/users/${id}/role`,
      { role },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
}; 