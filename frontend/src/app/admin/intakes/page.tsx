'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { Eye, Search, Filter, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface AnonymousIntake {
  id: string
  session_id: string
  client_name: string
  client_email: string
  client_phone?: string
  legal_category?: string
  status: string
  created_at: string
  updated_at: string
}

export default function AdminIntakesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [intakes, setIntakes] = useState<AnonymousIntake[]>([])
  const [filteredIntakes, setFilteredIntakes] = useState<AnonymousIntake[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIntake, setSelectedIntake] = useState<AnonymousIntake | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [intakeDetails, setIntakeDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        // Set token for API client
        if (session.access_token) {
          apiClient.setToken(session.access_token)
        }

        // Fetch intakes
        await fetchIntakes()
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchIntakes = async () => {
    try {
      const response = await apiClient.listAnonymousIntakes(0, 100)
      if (response.success) {
        setIntakes(response.data.intakes || [])
        setFilteredIntakes(response.data.intakes || [])
      }
    } catch (err) {
      console.error('Error fetching intakes:', err)
    }
  }

  // Filter intakes
  useEffect(() => {
    let filtered = intakes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (intake) =>
          intake.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intake.client_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((intake) => intake.status === statusFilter)
    }

    setFilteredIntakes(filtered)
  }, [searchTerm, statusFilter, intakes])

  const handleViewDetails = async (intake: AnonymousIntake) => {
    setSelectedIntake(intake)
    setShowDetails(true)
    setLoadingDetails(true)

    try {
      const response = await apiClient.getAnonymousIntakeDetails(intake.id)
      if (response.success) {
        setIntakeDetails(response.data)
        setAdminNotes(response.data.intake?.admin_notes || '')
      }
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
      const response = await apiClient.updateAnonymousIntake(
        selectedIntake.id,
        newStatus,
        adminNotes
      )

      if (response.success) {
        // Update local state
        setIntakes(
          intakes.map((intake) =>
            intake.id === selectedIntake.id
              ? { ...intake, status: newStatus }
              : intake
          )
        )
        setSelectedIntake({ ...selectedIntake, status: newStatus })
        setIntakeDetails({
          ...intakeDetails,
          intake: { ...intakeDetails.intake, status: newStatus, admin_notes: adminNotes },
        })
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      reviewed: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Eye },
      assigned: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.submitted
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Intakes</h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Manage all unregistered client submissions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="assigned">Assigned</option>
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

        {/* Intakes Table */}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Legal Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                  {filteredIntakes.map((intake, idx) => (
                    <tr key={intake.id} style={{ borderBottom: idx < filteredIntakes.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#111827' }}>{intake.client_name}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>{intake.client_email}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#4b5563' }}>
                        {intake.legal_category || '—'}
                      </td>
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

      {/* Details Modal */}
      {showDetails && selectedIntake && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '56rem', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            {loadingDetails ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
                <p style={{ color: '#4b5563' }}>Loading details...</p>
              </div>
            ) : intakeDetails ? (
              <>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIntake.client_name}</h2>
                      <p style={{ color: '#f3e8ff', marginTop: '0.25rem' }}>{selectedIntake.client_email}</p>
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-white hover:text-purple-100 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Status Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Status</h3>
                    <div className="flex items-center gap-3 mb-4">
                      {getStatusBadge(selectedIntake.status)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['submitted', 'reviewed', 'assigned', 'archived'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={updatingStatus || selectedIntake.status === status}
                          className="px-4 py-2 rounded-lg font-medium transition"
                          style={{
                            backgroundColor: selectedIntake.status === status ? '#a855f7' : '#e5e7eb',
                            color: selectedIntake.status === status ? '#ffffff' : '#374151',
                            opacity: updatingStatus || selectedIntake.status === status ? 0.5 : 1,
                            cursor: updatingStatus || selectedIntake.status === status ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!(updatingStatus || selectedIntake.status === status)) {
                              e.currentTarget.style.backgroundColor = '#d1d5db'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!(updatingStatus || selectedIntake.status === status)) {
                              e.currentTarget.style.backgroundColor = '#e5e7eb'
                            }
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Client Information</h3>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                      <div>
                        <p className="text-sm" style={{ color: '#4b5563' }}>Name</p>
                        <p className="font-medium" style={{ color: '#111827' }}>{selectedIntake.client_name}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: '#4b5563' }}>Email</p>
                        <p className="font-medium" style={{ color: '#111827' }}>{selectedIntake.client_email}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: '#4b5563' }}>Phone</p>
                        <p className="font-medium" style={{ color: '#111827' }}>{selectedIntake.client_phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: '#4b5563' }}>Legal Category</p>
                        <p className="font-medium" style={{ color: '#111827' }}>{selectedIntake.legal_category || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Responses */}
                  {intakeDetails.responses && intakeDetails.responses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Intake Responses</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {intakeDetails.responses.map((response: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                            <p className="text-sm mb-1" style={{ color: '#4b5563' }}>
                              {response.metadata?.question_key || `Step ${response.metadata?.step}`}
                            </p>
                            <p style={{ color: '#111827' }}>{response.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Admin Notes</h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this intake..."
                      className="w-full px-4 py-2 rounded-lg outline-none transition"
                      style={{ 
                        border: '1px solid #d1d5db',
                        boxShadow: 'none',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db'
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      rows={4}
                    />
                    <button
                      onClick={() => handleUpdateStatus(selectedIntake.status)}
                      disabled={updatingStatus}
                      className="mt-2 px-4 py-2 text-white rounded-lg transition font-medium"
                      style={{
                        backgroundColor: updatingStatus ? '#9ca3af' : '#a855f7',
                        cursor: updatingStatus ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!updatingStatus) {
                          e.currentTarget.style.backgroundColor = '#9333ea'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!updatingStatus) {
                          e.currentTarget.style.backgroundColor = '#a855f7'
                        }
                      }}
                    >
                      {updatingStatus ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Metadata */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Submitted: {new Date(selectedIntake.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Reference: {selectedIntake.session_id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
