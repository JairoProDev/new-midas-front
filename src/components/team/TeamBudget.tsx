'use client';

import React, { useEffect, useState } from 'react';
import { TeamBudget as TeamBudgetType } from '@/types/team';
import { teamService } from '@/services/team.service';
import { currencyService } from '@/services/currency.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  teamId: string;
  budget?: TeamBudgetType;
  onUpdate?: () => void;
}

export const TeamBudget: React.FC<Props> = ({ teamId, budget: initialBudget, onUpdate }) => {
  const { user } = useAuth();
  const [budget, setBudget] = useState<TeamBudgetType | undefined>(initialBudget);
  const [loading, setLoading] = useState(!initialBudget);
  const [isEditing, setIsEditing] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    amount: budget?.amount || 0,
    currency: budget?.currency || 'USD',
    period: budget?.period || 'month',
  });

  useEffect(() => {
    if (!initialBudget) {
      fetchBudget();
    }
    loadCurrencies();
  }, [initialBudget]);

  const fetchBudget = async () => {
    try {
      const data = await teamService.getTeamBudget(teamId);
      setBudget(data);
    } catch (error) {
      toast.error('Failed to load budget information');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      const supportedCurrencies = await currencyService.getSupportedCurrencies();
      setCurrencies(supportedCurrencies.map(c => c.code));
    } catch (error) {
      toast.error('Failed to load currencies');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedBudget = await teamService.updateTeamBudget(teamId, editForm);
      setBudget(updatedBudget);
      setIsEditing(false);
      toast.success('Budget updated successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  };

  const getChartData = () => {
    if (!budget) return null;

    return {
      labels: ['Budget'],
      datasets: [
        {
          label: 'Spent',
          data: [budget.spent],
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
        {
          label: 'Remaining',
          data: [budget.remaining],
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Team Budget
            </h3>
            {!isEditing && budget && (
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Current budget:{' '}
                  <span className="font-medium text-gray-900">
                    {currencyService.formatAmount(budget.amount, budget.currency)}
                  </span>{' '}
                  per {budget.period}
                </p>
                <p className="mt-1">
                  Spent:{' '}
                  <span className="font-medium text-gray-900">
                    {currencyService.formatAmount(budget.spent, budget.currency)}
                  </span>
                </p>
                <p className="mt-1">
                  Remaining:{' '}
                  <span className="font-medium text-gray-900">
                    {currencyService.formatAmount(budget.remaining, budget.currency)}
                  </span>
                </p>
                <div className="mt-4 h-64">
                  {getChartData() && (
                    <Chart type="bar" data={getChartData()!} options={chartOptions} />
                  )}
                </div>
              </div>
            )}
          </div>
          {user?.role === 'ADMIN' && !isEditing && (
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Budget
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Budget Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <div className="mt-1">
                <select
                  id="currency"
                  value={editForm.currency}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                Budget Period
              </label>
              <div className="mt-1">
                <select
                  id="period"
                  value={editForm.period}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      period: e.target.value as 'month' | 'quarter' | 'year',
                    }))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>

            <div className="mt-5 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 