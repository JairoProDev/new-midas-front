'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reimbursementService } from '@/services/reimbursement.service';
import { ReimbursementRequest, ReimbursementStatus } from '@/types/reimbursement';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const ReimbursementList: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      if (!user) {
        router.push('/login');
        return;
      }

      const data = user.role === 'ADMIN'
        ? await reimbursementService.getAllRequests()
        : await reimbursementService.getUserRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching reimbursement requests:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
      } else {
        toast.error('Failed to load reimbursement requests');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.role]);

  const handleStatusUpdate = async (
    requestId: string,
    status: ReimbursementStatus,
    feedback?: string,
  ) => {
    try {
      setProcessingId(requestId);
      await reimbursementService.updateRequestStatus(requestId, {
        status,
        feedback,
      });
      toast.success('Request status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
      } else {
        toast.error('Failed to update request status');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeColor = (status: ReimbursementStatus) => {
    switch (status) {
      case ReimbursementStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReimbursementStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ReimbursementStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
        {user.role !== 'ADMIN' && (
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/reimbursements/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create New Request
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            {user.role === 'ADMIN' && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {user.role === 'ADMIN' && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr
              key={request.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/dashboard/reimbursements/${request.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
              {user.role === 'ADMIN' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.user?.firstName} {request.user?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{request.user?.email}</div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(request.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.category.replace(/_/g, ' ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  request.status === ReimbursementStatus.APPROVED
                    ? 'bg-green-100 text-green-800'
                    : request.status === ReimbursementStatus.REJECTED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </td>
              {user.role === 'ADMIN' && request.status === ReimbursementStatus.PENDING && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(request.id, ReimbursementStatus.APPROVED);
                    }}
                    disabled={processingId === request.id}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(request.id, ReimbursementStatus.REJECTED);
                    }}
                    disabled={processingId === request.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 