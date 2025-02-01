'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    ...(user?.role !== 'ADMIN'
      ? [
          {
            name: 'New Reimbursement',
            description: 'Submit a new reimbursement request',
            href: '/dashboard/reimbursements/new',
            icon: PlusCircleIcon,
          },
        ]
      : []),
    {
      name: user?.role === 'ADMIN' ? 'All Requests' : 'My Requests',
      description:
        user?.role === 'ADMIN'
          ? 'View and manage all reimbursement requests'
          : 'View your reimbursement requests',
      href: '/dashboard/reimbursements',
      icon: DocumentTextIcon,
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            name: 'Pending Approvals',
            description: 'Review and approve pending requests',
            href: '/dashboard/reimbursements?status=pending',
            icon: ClipboardDocumentCheckIcon,
          },
          {
            name: 'Manage Users',
            description: 'View and manage user accounts',
            href: '/dashboard/users',
            icon: UserGroupIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {user?.role === 'ADMIN'
            ? 'Manage reimbursement requests and user accounts'
            : 'Track and manage your reimbursement requests'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                {action.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{action.description}</p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
} 