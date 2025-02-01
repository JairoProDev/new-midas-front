import axios from 'axios';
import {
  ReimbursementRequest,
  ExpenseCategory,
  ReimbursementStatus,
} from '@/types/reimbursement';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

export const reimbursementService = {
  async createRequest(data: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    receiptUrl: string;
  }): Promise<ReimbursementRequest> {
    const response = await axios.post(`${API_URL}/reimbursements`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  async getUserRequests(): Promise<ReimbursementRequest[]> {
    const response = await axios.get(`${API_URL}/reimbursements/me`, {
      withCredentials: true,
    });
    return response.data;
  },

  async getAllRequests(): Promise<ReimbursementRequest[]> {
    const response = await axios.get(`${API_URL}/reimbursements/all`, {
      withCredentials: true,
    });
    return response.data;
  },

  async getRequestById(id: string): Promise<ReimbursementRequest> {
    const response = await axios.get(`${API_URL}/reimbursements/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  async updateRequestStatus(
    id: string,
    data: { status: ReimbursementStatus; feedback?: string },
  ): Promise<ReimbursementRequest> {
    const response = await axios.put(
      `${API_URL}/reimbursements/${id}/status`,
      data,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
}; 