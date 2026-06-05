'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { 
  BarChart3, FileText, Clock, CheckCircle, AlertCircle, 
  TrendingUp, Calendar 
} from 'lucide-react'

interface DashboardStats {
  total_sessions: number
  completed_sessions: number
  in_progress_sessions: number
  total_clients: number
  completion_rate: number
}

interface ActivityData {
  sessions_by_day: Record<string, { total: number; completed: number }>
}

interface StatusDistribution {
  [key: string]: number
}

interface PendingIntake {
  id: string
  client_name: string
  client_email: string
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [statusDist, setStatusDist] = useState<StatusDistribution>({})
  const [pendingIntakes, setPendingIntakes] = useState<PendingIntake[]>([])
  const [daysRange, setDaysRange] = useState(7)

  // Check authentication and fetch data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/admin/login')
          return
        }

        setUser(session.user)

        if (session.access_token) {
          apiClient.setToken(session.access_token)
        }

        // Fetch all dashboard data
        await Promise.all([
          fetchOverviewStats(),
          fetchActivityReport(),
          fetchStatusDistribution(),
          fetchPendingIntakes(),
        ])
      } catch (err) {
        console.error('Error initializing dashboard:', err)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [router])

  const fetchOverviewStats = async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/dashboard/overview')
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchActivityReport = async () => {
    try {
      const response = await apiClient.get(`/api/v1/admin/dashboard/activity?days=${daysRange}`)
      if (response.success) {
        setActivity(response.data)
      }
    } catch (err) {
      console.error('Error fetching activity:', err)
    }
  }

  const fetchStatusDistribution = async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/dashboard/status-distribution')
      if (response.success) {
        setStatusDist(response.data.status_distribution || {})
      }
    } catch (err) {
      console.error('Error fetching status distribution:', err)
    }
  }

  const fetchPendingIntakes = async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/dashboard/pending-review?limit=10')
      if (response.success) {
        setPendingIntakes(response.data.pending_intakes || [])
      }
    } catch (err) {
      console.error('Error fetching pending intakes:', err)
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div 
      style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '0.5rem', 
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#111827' }}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={16} style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>{trend}</span>
            </div>
          )}
        </div>
        <div 
          style={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '0.75rem', 
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
          <p style={{ color: '#4b5563' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Dashboard</h1>
              <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Overview of system activity and intakes</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} style={{ color: '#6b7280' }} />
              <select
                value={daysRange}
                onChange={(e) => {
                  setDaysRange(parseInt(e.target.value))
                  fetchActivityReport()
                }}
                className="px-3 py-2 rounded-lg outline-none"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#111827'
                }}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Intakes"
            value={stats?.total_sessions || 0}
            icon={FileText}
            color="#a855f7"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress_sessions || 0}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard
            title="Completed"
            value={stats?.completed_sessions || 0}
            icon={CheckCircle}
            color="#10b981"
          />
          <StatCard
            title="Completion Rate"
            value={`${Math.round(stats?.completion_rate || 0)}%`}
            icon={BarChart3}
            color="#3b82f6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <div 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Status Distribution</h2>
            <div className="space-y-3">
              {Object.entries(statusDist).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                      {status.replace('anon_', 'Anonymous ').toUpperCase()}
                    </span>
                    <span style={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500 }}>
                      {count}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '0.25rem', 
                      height: '0.5rem',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      style={{ 
                        backgroundColor: '#a855f7', 
                        height: '100%',
                        width: `${stats?.total_sessions ? (count / stats.total_sessions * 100) : 0}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Intakes */}
          <div 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Pending Review</h2>
              <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            </div>

            {pendingIntakes.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                <p style={{ color: '#4b5563' }}>All intakes have been reviewed!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Client</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Submitted</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingIntakes.map((intake, idx) => (
                      <tr key={intake.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: '#111827' }}>{intake.client_name}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>{intake.client_email}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>
                          {new Date(intake.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => router.push(`/admin/intakes?id=${intake.id}`)}
                            className="font-medium transition"
                            style={{ color: '#a855f7' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#9333ea')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#a855f7')}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
