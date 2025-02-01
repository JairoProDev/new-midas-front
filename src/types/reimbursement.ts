export enum ReimbursementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  SUPPLIES = 'SUPPLIES',
  EQUIPMENT = 'EQUIPMENT',
  SOFTWARE = 'SOFTWARE',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'EMPLOYEE' | 'ADMIN';
  company: string | null;
}

export interface ReimbursementRequest {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl: string;
  status: ReimbursementStatus;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
} 