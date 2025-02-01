'use client';

import React, { useEffect, useState } from 'react';
import { Team } from '@/types/team';
import { teamService } from '@/services/team.service';
import { currencyService } from '@/services/currency.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Switch } from '@headlessui/react';

interface Props {
  teamId: string;
  onUpdate?: () => void;
}

interface TeamSettings {
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    slackIntegration: boolean;
  };
  approvalSettings: {
    autoApproveBelow: number;
    requireSecondApprover: boolean;
    allowSelfApproval: boolean;
  };
  exportSettings: {
    autoExport: boolean;
    exportFormat: 'csv' | 'pdf' | 'excel';
    exportFrequency: 'daily' | 'weekly' | 'monthly';
  };
  integrations: {
    slackWebhook?: string;
    quickbooksEnabled: boolean;
    xeroEnabled: boolean;
  };
}

export const TeamSettings: React.FC<Props> = ({ teamId, onUpdate }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<string[]>([]);

  useEffect(() => {
    fetchTeamAndSettings();
    loadCurrencies();
  }, [teamId]);

  const fetchTeamAndSettings = async () => {
    try {
      setLoading(true);
      const [teamData, settingsData] = await Promise.all([
        teamService.getTeam(teamId),
        teamService.getTeamSettings(teamId),
      ]);
      setTeam(teamData);
      setSettings(settingsData);
    } catch (error) {
      toast.error('Failed to load team settings');
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
    if (!settings) return;

    try {
      await teamService.updateTeamSettings(teamId, settings);
      toast.success('Settings updated successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const updateSettings = <K extends keyof TeamSettings>(
    category: K,
    updates: Partial<TeamSettings[K]>
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        ...updates,
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Team Settings</h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Notification Preferences */}
          <div>
            <h4 className="text-base font-medium text-gray-900">Notification Preferences</h4>
            <div className="mt-4 space-y-4">
              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Email Notifications
                  </Switch.Label>
                  <Switch
                    checked={settings.notificationPreferences.emailNotifications}
                    onChange={(checked) =>
                      updateSettings('notificationPreferences', { emailNotifications: checked })
                    }
                    className={`${
                      settings.notificationPreferences.emailNotifications
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.notificationPreferences.emailNotifications
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Push Notifications
                  </Switch.Label>
                  <Switch
                    checked={settings.notificationPreferences.pushNotifications}
                    onChange={(checked) =>
                      updateSettings('notificationPreferences', { pushNotifications: checked })
                    }
                    className={`${
                      settings.notificationPreferences.pushNotifications
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.notificationPreferences.pushNotifications
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Slack Integration
                  </Switch.Label>
                  <Switch
                    checked={settings.notificationPreferences.slackIntegration}
                    onChange={(checked) =>
                      updateSettings('notificationPreferences', { slackIntegration: checked })
                    }
                    className={`${
                      settings.notificationPreferences.slackIntegration
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.notificationPreferences.slackIntegration
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>
            </div>
          </div>

          {/* Approval Settings */}
          <div>
            <h4 className="text-base font-medium text-gray-900">Approval Settings</h4>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="autoApproveBelow"
                  className="block text-sm font-medium text-gray-700"
                >
                  Auto-approve Below Amount
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="autoApproveBelow"
                    value={settings.approvalSettings.autoApproveBelow}
                    onChange={(e) =>
                      updateSettings('approvalSettings', {
                        autoApproveBelow: parseFloat(e.target.value),
                      })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Require Second Approver
                  </Switch.Label>
                  <Switch
                    checked={settings.approvalSettings.requireSecondApprover}
                    onChange={(checked) =>
                      updateSettings('approvalSettings', { requireSecondApprover: checked })
                    }
                    className={`${
                      settings.approvalSettings.requireSecondApprover
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.approvalSettings.requireSecondApprover
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Allow Self-Approval
                  </Switch.Label>
                  <Switch
                    checked={settings.approvalSettings.allowSelfApproval}
                    onChange={(checked) =>
                      updateSettings('approvalSettings', { allowSelfApproval: checked })
                    }
                    className={`${
                      settings.approvalSettings.allowSelfApproval
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.approvalSettings.allowSelfApproval
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>
            </div>
          </div>

          {/* Export Settings */}
          <div>
            <h4 className="text-base font-medium text-gray-900">Export Settings</h4>
            <div className="mt-4 space-y-4">
              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">Auto Export</Switch.Label>
                  <Switch
                    checked={settings.exportSettings.autoExport}
                    onChange={(checked) =>
                      updateSettings('exportSettings', { autoExport: checked })
                    }
                    className={`${
                      settings.exportSettings.autoExport ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.exportSettings.autoExport
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <div>
                <label
                  htmlFor="exportFormat"
                  className="block text-sm font-medium text-gray-700"
                >
                  Export Format
                </label>
                <select
                  id="exportFormat"
                  value={settings.exportSettings.exportFormat}
                  onChange={(e) =>
                    updateSettings('exportSettings', {
                      exportFormat: e.target.value as 'csv' | 'pdf' | 'excel',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  aria-label="Select export format"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="exportFrequency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Export Frequency
                </label>
                <select
                  id="exportFrequency"
                  value={settings.exportSettings.exportFrequency}
                  onChange={(e) =>
                    updateSettings('exportSettings', {
                      exportFrequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  aria-label="Select export frequency"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <h4 className="text-base font-medium text-gray-900">Integrations</h4>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="slackWebhook"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slack Webhook URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="slackWebhook"
                    value={settings.integrations.slackWebhook || ''}
                    onChange={(e) =>
                      updateSettings('integrations', { slackWebhook: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    QuickBooks Integration
                  </Switch.Label>
                  <Switch
                    checked={settings.integrations.quickbooksEnabled}
                    onChange={(checked) =>
                      updateSettings('integrations', { quickbooksEnabled: checked })
                    }
                    className={`${
                      settings.integrations.quickbooksEnabled
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.integrations.quickbooksEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="text-sm text-gray-700">
                    Xero Integration
                  </Switch.Label>
                  <Switch
                    checked={settings.integrations.xeroEnabled}
                    onChange={(checked) =>
                      updateSettings('integrations', { xeroEnabled: checked })
                    }
                    className={`${
                      settings.integrations.xeroEnabled ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.integrations.xeroEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 