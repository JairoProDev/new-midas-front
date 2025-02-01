'use client';

import React, { useEffect, useState } from 'react';
import { teamService } from '@/services/team.service';
import { currencyService } from '@/services/currency.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Props {
  teamId: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'expense' | 'budget' | 'audit';
  format: 'pdf' | 'csv' | 'excel';
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
}

export const TeamReports: React.FC<Props> = ({ teamId }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchTemplatesAndReports();
  }, [teamId]);

  const fetchTemplatesAndReports = async () => {
    try {
      setLoading(true);
      const [templatesData, reportsData] = await Promise.all([
        teamService.getReportTemplates(teamId),
        teamService.getGeneratedReports(teamId),
      ]);
      setTemplates(templatesData);
      setReports(reportsData);
    } catch (error) {
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select a template and date range');
      return;
    }

    try {
      await teamService.generateReport(teamId, {
        templateId: selectedTemplate,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      toast.success('Report generation started');
      fetchTemplatesAndReports();
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleDownload = async (report: GeneratedReport) => {
    if (report.status !== 'completed' || !report.downloadUrl) {
      toast.error('Report is not ready for download');
      return;
    }

    try {
      await teamService.downloadReport(teamId, report.id);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getTemplateIcon = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'expense':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'budget':
        return <DocumentChartBarIcon className="h-6 w-6" />;
      case 'audit':
        return <DocumentArrowDownIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
    }
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">Team Reports</h3>

        {/* Generate New Report Form */}
        <form onSubmit={handleGenerateReport} className="mt-6 space-y-6">
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700">
              Report Template
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              aria-label="Select report template"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Generate Report
            </button>
          </div>
        </form>

        {/* Available Templates */}
        <div className="mt-8">
          <h4 className="text-base font-medium text-gray-900">Available Templates</h4>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-shrink-0 text-gray-400">
                  {getTemplateIcon(template.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className="focus:outline-none text-left"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500 truncate">{template.description}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Reports */}
        <div className="mt-8">
          <h4 className="text-base font-medium text-gray-900">Generated Reports</h4>
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Report Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {report.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {report.status === 'completed' && report.downloadUrl && (
                        <button
                          onClick={() => handleDownload(report)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Download<span className="sr-only">, {report.name}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 