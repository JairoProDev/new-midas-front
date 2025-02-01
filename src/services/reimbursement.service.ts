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

export const reimbursementService = {
  async uploadReceipt(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await axiosInstance.post('/uploads/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },

  async createRequest(data: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    receipt: File;
  }): Promise<ReimbursementRequest> {
    // First upload the receipt
    const receiptUrl = await this.uploadReceipt(data.receipt);

    // Then create the reimbursement request
    const response = await axiosInstance.post('/reimbursements', {
      ...data,
      receiptUrl,
    });

    return response.data;
  },

  async getUserRequests(filters?: {
    status?: ReimbursementStatus;
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ReimbursementRequest[]> {
    const response = await axiosInstance.get('/reimbursements/me', {
      params: filters,
    });
    return response.data;
  },

  async getAllRequests(filters?: {
    status?: ReimbursementStatus;
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<ReimbursementRequest[]> {
    const response = await axiosInstance.get('/reimbursements/all', {
      params: filters,
    });
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

  async getExpenseAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'category' | 'status' | 'user' | 'month';
  }) {
    const response = await axiosInstance.get('/reimbursements/analytics', {
      params: filters,
    });
    return response.data;
  },

  async exportReimbursements(format: 'csv' | 'excel', filters?: {
    status?: ReimbursementStatus;
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await axiosInstance.get(`/reimbursements/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reimbursements.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
}; 