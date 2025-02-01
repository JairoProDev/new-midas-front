import axios from 'axios';
import { Team, TeamMember, TeamInvitation, TeamBudget } from '@/types/team';

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

export const teamService = {
  async createTeam(data: {
    name: string;
    description?: string;
    budget?: {
      amount: number;
      currency: string;
      period: 'month' | 'quarter' | 'year';
    };
  }): Promise<Team> {
    const response = await axiosInstance.post('/teams', data);
    return response.data;
  },

  async getTeams(): Promise<Team[]> {
    const response = await axiosInstance.get('/teams');
    return response.data;
  },

  async getTeamById(id: string): Promise<Team> {
    const response = await axiosInstance.get(`/teams/${id}`);
    return response.data;
  },

  async updateTeam(id: string, data: {
    name?: string;
    description?: string;
    budget?: {
      amount: number;
      currency: string;
      period: 'month' | 'quarter' | 'year';
    };
  }): Promise<Team> {
    const response = await axiosInstance.put(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await axiosInstance.delete(`/teams/${id}`);
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await axiosInstance.get(`/teams/${teamId}/members`);
    return response.data;
  },

  async addTeamMember(teamId: string, data: {
    userId: string;
    role: 'MEMBER' | 'ADMIN';
  }): Promise<TeamMember> {
    const response = await axiosInstance.post(`/teams/${teamId}/members`, data);
    return response.data;
  },

  async updateTeamMember(teamId: string, userId: string, data: {
    role: 'MEMBER' | 'ADMIN';
  }): Promise<TeamMember> {
    const response = await axiosInstance.put(`/teams/${teamId}/members/${userId}`, data);
    return response.data;
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`/teams/${teamId}/members/${userId}`);
  },

  async createInvitation(teamId: string, data: {
    email: string;
    role: 'MEMBER' | 'ADMIN';
    expiresIn?: number;
  }): Promise<TeamInvitation> {
    const response = await axiosInstance.post(`/teams/${teamId}/invitations`, data);
    return response.data;
  },

  async acceptInvitation(invitationId: string): Promise<TeamMember> {
    const response = await axiosInstance.post(`/teams/invitations/${invitationId}/accept`);
    return response.data;
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    await axiosInstance.post(`/teams/invitations/${invitationId}/reject`);
  },

  async getTeamBudget(teamId: string, period?: 'month' | 'quarter' | 'year'): Promise<TeamBudget> {
    const response = await axiosInstance.get(`/teams/${teamId}/budget`, {
      params: { period },
    });
    return response.data;
  },

  async updateTeamBudget(teamId: string, data: {
    amount: number;
    currency: string;
    period: 'month' | 'quarter' | 'year';
  }): Promise<TeamBudget> {
    const response = await axiosInstance.put(`/teams/${teamId}/budget`, data);
    return response.data;
  },

  async getTeamAnalytics(teamId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'category' | 'member' | 'month';
  }) {
    const response = await axiosInstance.get(`/teams/${teamId}/analytics`, {
      params: filters,
    });
    return response.data;
  },
}; 