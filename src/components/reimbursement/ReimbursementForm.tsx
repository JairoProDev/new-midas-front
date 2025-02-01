import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ExpenseCategory } from '../../types/reimbursement';
import { reimbursementService } from '../../services/reimbursement.service';
import { toast } from 'react-hot-toast';

export const ReimbursementForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: ExpenseCategory.OTHER,
    description: '',
    receiptUrl: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    // TODO: Implement file upload to your storage service
    // For now, we'll just store the file name
    setFormData((prev) => ({ ...prev, receiptUrl: file.name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await reimbursementService.createRequest({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Reimbursement request submitted successfully');
      router.push('/reimbursements');
    } catch (error) {
      toast.error('Failed to submit reimbursement request');
      console.error('Error submitting reimbursement request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <div className="mt-1">
          <input
            type="number"
            step="0.01"
            name="amount"
            id="amount"
            required
            value={formData.amount}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <div className="mt-1">
          <select
            name="category"
            id="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            {Object.values(ExpenseCategory).map((category) => (
              <option key={category} value={category}>
                {category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            name="description"
            id="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Describe your expense..."
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="receipt"
          className="block text-sm font-medium text-gray-700"
        >
          Receipt
        </label>
        <div className="mt-1">
          <input
            type="file"
            name="receipt"
            id="receipt"
            required
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}; 