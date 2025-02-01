import React, { useState } from 'react';
import { ReimbursementRequest, ReimbursementStatus } from '../../types/reimbursement';

interface Props {
  request: ReimbursementRequest;
  isAdmin?: boolean;
  onStatusUpdate?: (
    requestId: string,
    status: ReimbursementStatus,
    feedback?: string,
  ) => Promise<void>;
}

export const ReimbursementDetail: React.FC<Props> = ({
  request,
  isAdmin = false,
  onStatusUpdate,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: ReimbursementStatus) => {
    switch (status) {
      case ReimbursementStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ReimbursementStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusUpdate = async (status: ReimbursementStatus) => {
    if (!onStatusUpdate) return;
    setIsUpdating(true);
    try {
      await onStatusUpdate(request.id, status, feedback);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Reimbursement Request Details
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Submitted by {request.submittedBy.firstName} {request.submittedBy.lastName}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatAmount(request.amount)}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {request.category.replace('_', ' ')}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {request.description}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  request.status,
                )}`}
              >
                {request.status}
              </span>
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(request.submittedAt)}
            </dd>
          </div>
          {request.approvedAt && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {request.status === ReimbursementStatus.APPROVED
                  ? 'Approved At'
                  : 'Rejected At'}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(request.approvedAt)}
              </dd>
            </div>
          )}
          {request.feedback && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Feedback</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {request.feedback}
              </dd>
            </div>
          )}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Receipt</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a
                href={request.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-900"
              >
                View Receipt
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {isAdmin && request.status === ReimbursementStatus.PENDING && (
        <div className="px-4 py-5 sm:px-6 space-y-4">
          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-700"
            >
              Feedback (optional)
            </label>
            <div className="mt-1">
              <textarea
                id="feedback"
                name="feedback"
                rows={3}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleStatusUpdate(ReimbursementStatus.APPROVED)}
              disabled={isUpdating}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusUpdate(ReimbursementStatus.REJECTED)}
              disabled={isUpdating}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 