'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { adminApi } from '@/lib/api/admin'
import {
  Search, Filter, Download, CheckCircle, Clock, AlertCircle, Zap,
  TrendingUp, Users, Loader, ChevronDown, AlertTriangle, Flag
} from 'lucide-react'

interface Intake {
  id: string
  client_name: string
  client_email: string
  status: string
  legal_category: string
  urgency: string
  created_at: string
  updated_at: string
}

interface MetricsData {
  total_intakes: number
  completed: number
  in_progress: number
  completion_rate: number
  average_completion_hours: number
  by_category: Record<string, number>
  by_urgency: Record<string, number>
}

export default function IntakesManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [filteredIntakes, setFilteredIntakes] = useState<Intake[]>([])
  const [selectedIntakes, setSelectedIntakes] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)
  const [bulkStatusAction, setBulkStatusAction] = useState<string | null>(null)
  const [workloadData, setWorkloadData] = useState<any[]>([])

  // Check authentication and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/admin/login')
          return
        }

        setUser(session.user)

        if (session.access_token) {
          // Set token in API client - assuming it has this capability
        }

        // Load all data
        await Promise.all([
          fetchIntakes(),
          fetchMetrics(),
          fetchTeamWorkload(),
        ])
      } catch (err) {
        console.error('Error initializing:', err)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router])

  const fetchIntakes = async () => {
    try {
      const response = await adminApi.intake.list(0, 100)
      if (response.success) {
        setIntakes(response.data.sessions || [])
      }
    } catch (err) {
      console.error('Error fetching intakes:', err)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await adminApi.intakesManagement.getMetrics(30)
      if (response.success) {
        setMetrics(response.data)
      }
    } catch (err) {
      console.error('Error fetching metrics:', err)
    }
  }

  const fetchTeamWorkload = async () => {
    try {
      const response = await adminApi.intakesManagement.getTeamWorkload()
      if (response.success) {
        setWorkloadData(response.data.team_workload || [])
      }
    } catch (err) {
      console.error('Error fetching workload:', err)
    }
  }

  // Filter intakes
  useEffect(() => {
    let filtered = intakes

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        i => i.client_name.toLowerCase().includes(lower) ||
             i.client_email.toLowerCase().includes(lower)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter)
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(i => i.urgency === urgencyFilter)
    }

    setFilteredIntakes(filtered)
  }, [searchTerm, statusFilter, urgencyFilter, intakes])

  // Toggle intake selection
  const toggleIntakeSelection = (intakeId: string) => {
    const newSelected = new Set(selectedIntakes)
    if (newSelected.has(intakeId)) {
      newSelected.delete(intakeId)
    } else {
      newSelected.add(intakeId)
    }
    setSelectedIntakes(newSelected)
  }

  // Select all filtered intakes
  const selectAllFiltered = () => {
    if (selectedIntakes.size === filteredIntakes.length) {
      setSelectedIntakes(new Set())
    } else {
      setSelectedIntakes(new Set(filteredIntakes.map(i => i.id)))
    }
  }

  // Bulk update status
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIntakes.size === 0) {
      alert('Please select intakes to update')
      return
    }

    try {
      setBulkOperationLoading(true)
      const sessionIds = Array.from(selectedIntakes)
      const response = await adminApi.intakesManagement.bulkUpdateStatus(sessionIds, newStatus)

      if (response.success) {
        // Update local state
        setIntakes(intakes.map(intake => 
          selectedIntakes.has(intake.id)
            ? { ...intake, status: newStatus, updated_at: new Date().toISOString() }
            : intake
        ))
        setSelectedIntakes(new Set())
        alert(`Successfully updated ${response.data.updated} intakes`)
        await fetchMetrics()
      }
    } catch (err) {
      console.error('Error bulk updating:', err)
      alert('Failed to bulk update intakes')
    } finally {
      setBulkOperationLoading(false)
    }
  }

  // Export data
  const handleExport = async () => {
    try {
      const response = await adminApi.intakesManagement.export(
        statusFilter !== 'all' ? statusFilter : undefined,
        undefined,
        urgencyFilter !== 'all' ? urgencyFilter : undefined
      )

      if (response.success) {
        // Convert to CSV
        const csv = convertToCSV(response.data.intakes)
        downloadCSV(csv, 'intakes-export.csv')
      }
    } catch (err) {
      console.error('Error exporting:', err)
      alert('Failed to export data')
    }
  }

  const convertToCSV = (data: any[]) => {
    const headers = ['ID', 'Client', 'Email', 'Category', 'Status', 'Urgency', 'Created At']
    const rows = data.map(item => [
      item.id,
      item.client,
      item.email,
      item.category,
      item.status,
      item.urgency,
      item.created_at,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // UI Helper functions
  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: any }> = {
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'submitted': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      'archived': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
    }
    const config = colors[status] || colors['submitted']
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600',
    }
    return colors[urgency] || 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#a855f7' }} />
          <p style={{ color: '#4b5563' }}>Loading intakes management...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Intakes Management</h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Advanced intake management with bulk operations and analytics</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Intakes</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#111827' }}>{metrics.total_intakes}</p>
                </div>
                <Zap style={{ color: '#a855f7' }} size={32} />
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completed</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#10b981' }}>{metrics.completed}</p>
                </div>
                <CheckCircle style={{ color: '#10b981' }} size={32} />
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completion Rate</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#f59e0b' }}>{metrics.completion_rate.toFixed(1)}%</p>
                </div>
                <TrendingUp style={{ color: '#f59e0b' }} size={32} />
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg Time (hrs)</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#06b6d4' }}>{metrics.average_completion_hours}</p>
                </div>
                <Clock style={{ color: '#06b6d4' }} size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Controls & Filters */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3" size={20} style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none transition"
                style={{ border: '1px solid #d1d5db' }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} style={{ color: '#9ca3af' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg outline-none transition"
                style={{ border: '1px solid #d1d5db' }}
              >
                <option value="all">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="submitted">Submitted</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-2 rounded-lg outline-none transition"
              style={{ border: '1px solid #d1d5db' }}
            >
              <option value="all">All Urgencies</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#10b981', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <Download size={18} />
              Export
            </button>
          </div>

          {/* Selection and Bulk Actions */}
          {selectedIntakes.size > 0 && (
            <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}>
              <div>
                <p style={{ color: '#1e40af', fontWeight: '600' }}>
                  {selectedIntakes.size} intake{selectedIntakes.size !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex gap-2">
                {['in_progress', 'completed', 'archived'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusUpdate(status)}
                    disabled={bulkOperationLoading}
                    className="px-3 py-1 rounded text-sm font-medium transition"
                    style={{
                      backgroundColor: '#a855f7',
                      color: '#ffffff',
                      opacity: bulkOperationLoading ? 0.5 : 1,
                      cursor: bulkOperationLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {bulkOperationLoading ? 'Processing...' : `Mark ${status.replace('_', ' ')}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select All */}
          <button
            onClick={selectAllFiltered}
            className="text-sm transition mt-3"
            style={{ color: '#a855f7', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#9333ea'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a855f7'}
          >
            {selectedIntakes.size === filteredIntakes.length && filteredIntakes.length > 0
              ? 'Deselect All'
              : `Select All (${filteredIntakes.length})`}
          </button>
        </div>

        {/* Intakes Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          {filteredIntakes.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
              <p style={{ color: '#4b5563' }}>No intakes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIntakes.size === filteredIntakes.length && filteredIntakes.length > 0}
                        onChange={selectAllFiltered}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: '#a855f7' }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Urgency</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIntakes.map((intake, idx) => (
                    <tr
                      key={intake.id}
                      style={{
                        borderBottom: idx < filteredIntakes.length - 1 ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: selectedIntakes.has(intake.id) ? '#f3e8ff' : (idx % 2 === 0 ? '#ffffff' : '#f9fafb'),
                      }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIntakes.has(intake.id)}
                          onChange={() => toggleIntakeSelection(intake.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: '#a855f7' }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#111827' }}>
                        {intake.client_name}
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{intake.client_email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>
                        {intake.legal_category || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(intake.status)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${getUrgencyColor(intake.urgency)}`}>
                        {intake.urgency.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>
                        {new Date(intake.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Team Workload */}
        {workloadData.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                <Users size={20} style={{ color: '#a855f7' }} />
                Team Workload Distribution
              </h3>
              <div className="space-y-3">
                {workloadData.map((member, idx) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: `hsl(${280 + (idx * 40)}, 70%, 60%)` }}
                      >
                        {member.role.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#111827' }}>
                          {member.role.toUpperCase()}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          {member.user_id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{ color: '#a855f7' }}>
                        {member.assigned_count}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>assigned</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            {metrics && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Intakes by Category</h3>
                <div className="space-y-2">
                  {Object.entries(metrics.by_category).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-2">
                      <p style={{ color: '#4b5563' }}>{category}</p>
                      <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#f0f9ff', color: '#1e40af' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
