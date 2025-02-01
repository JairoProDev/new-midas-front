export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  company?: string;
} 