'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reimbursementService } from '@/services/reimbursement.service';
import { ReimbursementRequest, ReimbursementStatus } from '@/types/reimbursement';
import { toast } from 'react-hot-toast';

export const ReimbursementList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = user?.role === 'ADMIN'
        ? await reimbursementService.getAllRequests()
        : await reimbursementService.getUserRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching reimbursement requests:', error);
      toast.error('Failed to load reimbursement requests');
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
      toast.error('Failed to update request status');
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
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reimbursement requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {user?.role === 'ADMIN' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${request.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.category.replace(/_/g, ' ')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {request.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                    request.status,
                  )}`}
                >
                  {request.status}
                </span>
              </td>
              {user?.role === 'ADMIN' && request.status === ReimbursementStatus.PENDING && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() =>
                      handleStatusUpdate(request.id, ReimbursementStatus.APPROVED)
                    }
                    disabled={!!processingId}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(request.id, ReimbursementStatus.REJECTED)
                    }
                    disabled={!!processingId}
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