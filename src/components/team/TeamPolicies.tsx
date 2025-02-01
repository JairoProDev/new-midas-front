'use client';

import React, { useEffect, useState } from 'react';
import { TeamPolicy } from '@/types/team';
import { teamService } from '@/services/team.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  teamId: string;
}

export const TeamPolicies: React.FC<Props> = ({ teamId }) => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<TeamPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<TeamPolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: {
      maxAmount: 0,
      requireApproval: false,
      allowedCategories: [] as string[],
      restrictedVendors: [] as string[],
    },
  });

  useEffect(() => {
    fetchPolicies();
  }, [teamId]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamPolicies(teamId);
      setPolicies(data);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await teamService.updateTeamPolicy(teamId, editingPolicy.id, formData);
        toast.success('Policy updated successfully');
      } else {
        await teamService.createTeamPolicy(teamId, formData);
        toast.success('Policy created successfully');
      }
      setIsEditing(false);
      setEditingPolicy(null);
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to save policy');
    }
  };

  const handleEdit = (policy: TeamPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      rules: policy.rules,
    });
    setIsEditing(true);
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      await teamService.deleteTeamPolicy(teamId, policyId);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: {
        maxAmount: 0,
        requireApproval: false,
        allowedCategories: [],
        restrictedVendors: [],
      },
    });
    setEditingPolicy(null);
    setIsEditing(false);
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
            Team Policies
          </h3>
          {user?.role === 'ADMIN' && !isEditing && (
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Policy
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Policy Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">
                Maximum Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="maxAmount"
                  value={formData.rules.maxAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: { ...formData.rules, maxAmount: parseFloat(e.target.value) },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={formData.rules.requireApproval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: { ...formData.rules, requireApproval: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="requireApproval" className="font-medium text-gray-700">
                  Require Approval
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="allowedCategories" className="block text-sm font-medium text-gray-700">
                Allowed Categories (comma-separated)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="allowedCategories"
                  value={formData.rules.allowedCategories.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        allowedCategories: e.target.value.split(',').map((c) => c.trim()),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="restrictedVendors" className="block text-sm font-medium text-gray-700">
                Restricted Vendors (comma-separated)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="restrictedVendors"
                  value={formData.rules.restrictedVendors.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        restrictedVendors: e.target.value.split(',').map((v) => v.trim()),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingPolicy ? 'Update' : 'Create'} Policy
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            {policies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No policies have been created yet.</p>
            ) : (
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{policy.name}</h4>
                        <p className="mt-1 text-sm text-gray-500">{policy.description}</p>
                      </div>
                      {user?.role === 'ADMIN' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(policy)}
                            className="text-gray-400 hover:text-gray-500"
                            aria-label={`Edit ${policy.name}`}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(policy.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label={`Delete ${policy.name}`}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Maximum Amount</h5>
                        <p className="mt-1 text-sm text-gray-500">
                          {policy.rules.maxAmount > 0
                            ? `$${policy.rules.maxAmount.toLocaleString()}`
                            : 'No limit'}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Approval Required</h5>
                        <p className="mt-1 text-sm text-gray-500">
                          {policy.rules.requireApproval ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Allowed Categories</h5>
                        <p className="mt-1 text-sm text-gray-500">
                          {policy.rules.allowedCategories.length > 0
                            ? policy.rules.allowedCategories.join(', ')
                            : 'All categories allowed'}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Restricted Vendors</h5>
                        <p className="mt-1 text-sm text-gray-500">
                          {policy.rules.restrictedVendors.length > 0
                            ? policy.rules.restrictedVendors.join(', ')
                            : 'No restricted vendors'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 