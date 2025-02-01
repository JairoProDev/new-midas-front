import axios from 'axios';
import {
  ReimbursementRequest,
  ExpenseCategory,
  ReimbursementStatus,
} from '@/types/reimbursement';

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

export const reimbursementService = {
  async createRequest(data: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    receiptUrl: string;
  }): Promise<ReimbursementRequest> {
    const response = await axiosInstance.post('/reimbursements', data);
    return response.data;
  },

  async getUserRequests(): Promise<ReimbursementRequest[]> {
    const response = await axiosInstance.get('/reimbursements/me');
    return response.data;
  },

  async getAllRequests(): Promise<ReimbursementRequest[]> {
    const response = await axiosInstance.get('/reimbursements/all');
    return response.data;
  },

  async getRequestById(id: string): Promise<ReimbursementRequest> {
    const response = await axiosInstance.get(`/reimbursements/${id}`);
    return response.data;
  },

  async updateRequestStatus(
    id: string,
    data: { status: ReimbursementStatus; feedback?: string },
  ): Promise<ReimbursementRequest> {
    const response = await axiosInstance.put(
      `/reimbursements/${id}/status`,
      data,
    );
    return response.data;
  },
}; 