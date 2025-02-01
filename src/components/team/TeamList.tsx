'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '@/types/team';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { currencyService } from '@/services/currency.service';

export const TeamList: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await teamService.getTeams();
      setTeams(data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    router.push('/dashboard/teams/new');
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/dashboard/teams/${teamId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleCreateTeam}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
          {user?.role === 'ADMIN' && (
            <div className="mt-6">
              <button
                onClick={handleCreateTeam}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Team
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer p-6"
            >
              <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
              {team.description && (
                <p className="mt-1 text-sm text-gray-500">{team.description}</p>
              )}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Members</span>
                  <span className="font-medium text-gray-900">
                    {team.members.length}
                  </span>
                </div>
                {team.budget && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">
                      {currencyService.formatAmount(
                        team.budget.amount,
                        team.budget.currency
                      )}
                      /{team.budget.period}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 