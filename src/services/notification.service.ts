import axios from 'axios';
import { TeamNotification } from '@/types/team';

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

export interface Notification {
  id: string;
  userId: string;
  type: 'REIMBURSEMENT_STATUS' | 'TEAM_INVITATION' | 'BUDGET_ALERT' | 'COMMENT' | 'MENTION';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  email: {
    reimbursementUpdates: boolean;
    teamInvitations: boolean;
    budgetAlerts: boolean;
    comments: boolean;
    mentions: boolean;
  };
  inApp: {
    reimbursementUpdates: boolean;
    teamInvitations: boolean;
    budgetAlerts: boolean;
    comments: boolean;
    mentions: boolean;
  };
  pushNotifications?: {
    enabled: boolean;
    topics: string[];
  };
}

export const notificationService = {
  async getNotifications(params?: {
    read?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number }> {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  async getTeamNotifications(teamId: string): Promise<TeamNotification[]> {
    const response = await axiosInstance.get(`/teams/${teamId}/notifications`);
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await axiosInstance.put(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await axiosInstance.put('/notifications/read-all');
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await axiosInstance.get('/notifications/preferences');
    return response.data;
  },

  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await axiosInstance.put('/notifications/preferences', preferences);
    return response.data;
  },

  async subscribeToPushNotifications(subscription: PushSubscription): Promise<void> {
    await axiosInstance.post('/notifications/push/subscribe', subscription);
  },

  async unsubscribeFromPushNotifications(): Promise<void> {
    await axiosInstance.post('/notifications/push/unsubscribe');
  },

  async testEmailNotification(): Promise<void> {
    await axiosInstance.post('/notifications/test-email');
  },

  async testPushNotification(): Promise<void> {
    await axiosInstance.post('/notifications/test-push');
  },
}; 