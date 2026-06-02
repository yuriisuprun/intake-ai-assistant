'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

interface AnonymousIntake {
  id: string;
  session_id: string;
  client_name: string;
  client_email: string;
  status: string;
  legal_category?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [recentAnonymousIntakes, setRecentAnonymousIntakes] = useState<AnonymousIntake[]>([]);
  const [anonymousIntakeCounts, setAnonymousIntakeCounts] = useState({
    total: 0,
    submitted: 0,
    reviewed: 0,
    assigned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/admin/login');
          return;
        }

        setUser(session.user);
        
        // Set token for API client
        if (session.access_token) {
          apiClient.setToken(session.access_token);
        }

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

        // Fetch Intakes
        const anonymousResponse = await apiClient.listAnonymousIntakes(0, 100);
        if (anonymousResponse.success) {
          const intakes = anonymousResponse.data.intakes || [];
          
          // Get recent 5 intakes
          setRecentAnonymousIntakes(intakes.slice(0, 5));
          
          // Calculate counts by status
          const counts = {
            total: intakes.length,
            submitted: intakes.filter((i: AnonymousIntake) => i.status === 'submitted').length,
            reviewed: intakes.filter((i: AnonymousIntake) => i.status === 'reviewed').length,
            assigned: intakes.filter((i: AnonymousIntake) => i.status === 'assigned').length,
          };
          setAnonymousIntakeCounts(counts);
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#a855f7' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
        <p style={{ color: '#991b1b' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>Admin Dashboard</h1>
        <p style={{ color: '#4b5563' }}>Welcome back, {user?.email}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#a855f7' }}>
            {overview?.total_sessions || 0}
          </div>
          <p style={{ color: '#4b5563' }}>Total Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#10b981' }}>
            {overview?.completed_sessions || 0}
          </div>
          <p style={{ color: '#4b5563' }}>Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#f59e0b' }}>
            {overview?.in_progress_sessions || 0}
          </div>
          <p style={{ color: '#4b5563' }}>In Progress</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: '#a855f7' }}>
            {overview?.total_clients || 0}
          </div>
          <p style={{ color: '#4b5563' }}>Total Clients</p>
        </div>
      </div>

      {/* Anonymous Intake Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Intakes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #a855f7', border: '1px solid #e5e7eb' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#a855f7' }}>
              {anonymousIntakeCounts.total}
            </div>
            <p style={{ color: '#4b5563' }}>Total Submissions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #f59e0b', border: '1px solid #e5e7eb' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#f59e0b' }}>
              {anonymousIntakeCounts.submitted}
            </div>
            <p style={{ color: '#4b5563' }}>Submitted (Pending)</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #f97316', border: '1px solid #e5e7eb' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#f97316' }}>
              {anonymousIntakeCounts.reviewed}
            </div>
            <p style={{ color: '#4b5563' }}>Reviewed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6" style={{ borderLeft: '4px solid #10b981', border: '1px solid #e5e7eb' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#10b981' }}>
              {anonymousIntakeCounts.assigned}
            </div>
            <p style={{ color: '#4b5563' }}>Assigned</p>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      {overview && (
        <div className="bg-white rounded-lg shadow p-6 mb-8" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{ width: `${overview.completion_rate}%`, backgroundColor: '#a855f7' }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#a855f7' }}>
              {overview.completion_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/sessions"
          className="bg-white rounded-lg shadow p-6 transition"
          style={{ border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'none'
          }}
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-bold mb-2" style={{ color: '#111827' }}>View All Sessions</h3>
          <p className="text-sm" style={{ color: '#4b5563' }}>Manage intake sessions</p>
        </Link>
        <Link
          href="/admin/intakes"
          className="bg-white rounded-lg shadow p-6 transition"
          style={{ borderTop: '2px solid #a855f7', border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'none'
          }}
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Intakes</h3>
          <p className="text-sm" style={{ color: '#4b5563' }}>View all public submissions</p>
        </Link>
        <Link
          href="/admin/clients"
          className="bg-white rounded-lg shadow p-6 transition"
          style={{ border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'none'
          }}
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Manage Clients</h3>
          <p className="text-sm" style={{ color: '#4b5563' }}>View all clients</p>
        </Link>
        <Link
          href="/admin/team"
          className="bg-white rounded-lg shadow p-6 transition"
          style={{ border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'none'
          }}
        >
          <div className="text-2xl mb-2">👨‍💼</div>
          <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Team Management</h3>
          <p className="text-sm" style={{ color: '#4b5563' }}>Manage team members</p>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow" style={{ border: '1px solid #e5e7eb' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Recent Sessions</h2>
          <Link 
            href="/admin/sessions" 
            className="transition"
            style={{ color: '#a855f7' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#9333ea')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a855f7')}
          >
            View All →
          </Link>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb' }}>
          {recentSessions.length > 0 ? (
            recentSessions.map((session, idx) => (
              <Link
                key={session.id}
                href={`/admin/sessions/${session.id}`}
                className="px-6 py-4 transition flex justify-between items-center"
                style={{
                  borderBottom: idx < recentSessions.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
              >
                <div>
                  <div className="font-semibold" style={{ color: '#111827' }}>
                    {session.client_name}
                  </div>
                  <div className="text-sm" style={{ color: '#4b5563' }}>
                    {session.legal_category || 'General'} •{' '}
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: session.status === 'completed' ? '#dcfce7' : '#fef3c7',
                      color: session.status === 'completed' ? '#166534' : '#92400e'
                    }}
                  >
                    {session.status}
                  </span>
                  {session.urgency && (
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: session.urgency === 'high' ? '#fee2e2' : session.urgency === 'medium' ? '#fed7aa' : '#dbeafe',
                        color: session.urgency === 'high' ? '#991b1b' : session.urgency === 'medium' ? '#92400e' : '#1e40af'
                      }}
                    >
                      {session.urgency}
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center" style={{ color: '#4b5563' }}>
              <p>No sessions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Intakes */}
      {recentAnonymousIntakes.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-8" style={{ border: '1px solid #e5e7eb' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Recent Intakes</h2>
            <Link 
              href="/admin/intakes" 
              className="transition"
              style={{ color: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a855f7')}
            >
              View All →
            </Link>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb' }}>
            {recentAnonymousIntakes.map((intake, idx) => {
              const statusColors: Record<string, { bg: string; text: string }> = {
                submitted: { bg: '#dbeafe', text: '#1e40af' },
                reviewed: { bg: '#fef3c7', text: '#92400e' },
                assigned: { bg: '#dcfce7', text: '#166534' },
                archived: { bg: '#f3f4f6', text: '#4b5563' },
              };
              
              const statusColor = statusColors[intake.status] || statusColors.submitted;
              
              return (
                <Link
                  key={intake.id}
                  href={`/admin/intakes`}
                  className="px-6 py-4 transition flex justify-between items-center"
                  style={{
                    borderBottom: idx < recentAnonymousIntakes.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                >
                  <div>
                    <div className="font-semibold" style={{ color: '#111827' }}>
                      {intake.client_name}
                    </div>
                    <div className="text-sm" style={{ color: '#4b5563' }}>
                      {intake.client_email} •{' '}
                      {new Date(intake.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {intake.legal_category && (
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: '#f3e8ff', color: '#a855f7' }}
                      >
                        {intake.legal_category}
                      </span>
                    )}
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                    >
                      {intake.status.charAt(0).toUpperCase() + intake.status.slice(1)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
