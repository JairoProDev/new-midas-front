'use client';

import React from 'react';
import { ReimbursementList } from '@/components/ReimbursementList';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ReimbursementsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'ADMIN'
              ? 'All Reimbursement Requests'
              : 'My Reimbursement Requests'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {user?.role === 'ADMIN'
              ? 'Manage and review all reimbursement requests'
              : 'View and track your reimbursement requests'}
          </p>
        </div>
        {user?.role !== 'ADMIN' && (
          <Link
            href="/dashboard/reimbursements/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Request
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ReimbursementList />
      </div>
    </div>
  );
} 