'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { Eye, Search, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { IntakeDetailModal } from './_components/IntakeDetailModal'

interface Intake {
  id: string
  session_id?: string
  client_name: string
  client_email: string
  client_phone?: string
  legal_category?: string
  status: string
  created_at: string
  updated_at?: string
  urgency?: string
}

export default function AdminIntakesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [filteredIntakes, setFilteredIntakes] = useState<Intake[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [intakeDetails, setIntakeDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        if (session.access_token) {
          apiClient.setToken(session.access_token)
        }

        await fetchAllIntakes()
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchAllIntakes = async () => {
    try {
      const response = await apiClient.listAdminIntakes(0, 100)

      const allIntakes: Intake[] = (response.data?.intakes || []).map((s: any) => ({
        ...s,
        id: s.id,
      }))

      setIntakes(allIntakes)
      setFilteredIntakes(allIntakes)
    } catch (err) {
      console.error('Error fetching intakes:', err)
    }
  }

  useEffect(() => {
    let filtered = intakes

    if (searchTerm) {
      filtered = filtered.filter(
        (intake) =>
          intake.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intake.client_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((intake) => intake.status === statusFilter)
    }

    setFilteredIntakes(filtered)
  }, [searchTerm, statusFilter, intakes])

  const handleViewDetails = async (intake: Intake) => {
    setSelectedIntake(intake)
    setShowDetails(true)
    setLoadingDetails(true)

    try {
      let details
      // Fetch details using the generic endpoint
      const response = await apiClient.getAdminIntakeDetails(intake.id)
      details = response.data
      setIntakeDetails(details)
    } catch (err) {
      console.error('Error fetching intake details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIntake) return

    try {
      setUpdatingStatus(true)
      await apiClient.updateAdminIntakeStatus(selectedIntake.id, newStatus)

      setIntakes(
        intakes.map((intake) =>
          intake.id === selectedIntake.id
            ? { ...intake, status: newStatus }
            : intake
        )
      )
      setSelectedIntake({ ...selectedIntake, status: newStatus })
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleUpdateNotes = async (notes: string) => {
    if (!selectedIntake) return

    try {
      await apiClient.addAdminIntakeNote(selectedIntake.id, notes)
    } catch (err) {
      console.error('Error updating notes:', err)
      alert('Failed to update notes')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      new: { bg: 'bg-white', text: 'text-gray-800', icon: Clock },
      assigned: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: CheckCircle },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    }

    const config = statusConfig[status] || statusConfig.new
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
          <p style={{ color: '#4b5563' }}>Loading intakes...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Intakes Management</h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Manage all client submissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3" size={20} style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  boxShadow: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} style={{ color: '#9ca3af' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  boxShadow: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p className="text-sm" style={{ color: '#4b5563' }}>
                Showing {filteredIntakes.length} of {intakes.length} intakes
              </p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {filteredIntakes.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto mb-4" size={48} style={{ color: '#9ca3af' }} />
              <p style={{ color: '#4b5563' }}>No intakes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Reference #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                  {filteredIntakes.map((intake, idx) => (
                    <tr key={intake.id} style={{ borderBottom: idx < filteredIntakes.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono font-bold" style={{ color: '#a855f7' }}>{intake.reference_number || intake.id.substring(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#111827' }}>{intake.client_name}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>{intake.client_email}</td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(intake.status)}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>
                        {new Date(intake.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(intake)}
                          className="font-medium flex items-center gap-1 transition"
                          style={{ color: '#a855f7' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#9333ea')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#a855f7')}
                        >
                          <Eye size={16} />
                          View
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

      <IntakeDetailModal
        intake={selectedIntake}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onStatusChange={handleUpdateStatus}
        onNotesChange={handleUpdateNotes}
        loading={loadingDetails}
        updating={updatingStatus}
      />
    </div>
  )
}
