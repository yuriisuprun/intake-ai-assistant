'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

interface Session {
  id: string;
  status: string;
  legal_category: string;
  created_at: string;
  completed_at?: string;
}

interface DashboardData {
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  recent_sessions: Session[];
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/client/dashboard');
        if (response.data.success) {
          setDashboard(response.data.data);
        } else {
          setError('Failed to load dashboard');
        }
      } catch (err) {
        setError('Error loading dashboard');
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
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.email}</h1>
        <p className="text-gray-600">Manage your intake sessions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {dashboard?.total_sessions || 0}
          </div>
          <p className="text-gray-600">Total Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {dashboard?.completed_sessions || 0}
          </div>
          <p className="text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {dashboard?.in_progress_sessions || 0}
          </div>
          <p className="text-gray-600">In Progress</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <Link
          href="/client/intake"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start New Intake
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboard?.recent_sessions && dashboard.recent_sessions.length > 0 ? (
            dashboard.recent_sessions.map((session) => (
              <Link
                key={session.id}
                href={`/client/session/${session.id}`}
                className="px-6 py-4 hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {session.legal_category || 'General Inquiry'}
                  </div>
                  <div className="text-sm text-gray-600">
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
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-600">
              <p>No sessions yet. Start a new intake to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
