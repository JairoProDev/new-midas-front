'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      name: 'New Reimbursement',
      description: 'Submit a new reimbursement request',
      href: '/dashboard/reimbursements/new',
      icon: PlusCircleIcon,
      show: user?.role !== 'ADMIN',
    },
    {
      name: 'My Requests',
      description: 'View your reimbursement requests',
      href: '/dashboard/reimbursements',
      icon: DocumentTextIcon,
      show: true,
    },
    {
      name: 'Manage Requests',
      description: 'Review and manage reimbursement requests',
      href: '/dashboard/reimbursements',
      icon: ClipboardDocumentCheckIcon,
      show: user?.role === 'ADMIN',
    },
    {
      name: 'Manage Users',
      description: 'View and manage system users',
      href: '/dashboard/users',
      icon: UserGroupIcon,
      show: user?.role === 'ADMIN',
    },
  ].filter((card) => card.show);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your reimbursement requests
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow-soft-lg hover:shadow-soft-xl transition-all duration-200"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                    <card.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {card.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
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
      </div>
    </div>
  );
} 