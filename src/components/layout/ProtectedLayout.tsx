'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from './Navigation';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedLayout: React.FC<Props> = ({
  children,
  requireAdmin = false,
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && requireAdmin && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}; 