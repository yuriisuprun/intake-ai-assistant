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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Intakes Management</h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Manage all client submissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BulkActionsBar
          selectedCount={selectedIntakes.size}
          onDeleteSelected={handleBulkDeleteClick}
          isDeleting={bulkDeleting}
          onClear={() => setSelectedIntakes(new Set())}
        />

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
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '2.5rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedIntakes.size === filteredIntakes.length && filteredIntakes.length > 0}
                        onChange={handleSelectAll}
                        style={{
                          cursor: 'pointer',
                          width: '1.125rem',
                          height: '1.125rem',
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Reference #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Client</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#111827' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                  {filteredIntakes.map((intake, idx) => (
                    <tr
                      key={intake.id}
                      style={{
                        borderBottom: idx < filteredIntakes.length - 1 ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: selectedIntakes.has(intake.id)
                          ? '#f3f4f6'
                          : idx % 2 === 0
                            ? '#ffffff'
                            : '#f9fafb',
                      }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIntakes.has(intake.id)}
                          onChange={() => handleSelectIntake(intake.id)}
                          style={{
                            cursor: 'pointer',
                            width: '1.125rem',
                            height: '1.125rem',
                          }}
                        />
                      </td>
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
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                          <button
                            onClick={() => handleDeleteClick(intake)}
                            className="font-medium flex items-center gap-1 transition"
                            style={{ color: '#ef4444' }}
                            title="Delete intake"
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#ef4444')}
                          >
                            <Trash2 size={16} />
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
        intake={selectedIntake}
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
