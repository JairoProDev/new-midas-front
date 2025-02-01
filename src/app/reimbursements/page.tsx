'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReimbursementList } from '../../components/reimbursement/ReimbursementList';
import { reimbursementService } from '../../services/reimbursement.service';
import { ReimbursementRequest, ReimbursementStatus } from '../../types/reimbursement';
import { useAuth } from '../../contexts/auth.context';
import { toast } from 'react-hot-toast';

export default function ReimbursementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ReimbursementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      try {
        const data = user.role === 'ADMIN'
          ? await reimbursementService.getAllRequests()
          : await reimbursementService.getUserRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching reimbursement requests:', error);
        toast.error('Failed to load reimbursement requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, router]);

  const handleStatusUpdate = async (
    requestId: string,
    status: ReimbursementStatus,
    feedback?: string,
  ) => {
    try {
      const updatedRequest = await reimbursementService.updateRequestStatus(
        requestId,
        { status, feedback },
      );
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updatedRequest : req)),
      );
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {user.role === 'ADMIN' ? 'All Reimbursement Requests' : 'My Reimbursement Requests'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {user.role === 'ADMIN'
              ? 'Manage and review reimbursement requests'
              : 'View and track your reimbursement requests'}
          </p>
        </div>
        {user.role !== 'ADMIN' && (
          <Link
            href="/reimbursements/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Request
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
          {user.role !== 'ADMIN' && (
            <div className="mt-6">
              <Link
                href="/reimbursements/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Request
              </Link>
            </div>
          )}
        </div>
      ) : (
        <ReimbursementList
          requests={requests}
          isAdmin={user.role === 'ADMIN'}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
} 