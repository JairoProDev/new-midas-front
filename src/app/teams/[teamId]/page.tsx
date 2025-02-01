'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Team } from '@/types/team';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { TeamBudget } from '@/components/team/TeamBudget';
import { TeamAnalytics } from '@/components/team/TeamAnalytics';
import { TeamMembers } from '@/components/team/TeamMembers';
import { TeamPolicies } from '@/components/team/TeamPolicies';
import { TeamSettings } from '@/components/team/TeamSettings';
import { TeamReports } from '@/components/team/TeamReports';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TeamPage() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeam(teamId as string);
      setTeam(data);
    } catch (error) {
      toast.error('Failed to load team information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Team Not Found</h2>
          <p className="mt-2 text-gray-600">
            The team you are looking for does not exist or you do not have access to it.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', component: <TeamAnalytics teamId={team.id} currency={team.currency} /> },
    { name: 'Budget', component: <TeamBudget teamId={team.id} budget={team.budget} /> },
    { name: 'Members', component: <TeamMembers teamId={team.id} /> },
    { name: 'Policies', component: <TeamPolicies teamId={team.id} /> },
    { name: 'Reports', component: <TeamReports teamId={team.id} /> },
    {
      name: 'Settings',
      component: <TeamSettings teamId={team.id} onUpdate={fetchTeam} />,
      show: user?.role === 'ADMIN',
    },
  ].filter((tab) => tab.show !== false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-tight text-gray-900">{team.name}</h1>
                {team.description && (
                  <p className="mt-2 text-sm text-gray-600">{team.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-primary-900/20 p-1">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white text-primary-700 shadow'
                            : 'text-primary-100 hover:bg-white/[0.12] hover:text-white'
                        )
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-6">
                  {tabs.map((tab) => (
                    <Tab.Panel
                      key={tab.name}
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      {tab.component}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 