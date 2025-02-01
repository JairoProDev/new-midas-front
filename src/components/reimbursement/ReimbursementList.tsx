import React from 'react';
import Link from 'next/link';
import { ReimbursementRequest, ReimbursementStatus } from '../../types/reimbursement';

interface Props {
  requests: ReimbursementRequest[];
  isAdmin?: boolean;
  onStatusUpdate?: (
    requestId: string,
    status: ReimbursementStatus,
    feedback?: string,
  ) => Promise<void>;
}

export const ReimbursementList: React.FC<Props> = ({
  requests,
  isAdmin = false,
  onStatusUpdate,
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            {isAdmin && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted By
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(request.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.category.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAmount(request.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    request.status,
                  )}`}
                >
                  {request.status}
                </span>
              </td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.submittedBy.firstName} {request.submittedBy.lastName}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/reimbursements/${request.id}`}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  View Details
                </Link>
                {isAdmin && request.status === ReimbursementStatus.PENDING && (
                  <>
                    <button
                      onClick={() =>
                        onStatusUpdate?.(request.id, ReimbursementStatus.APPROVED)
                      }
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        onStatusUpdate?.(request.id, ReimbursementStatus.REJECTED)
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 