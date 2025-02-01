import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
      ? 'bg-indigo-700 text-white'
      : 'text-white hover:bg-indigo-500 hover:bg-opacity-75';
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Midas
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    '/dashboard',
                  )}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/reimbursements"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    '/reimbursements',
                  )}`}
                >
                  {user.role === 'ADMIN'
                    ? 'Manage Reimbursements'
                    : 'My Reimbursements'}
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-white text-sm mr-4">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={logout}
                    className="text-white hover:bg-indigo-500 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(
              '/dashboard',
            )}`}
          >
            Dashboard
          </Link>
          <Link
            href="/reimbursements"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(
              '/reimbursements',
            )}`}
          >
            {user.role === 'ADMIN'
              ? 'Manage Reimbursements'
              : 'My Reimbursements'}
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-indigo-700">
          <div className="px-2 space-y-1">
            <div className="px-3 py-2 text-white">
              {user.firstName} {user.lastName}
            </div>
            <button
              onClick={logout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 