'use client'

import { useState } from 'react'
import { X, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface IntakeDetailModalProps {
  intake: any
  isOpen: boolean
  onClose: () => void
  onStatusChange: (newStatus: string) => Promise<void>
  onNotesChange: (notes: string) => Promise<void>
  loading: boolean
  updating: boolean
}

export function IntakeDetailModal({
  intake,
  isOpen,
  onClose,
  onStatusChange,
  onNotesChange,
  loading,
  updating,
}: IntakeDetailModalProps) {
  const [adminNotes, setAdminNotes] = useState(intake?.admin_notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  if (!isOpen || !intake) return null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      assigned: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
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

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true)
      await onNotesChange(adminNotes)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const statusOptions = [
    'new', 'assigned', 'in_progress', 'completed', 'archived'
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '56rem', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
            <p style={{ color: '#4b5563' }}>Loading details...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{intake.client_name}</h2>
                  <p style={{ color: '#f3e8ff', marginTop: '0.25rem' }}>{intake.client_email}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-purple-100 text-2xl"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Status</h3>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusBadge(intake.status)}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusChange(status)}
                      disabled={updating || intake.status === status}
                      className="px-4 py-2 rounded-lg font-medium transition"
                      style={{
                        backgroundColor: intake.status === status ? '#a855f7' : '#e5e7eb',
                        color: intake.status === status ? '#ffffff' : '#374151',
                        opacity: updating || intake.status === status ? 0.5 : 1,
                        cursor: updating || intake.status === status ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!(updating || intake.status === status)) {
                          e.currentTarget.style.backgroundColor = '#d1d5db'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(updating || intake.status === status)) {
                          e.currentTarget.style.backgroundColor = '#e5e7eb'
                        }
                      }}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
                    <p className="font-medium" style={{ color: '#111827' }}>{intake.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Email</p>
                    <p className="font-medium" style={{ color: '#111827' }}>{intake.client_email}</p>
                  </div>
                  {intake.client_phone && (
                    <div>
                      <p className="text-sm" style={{ color: '#4b5563' }}>Phone</p>
                      <p className="font-medium" style={{ color: '#111827' }}>{intake.client_phone || '—'}</p>
                    </div>
                  )}
                  {intake.legal_category && (
                    <div>
                      <p className="text-sm" style={{ color: '#4b5563' }}>Legal Category</p>
                      <p className="font-medium" style={{ color: '#111827' }}>{intake.legal_category || '—'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Responses */}
              {intake.responses && intake.responses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Intake Responses</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {intake.responses.map((response: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <p className="text-sm mb-1" style={{ color: '#4b5563' }}>
                          {response.metadata?.question_key || `Step ${response.metadata?.step}` || `Response ${idx + 1}`}
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
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="mt-2 px-4 py-2 text-white rounded-lg transition font-medium"
                  style={{
                    backgroundColor: isSavingNotes ? '#9ca3af' : '#a855f7',
                    cursor: isSavingNotes ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavingNotes) {
                      e.currentTarget.style.backgroundColor = '#9333ea'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingNotes) {
                      e.currentTarget.style.backgroundColor = '#a855f7'
                    }
                  }}
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Metadata */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  Submitted: {new Date(intake.created_at).toLocaleString()}
                </p>
                {intake.session_id && (
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Reference: {intake.session_id.substring(0, 8).toUpperCase()}
                  </p>
                )}
                {intake.updated_at && (
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Last Updated: {new Date(intake.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
