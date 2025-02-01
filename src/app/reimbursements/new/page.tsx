'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReimbursementForm } from '../../../components/reimbursement/ReimbursementForm';
import { useAuth } from '../../../contexts/auth.context';

export default function NewReimbursementPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'ADMIN') {
      router.push('/reimbursements');
    }
  }, [user, router]);

  if (!user || user.role === 'ADMIN') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          New Reimbursement Request
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit a new reimbursement request for approval
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ReimbursementForm />
        </div>
      </div>
    </div>
  );
} 