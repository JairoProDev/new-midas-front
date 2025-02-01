export enum ReimbursementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  EQUIPMENT = 'EQUIPMENT',
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
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl: string;
  status: ReimbursementStatus;
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: User;
  approvedBy?: User;
  approvedAt?: string;
} 