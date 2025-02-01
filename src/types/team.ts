import { User } from './user';

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: TeamMember[];
  budget?: TeamBudget;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  joinedAt: string;
  user: User;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  team: Team;
}

export interface TeamBudget {
  id: string;
  teamId: string;
  amount: number;
  currency: string;
  period: 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  status: 'ACTIVE' | 'EXCEEDED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface TeamAnalytics {
  totalExpenses: number;
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  expensesByMember: {
    userId: string;
    userName: string;
    amount: number;
    percentage: number;
  }[];
  expensesByMonth: {
    month: string;
    amount: number;
    trend: number;
  }[];
  budgetUtilization: {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
}

export interface TeamNotification {
  id: string;
  teamId: string;
  type: 'BUDGET_ALERT' | 'NEW_REQUEST' | 'REQUEST_UPDATE' | 'INVITATION';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface TeamPolicy {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  rules: {
    maxAmount?: number;
    requiredApprovers?: number;
    allowedCategories?: string[];
    restrictedCategories?: string[];
    autoApprovalThreshold?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  active: boolean;
} 