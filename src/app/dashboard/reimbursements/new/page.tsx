'use client';

import React from 'react';
import { ReimbursementForm } from '@/components/ReimbursementForm';
import Link from 'next/link';

export default function NewReimbursementPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          New Reimbursement Request
        </h1>
        <Link
          href="/dashboard/reimbursements"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to Requests
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ReimbursementForm />
      </div>
    </div>
  );
} 