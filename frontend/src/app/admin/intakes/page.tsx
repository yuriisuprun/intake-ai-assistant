'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { Eye, Search, Filter, AlertCircle, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { IntakeDetailModal } from './_components/IntakeDetailModal'
import { DeleteConfirmationModal } from './_components/DeleteConfirmationModal'
import { BulkActionsBar } from './_components/BulkActionsBar'
import { ToastNotification, useToast, type ToastType } from './_components/ToastNotification'

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
  reference_number?: string
}

export default function AdminIntakesPage() {
  const router = useRouter()
  const { toasts, showToast, setToasts } = useToast()
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
  const [deleteIntake, setDeleteIntake] = useState<Intake | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingMode, setDeletingMode] = useState<'single' | 'bulk'>('single')
  const [selectedIntakes, setSelectedIntakes] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

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
      showToast('Failed to load intakes', 'error')
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
      const response = await apiClient.getAdminIntakeDetails(intake.id)
      const details = response.data
      setIntakeDetails(details)
    } catch (err) {
      console.error('Error fetching intake details:', err)
      showToast('Failed to load intake details', 'error')
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
      showToast('Status updated successfully', 'success')
    } catch (err) {
      console.error('Error updating status:', err)
      showToast('Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleUpdateNotes = async (notes: string) => {
    if (!selectedIntake) return

    try {
      await apiClient.addAdminIntakeNote(selectedIntake.id, notes)
      showToast('Notes saved successfully', 'success')
    } catch (err) {
      console.error('Error updating notes:', err)
      showToast('Failed to save notes', 'error')
    }
  }

  const handleDeleteClick = (intake: Intake) => {
    setDeleteIntake(intake)
    setDeletingMode('single')
    setShowDeleteConfirm(true)
  }

  const handleSelectIntake = (intakeId: string) => {
    setSelectedIntakes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(intakeId)) {
        newSet.delete(intakeId)
      } else {
        newSet.add(intakeId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIntakes.size === filteredIntakes.length) {
      setSelectedIntakes(new Set())
    } else {
      setSelectedIntakes(new Set(filteredIntakes.map((i) => i.id)))
    }
  }

  const handleBulkDeleteClick = () => {
    setDeleteIntake(null)
    setDeletingMode('bulk')
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (deletingMode === 'single' && !deleteIntake) return
    if (deletingMode === 'bulk' && selectedIntakes.size === 0) return

    try {
      if (deletingMode === 'single') {
        await apiClient.deleteAdminIntake(deleteIntake!.id)
        setIntakes(intakes.filter((i) => i.id !== deleteIntake!.id))
        showToast(`Intake for ${deleteIntake!.client_name} deleted successfully`, 'success')
      } else {
        // Bulk delete
        setBulkDeleting(true)
        const deletePromises = Array.from(selectedIntakes).map((id) =>
          apiClient.deleteAdminIntake(id)
        )

        const results = await Promise.allSettled(deletePromises)
        const successful = results.filter((r) => r.status === 'fulfilled').length
        const failed = results.filter((r) => r.status === 'rejected').length

        setIntakes(intakes.filter((i) => !selectedIntakes.has(i.id)))
        setSelectedIntakes(new Set())

        if (failed === 0) {
          showToast(`${successful} intake${successful === 1 ? '' : 's'} deleted successfully`, 'success')
        } else {
          showToast(
            `Deleted ${successful} intake${successful === 1 ? '' : 's'}, ${failed} failed`,
            'error'
          )
        }

        setBulkDeleting(false)
      }

      setShowDeleteConfirm(false)
      setDeleteIntake(null)
    } catch (err) {
      console.error('Error deleting intake:', err)
      showToast(
        err instanceof Error ? err.message : 'Failed to delete intake. Please try again.',
        'error'
      )
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      new: { bg: 'bg-gray-200', text: 'text-gray-800', icon: Clock },
      assigned: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: CheckCircle },
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

  // Calculate stats
  const totalIntakes = intakes.length
  const newIntakes = intakes.filter(i => i.status === 'new').length
  const inProgressIntakes = intakes.filter(i => i.status === 'in_progress').length
  const completedIntakes = intakes.filter(i => i.status === 'completed').length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#0f172a' }}>Intakes</h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage and track all client submissions</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Total Intakes</p>
              <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{totalIntakes}</p>
            </div>
            <div style={{ backgroundColor: '#fef3c7', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #fcd34d' }}>
              <p style={{ color: '#78350f', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>New</p>
              <p className="text-2xl font-bold" style={{ color: '#78350f' }}>{newIntakes}</p>
            </div>
            <div style={{ backgroundColor: '#dbeafe', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #93c5fd' }}>
              <p style={{ color: '#1e40af', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>In Progress</p>
              <p className="text-2xl font-bold" style={{ color: '#1e40af' }}>{inProgressIntakes}</p>
            </div>
            <div style={{ backgroundColor: '#dcfce7', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #86efac' }}>
              <p style={{ color: '#166534', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: '#166534' }}>{completedIntakes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Actions Bar */}
        <BulkActionsBar selectedCount={selectedIntakes.size}
          onDeleteSelected={handleBulkDeleteClick}
          isDeleting={bulkDeleting}
          onClear={() => setSelectedIntakes(new Set())}/>

        {/* Filters Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label style={{ display: 'block', color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5" size={18} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg outline-none transition"
                  style={{ 
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9375rem',
                    backgroundColor: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#a855f7'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)'
                    e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', color: '#0f172a', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  backgroundColor: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)'
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.backgroundColor = '#f8fafc'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {filteredIntakes.length} of {totalIntakes} {totalIntakes === 1 ? 'intake' : 'intakes'} shown
              {statusFilter !== 'all' && ` • Filtered by: ${statusFilter.replace('_', ' ')}`}
              {searchTerm && ` • Search: "${searchTerm}"`}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {filteredIntakes.length === 0 ? (
            <div className="p-12 text-center">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                </div>
              </div>
              <p className="text-lg font-semibold" style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No intakes found</p>
              <p style={{ color: '#64748b' }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'No client submissions yet. They will appear here when submitted.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'center', width: '2.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedIntakes.size === filteredIntakes.length && filteredIntakes.length > 0}
                        onChange={handleSelectAll}
                        style={{
                          cursor: 'pointer',
                          width: '1.25rem',
                          height: '1.25rem',
                          accentColor: '#a855f7',
                        }}
                        title="Select all intakes on this page"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Submitted</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIntakes.map((intake, idx) => (
                    <tr
                      key={intake.id}
                      style={{
                        borderBottom: idx < filteredIntakes.length - 1 ? '1px solid #e2e8f0' : 'none',
                        backgroundColor: selectedIntakes.has(intake.id)
                          ? '#f0f4ff'
                          : '#ffffff',
                      }}
                      className="hover:bg-slate-50 transition"
                    >
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIntakes.has(intake.id)}
                          onChange={() => handleSelectIntake(intake.id)}
                          style={{
                            cursor: 'pointer',
                            width: '1.25rem',
                            height: '1.25rem',
                            accentColor: '#a855f7',
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold" style={{ color: '#a855f7' }}>{intake.reference_number || intake.id.substring(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0f172a' }}>{intake.client_name}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>{intake.client_email}</td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(intake.status)}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>
                        {new Date(intake.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleViewDetails(intake)}
                            className="px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition"
                            style={{ 
                              backgroundColor: '#a855f7',
                              color: '#ffffff',
                              fontSize: '0.875rem',
                              border: '1px solid #a855f7'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#9333ea'
                              e.currentTarget.style.borderColor = '#9333ea'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#a855f7'
                              e.currentTarget.style.borderColor = '#a855f7'
                            }}
                            title="View intake details"
                          >
                            <Eye size={16} />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(intake)}
                            className="px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition"
                            style={{ 
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              fontSize: '0.875rem',
                              border: '1px solid #fecaca'
                            }}
                            title="Delete intake"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2'
                              e.currentTarget.style.borderColor = '#fecaca'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.borderColor = '#fecaca'
                            }}
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
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
        intake={intakeDetails}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onStatusChange={handleUpdateStatus}
        onNotesChange={handleUpdateNotes}
        loading={loadingDetails}
        updating={updatingStatus}
      />

      <DeleteConfirmationModal
        intake={
          deletingMode === 'single'
            ? deleteIntake
            : {
                client_name: `${selectedIntakes.size} intakes`,
                client_email: '',
                reference_number: `BULK_DELETE_${selectedIntakes.size}`,
              }
        }
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteIntake(null)
        }}
        onConfirmDelete={handleConfirmDelete}
        loading={deletingMode === 'bulk' && bulkDeleting}
      />

      {/* Toast Notifications Container */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 40 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              marginBottom: '0.5rem',
            }}
          >
            <ToastNotification
              {...toast}
              onDismiss={() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
