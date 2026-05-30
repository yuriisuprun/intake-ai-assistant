'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

interface OverviewReport {
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  total_clients: number;
  completion_rate: number;
}

interface RecentSession {
  id: string;
  client_name: string;
  status: string;
  legal_category: string;
  urgency: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch overview report
        const reportResponse = await apiClient.get('/admin/reports/overview');
        if (reportResponse.data.success) {
          setOverview(reportResponse.data.data);
        }

        // Fetch recent sessions
        const sessionsResponse = await apiClient.get('/admin/intake?limit=5');
        if (sessionsResponse.data.success) {
          setRecentSessions(sessionsResponse.data.data.sessions || []);
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.email}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {overview?.total_sessions || 0}
          </div>
          <p className="text-gray-600">Total Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {overview?.completed_sessions || 0}
          </div>
          <p className="text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {overview?.in_progress_sessions || 0}
          </div>
          <p className="text-gray-600">In Progress</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {overview?.total_clients || 0}
          </div>
          <p className="text-gray-600">Total Clients</p>
        </div>
      </div>

      {/* Completion Rate */}
      {overview && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${overview.completion_rate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {overview.completion_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/sessions"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-bold mb-2">View All Sessions</h3>
          <p className="text-sm text-gray-600">Manage intake sessions</p>
        </Link>
        <Link
          href="/admin/clients"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-bold mb-2">Manage Clients</h3>
          <p className="text-sm text-gray-600">View all clients</p>
        </Link>
        <Link
          href="/admin/team"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-2xl mb-2">👨‍💼</div>
          <h3 className="font-bold mb-2">Team Management</h3>
          <p className="text-sm text-gray-600">Manage team members</p>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Sessions</h2>
          <Link href="/admin/sessions" className="text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => (
              <Link
                key={session.id}
                href={`/admin/sessions/${session.id}`}
                className="px-6 py-4 hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {session.client_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {session.legal_category || 'General'} •{' '}
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {session.status}
                  </span>
                  {session.urgency && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.urgency === 'high'
                          ? 'bg-red-100 text-red-800'
                          : session.urgency === 'medium'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {session.urgency}
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-600">
              <p>No sessions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
