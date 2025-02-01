'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Team } from '@/types/team';
import { teamService } from '@/services/team.service';
import { toast } from 'react-hot-toast';
import { currencyService } from '@/services/currency.service';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  budget: z.object({
    amount: z.number().min(0, 'Budget amount must be positive'),
    currency: z.string().min(1, 'Please select a currency'),
    period: z.enum(['month', 'quarter', 'year']),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  team?: Team;
  onSuccess?: () => void;
}

export const TeamForm: React.FC<Props> = ({ team, onSuccess }) => {
  const router = useRouter();
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: team ? {
      name: team.name,
      description: team.description,
      budget: team.budget ? {
        amount: team.budget.amount,
        currency: team.budget.currency,
        period: team.budget.period,
      } : undefined,
    } : undefined,
  });

  React.useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const supportedCurrencies = await currencyService.getSupportedCurrencies();
      setCurrencies(supportedCurrencies.map(c => c.code));
    } catch (error) {
      toast.error('Failed to load currencies');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      if (team) {
        await teamService.updateTeam(team.id, data);
        toast.success('Team updated successfully');
      } else {
        await teamService.createTeam(data);
        toast.success('Team created successfully');
      }
      onSuccess?.();
      router.push('/dashboard/teams');
    } catch (error) {
      toast.error(team ? 'Failed to update team' : 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasBudget = watch('budget');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            {...register('name')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasBudget"
            checked={!!hasBudget}
            onChange={(e) => {
              if (!e.target.checked) {
                // Clear budget fields
                register('budget', { value: undefined });
              } else {
                // Set default budget values
                register('budget', {
                  value: {
                    amount: 0,
                    currency: currencies[0] || 'USD',
                    period: 'month',
                  },
                });
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="hasBudget" className="ml-2 block text-sm text-gray-900">
            Set Budget
          </label>
        </div>

        {hasBudget && (
          <div className="space-y-4 pl-6">
            <div>
              <label htmlFor="budget.amount" className="block text-sm font-medium text-gray-700">
                Budget Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  step="0.01"
                  id="budget.amount"
                  {...register('budget.amount', { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.budget?.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.amount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="budget.currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <div className="mt-1">
                <select
                  id="budget.currency"
                  {...register('budget.currency')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                {errors.budget?.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.currency.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="budget.period" className="block text-sm font-medium text-gray-700">
                Budget Period
              </label>
              <div className="mt-1">
                <select
                  id="budget.period"
                  {...register('budget.period')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                </select>
                {errors.budget?.period && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.period.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
        </button>
      </div>
    </form>
  );
}; 