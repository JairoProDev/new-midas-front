'use client';

import React, { useEffect, useState } from 'react';
import { TeamInvitation } from '@/types/team';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Props {
  teamId: string;
  onUpdate?: () => void;
}

export const TeamInvitations: React.FC<Props> = ({ teamId, onUpdate }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, [teamId]);

  const fetchInvitations = async () => {
    try {
      const response = await teamService.getTeamInvitations(teamId);
      setInvitations(response);
    } catch (error) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      await teamService.acceptInvitation(invitationId);
      toast.success('Invitation accepted successfully');
      onUpdate?.();
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      await teamService.rejectInvitation(invitationId);
      toast.success('Invitation rejected successfully');
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to reject invitation');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Team Invitation
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    You have been invited to join{' '}
                    <span className="font-medium text-gray-900">
                      {invitation.team.name}
                    </span>{' '}
                    as a {invitation.role.toLowerCase()}.
                  </p>
                  <p className="mt-1">
                    Invited by{' '}
                    <span className="font-medium text-gray-900">
                      {invitation.createdBy}
                    </span>
                  </p>
                  <p className="mt-1">
                    Expires{' '}
                    {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:items-center">
                <button
                  type="button"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  disabled={!!processingId}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mr-3 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectInvitation(invitation.id)}
                  disabled={!!processingId}
                  className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 