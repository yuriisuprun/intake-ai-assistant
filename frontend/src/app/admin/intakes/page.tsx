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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intakes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Intakes</h1>
          <p className="text-gray-600 mt-1">Manage all unregistered client submissions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="assigned">Assigned</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">
                Showing {filteredIntakes.length} of {intakes.length} intakes
              </p>
            </div>
          </div>
        </div>

        {/* Intakes Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredIntakes.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No intakes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Legal Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIntakes.map((intake) => (
                    <tr key={intake.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{intake.client_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{intake.client_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {intake.legal_category || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(intake.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(intake.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(intake)}
                          className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetails ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading details...</p>
              </div>
            ) : intakeDetails ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIntake.client_name}</h2>
                      <p className="text-blue-100 mt-1">{selectedIntake.client_email}</p>
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-white hover:text-blue-100 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Status Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                    <div className="flex items-center gap-3 mb-4">
                      {getStatusBadge(selectedIntake.status)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['submitted', 'reviewed', 'assigned', 'archived'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={updatingStatus || selectedIntake.status === status}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedIntake.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } disabled:opacity-50`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{selectedIntake.client_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedIntake.client_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedIntake.client_phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Legal Category</p>
                        <p className="font-medium text-gray-900">{selectedIntake.legal_category || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Responses */}
                  {intakeDetails.responses && intakeDetails.responses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Intake Responses</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {intakeDetails.responses.map((response: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">
                              {response.metadata?.question_key || `Step ${response.metadata?.step}`}
                            </p>
                            <p className="text-gray-900">{response.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this intake..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <button
                      onClick={() => handleUpdateStatus(selectedIntake.status)}
                      disabled={updatingStatus}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {updatingStatus ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(selectedIntake.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
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
