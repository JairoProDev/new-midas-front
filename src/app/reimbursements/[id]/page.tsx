'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReimbursementDetail } from '../../../components/reimbursement/ReimbursementDetail';
import { reimbursementService } from '../../../services/reimbursement.service';
import { ReimbursementRequest, ReimbursementStatus } from '../../../types/reimbursement';
import { useAuth } from '../../../contexts/auth.context';
import { toast } from 'react-hot-toast';

interface Props {
  params: {
    id: string;
  };
}

export default function ReimbursementDetailPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<ReimbursementRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchRequest = async () => {
      try {
        const data = await reimbursementService.getRequestById(params.id);
        setRequest(data);
      } catch (error) {
        console.error('Error fetching reimbursement request:', error);
        toast.error('Failed to load reimbursement request');
        router.push('/reimbursements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [user, router, params.id]);

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
      setRequest(updatedRequest);
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
      <div className="px-4 sm:px-0 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reimbursement Request Details
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage reimbursement request details
            </p>
          </div>
          <Link
            href="/reimbursements"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to List
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : request ? (
        <ReimbursementDetail
          request={request}
          isAdmin={user.role === 'ADMIN'}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Request not found
          </h3>
          <div className="mt-6">
            <Link
              href="/reimbursements"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to List
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 