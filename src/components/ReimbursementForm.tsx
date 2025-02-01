'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExpenseCategory } from '@/types/reimbursement';
import { reimbursementService } from '@/services/reimbursement.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const schema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  receipt: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Please upload a receipt')
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      'File size should be less than 5MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      'Only .jpg, .png, and .pdf files are accepted'
    ),
});

type FormData = z.infer<typeof schema>;

export const ReimbursementForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Watch for file changes to create preview
  const receipt = watch('receipt');
  React.useEffect(() => {
    if (receipt?.[0]) {
      const file = receipt[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [receipt]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Please log in to submit a request');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reimbursementService.createRequest({
        amount: data.amount,
        category: data.category,
        description: data.description,
        receipt: data.receipt[0],
      });

      toast.success('Reimbursement request submitted successfully');
      reset();
      router.push('/dashboard/reimbursements');
    } catch (error: any) {
      console.error('Error submitting reimbursement request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit reimbursement request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ($)
        </label>
        <div className="mt-1">
          <input
            type="number"
            step="0.01"
            id="amount"
            {...register('amount', { valueAsNumber: true })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1">
          <select
            id="category"
            {...register('category')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Describe your expense..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
          Receipt
        </label>
        <div className="mt-1">
          <input
            type="file"
            id="receipt"
            accept={ACCEPTED_FILE_TYPES.join(',')}
            {...register('receipt')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {errors.receipt && (
            <p className="mt-1 text-sm text-red-600">{errors.receipt.message}</p>
          )}
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-w-xs rounded-md shadow-sm"
              />
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: JPG, PNG, PDF. Maximum size: 5MB
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}; 