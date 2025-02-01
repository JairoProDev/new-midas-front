'use client';

import React, { useState } from 'react';
import { TeamMember } from '@/types/team';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Props {
  teamId: string;
  members: TeamMember[];
  onUpdate?: () => void;
}

export const TeamMembers: React.FC<Props> = ({ teamId, members, onUpdate }) => {
  const { user } = useAuth();
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsInviting(true);
      await teamService.createInvitation(teamId, {
        email,
        role,
      });
      toast.success('Invitation sent successfully');
      setEmail('');
      setRole('MEMBER');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'MEMBER' | 'ADMIN') => {
    try {
      setProcessingId(memberId);
      await teamService.updateTeamMember(teamId, memberId, { role: newRole });
      toast.success('Member role updated successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update member role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      setProcessingId(memberId);
      await teamService.removeTeamMember(teamId, memberId);
      toast.success('Member removed successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setProcessingId(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Invite Team Member
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Invite a new member to join this team.</p>
            </div>
            <form onSubmit={handleInvite} className="mt-5 sm:flex sm:items-center">
              <div className="w-full sm:max-w-xs">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter email"
                />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'MEMBER' | 'ADMIN')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isInviting || !email}
                className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isInviting ? 'Sending...' : 'Invite'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Team Members ({members.length})
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {member.user.firstName?.[0]}
                          {member.user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.user.firstName} {member.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                    </div>
                  </div>
                  {isAdmin && member.user.id !== user?.id && (
                    <div className="flex items-center space-x-4">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as 'MEMBER' | 'ADMIN')
                        }
                        disabled={!!processingId}
                        className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={!!processingId}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 