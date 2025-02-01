'use client';

import React, { useEffect, useState } from 'react';
import { TeamAnalytics as TeamAnalyticsType } from '@/types/team';
import { teamService } from '@/services/team.service';
import { currencyService } from '@/services/currency.service';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  teamId: string;
  currency: string;
}

export const TeamAnalytics: React.FC<Props> = ({ teamId, currency }) => {
  const [analytics, setAnalytics] = useState<TeamAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [teamId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamAnalytics(teamId, { timeframe });
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryChartData = () => {
    if (!analytics) return null;

    const categories = Object.entries(analytics.categoryBreakdown);
    return {
      labels: categories.map(([category]) => category),
      datasets: [
        {
          data: categories.map(([, amount]) => amount),
          backgroundColor: [
            'rgba(239, 68, 68, 0.5)',
            'rgba(34, 197, 94, 0.5)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(249, 115, 22, 0.5)',
            'rgba(168, 85, 247, 0.5)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(249, 115, 22)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyChartData = () => {
    if (!analytics) return null;

    return {
      labels: Object.keys(analytics.monthlyBreakdown),
      datasets: [
        {
          label: 'Monthly Spending',
          data: Object.values(analytics.monthlyBreakdown),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getMemberChartData = () => {
    if (!analytics) return null;

    const members = Object.entries(analytics.memberBreakdown);
    return {
      labels: members.map(([member]) => member),
      datasets: [
        {
          data: members.map(([, amount]) => amount),
          backgroundColor: [
            'rgba(34, 197, 94, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(249, 115, 22, 0.5)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(168, 85, 247, 0.5)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
        <div className="sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Team Analytics
          </h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'month' | 'quarter' | 'year')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              aria-label="Select timeframe"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {analytics && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Total Spending
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {currencyService.formatAmount(analytics.totalExpenses, currency)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Average per Member
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {currencyService.formatAmount(
                  analytics.totalExpenses / Object.keys(analytics.memberBreakdown).length,
                  currency
                )}
              </p>
            </div>

            <div className="sm:col-span-2">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Monthly Spending Trend
              </h4>
              <div className="h-64">
                {getMonthlyChartData() && (
                  <Bar data={getMonthlyChartData()!} options={chartOptions} />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Spending by Category
              </h4>
              <div className="h-64">
                {getCategoryChartData() && (
                  <Doughnut data={getCategoryChartData()!} options={chartOptions} />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Spending by Member
              </h4>
              <div className="h-64">
                {getMemberChartData() && (
                  <Doughnut data={getMemberChartData()!} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 