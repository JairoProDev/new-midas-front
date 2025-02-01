'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ExpenseCategory } from '@/types/reimbursement';
import { reimbursementService } from '@/services/reimbursement.service';
import { toast } from 'react-hot-toast';

interface FormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  receipt: FileList;
}

export const ReimbursementForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Handle file upload first
      const file = data.receipt[0];
      if (!file) {
        toast.error('Please attach a receipt');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // TODO: Implement file upload endpoint and service
      // const uploadResponse = await fileService.uploadFile(formData);
      // const receiptUrl = uploadResponse.url;
      const receiptUrl = 'temporary-url'; // Replace with actual upload

      // Create reimbursement request
      await reimbursementService.createRequest({
        amount: data.amount,
        category: data.category,
        description: data.description,
        receiptUrl,
      });

      toast.success('Reimbursement request submitted successfully');
      reset();
    } catch (error) {
      console.error('Error submitting reimbursement request:', error);
      toast.error('Failed to submit reimbursement request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="amount"
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a category</option>
          {Object.values(ExpenseCategory).map((category) => (
            <option key={category} value={category}>
              {category.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters',
            },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="receipt"
          className="block text-sm font-medium text-gray-700"
        >
          Receipt
        </label>
        <input
          type="file"
          id="receipt"
          accept="image/*,.pdf"
          {...register('receipt', { required: 'Receipt is required' })}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {errors.receipt && (
          <p className="mt-1 text-sm text-red-600">{errors.receipt.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}; 