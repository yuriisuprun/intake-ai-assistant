'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { adminApi } from '@/lib/api/admin';

interface OverviewReport {
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  total_clients: number;
  completion_rate: number;
}

interface ActivityReport {
  sessions_by_day: Record<string, { total: number; completed: number }>;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [activity, setActivity] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch overview report
        const overviewResponse = await adminApi.reports.getOverview();
        if (overviewResponse.data.success) {
          setOverview(overviewResponse.data.data);
        }

        // Fetch activity report
        const activityResponse = await adminApi.reports.getActivity(dateRange);
        if (activityResponse.data.success) {
          setActivity(activityResponse.data.data);
        }
      } catch (err) {
        setError('Failed to load reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">View system statistics and activity</p>
      </div>

      {/* Overview Section */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-600">{overview.total_sessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{overview.completed_sessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">
              {overview.in_progress_sessions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Clients</p>
            <p className="text-3xl font-bold text-purple-600">{overview.total_clients}</p>
          </div>
        </div>
      )}

      {/* Completion Rate */}
      {overview && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-6 rounded-full transition-all"
                  style={{ width: `${overview.completion_rate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {overview.completion_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Activity Report */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Activity Report</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>

        {activity && Object.keys(activity.sessions_by_day).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Total Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(activity.sessions_by_day)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, data]) => (
                    <tr key={date} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Date(date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.completed}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  data.total > 0
                                    ? (data.completed / data.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {data.total > 0
                              ? ((data.completed / data.total) * 100).toFixed(0)
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No activity data available</p>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Export Data</h2>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export as CSV
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
