'use client'

import { useState, useEffect } from 'react'
import { X, Clock, AlertCircle, CheckCircle, Save, FileText, MessageSquare, PlusCircle, Edit2 } from 'lucide-react'

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
  const [adminNotes, setAdminNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'notes'>('overview')
  const [showSavedNotesInfo, setShowSavedNotesInfo] = useState(true)

  // Sync notes when intake changes
  useEffect(() => {
    if (intake?.intake) {
      setAdminNotes(intake.intake?.notes || '')
      setHasUnsavedChanges(false)
      setShowSavedNotesInfo(true)
    }
  }, [intake?.intake?.id])

  if (!isOpen || !intake) return null

  const intakeData = intake?.intake || intake
  const responses = intake?.responses || []

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string; color: string }> = {
      new: { 
        bg: 'bg-slate-100', 
        text: 'text-slate-700', 
        icon: AlertCircle,
        label: 'New',
        color: '#0f172a'
      },
      assigned: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        icon: CheckCircle,
        label: 'Assigned',
        color: '#92400e'
      },
      'in_progress': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        icon: Clock,
        label: 'In Progress',
        color: '#1e40af'
      },
      'completed': { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: CheckCircle,
        label: 'Completed',
        color: '#166534'
      },
    }
    return config[status] || config.new
  }

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true)
      await onNotesChange(adminNotes)
      setHasUnsavedChanges(false)
      setShowSavedNotesInfo(true)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleNotesChange = (value: string) => {
    setAdminNotes(value)
    setHasUnsavedChanges(value !== (intakeData?.notes || ''))
    setShowSavedNotesInfo(false)
  }

  const statusOptions = ['new', 'assigned', 'in_progress', 'completed']
  const statusConfig = getStatusConfig(intakeData.status)
  const StatusIcon = statusConfig.icon

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem', 
        zIndex: 50,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '1rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          maxWidth: '64rem', 
          width: '100%', 
          maxHeight: '90vh', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-12 text-center flex-1 flex items-center justify-center">
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
              <p style={{ color: '#4b5563' }}>Loading intake details...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header with gradient */}
            <div style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', 
              color: '#ffffff', 
              padding: '2rem' 
            }}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '0.5rem',
                      borderRadius: '0.5rem'
                    }}>
                      <FileText size={20} />
                    </div>
                    <h2 className="text-3xl font-bold truncate">{intakeData.client_name}</h2>
                  </div>
                  <p style={{ color: '#f3e8ff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {intakeData.client_email}
                  </p>
                  {intakeData.client_phone && (
                    <p style={{ color: '#f3e8ff', fontSize: '0.85rem' }}>
                      📱 {intakeData.client_phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition flex-shrink-0"
                  style={{ color: '#ffffff' }}
                  title="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Status and Control Bar */}
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderBottom: '1px solid #e5e7eb', 
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div className="flex items-center gap-2">
                <div style={{ 
                  backgroundColor: statusConfig.bg,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <StatusIcon size={16} style={{ color: statusConfig.color }} />
                  <span className="text-sm font-semibold" style={{ color: statusConfig.color }}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    disabled={updating || intakeData.status === status}
                    className="px-3 py-2 rounded-lg font-medium text-sm transition"
                    style={{
                      backgroundColor: intakeData.status === status ? '#a855f7' : '#e5e7eb',
                      color: intakeData.status === status ? '#ffffff' : '#374151',
                      opacity: updating || intakeData.status === status ? 0.6 : 1,
                      cursor: updating || intakeData.status === status ? 'not-allowed' : 'pointer',
                      fontWeight: intakeData.status === status ? '600' : '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!(updating || intakeData.status === status)) {
                        e.currentTarget.style.backgroundColor = '#d1d5db'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(updating || intakeData.status === status)) {
                        e.currentTarget.style.backgroundColor = '#e5e7eb'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
              <div className="flex" style={{ padding: '0 2rem' }}>
                {(['overview', 'responses', 'notes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-3 font-medium text-sm transition border-b-2"
                    style={{
                      borderColor: activeTab === tab ? '#a855f7' : 'transparent',
                      color: activeTab === tab ? '#a855f7' : '#6b7280',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.color = '#4b5563'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.color = '#6b7280'
                      }
                    }}
                  >
                    {tab === 'overview' && '📋 Overview'}
                    {tab === 'responses' && `📝 Responses (${responses.length})`}
                    {tab === 'notes' && '💬 Notes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#ffffff' }}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div style={{ padding: '2rem' }}>
                  <div className="space-y-6">
                    {/* Client Information */}
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>👤 Client Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div style={{ 
                          padding: '1rem', 
                          borderRadius: '0.75rem',
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb'
                        }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</p>
                          <p style={{ color: '#111827', fontSize: '1rem', fontWeight: '600' }}>{intakeData.client_name}</p>
                        </div>
                        <div style={{ 
                          padding: '1rem', 
                          borderRadius: '0.75rem',
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb'
                        }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                          <p style={{ color: '#111827', fontSize: '1rem', fontWeight: '600', wordBreak: 'break-all' }}>{intakeData.client_email}</p>
                        </div>
                        {intakeData.client_phone && (
                          <div style={{ 
                            padding: '1rem', 
                            borderRadius: '0.75rem',
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb'
                          }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</p>
                            <p style={{ color: '#111827', fontSize: '1rem', fontWeight: '600' }}>{intakeData.client_phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div>
                      <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>📅 Submission Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div style={{ 
                          padding: '1rem', 
                          borderRadius: '0.75rem',
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb'
                        }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</p>
                          <p style={{ color: '#111827', fontSize: '0.95rem' }}>
                            {new Date(intakeData.created_at).toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                        {intakeData.updated_at && (
                          <div style={{ 
                            padding: '1rem', 
                            borderRadius: '0.75rem',
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb'
                          }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</p>
                            <p style={{ color: '#111827', fontSize: '0.95rem' }}>
                              {new Date(intakeData.updated_at).toLocaleString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Responses Tab */}
              {activeTab === 'responses' && (
                <div style={{ padding: '2rem' }}>
                  {responses && responses.length > 0 ? (
                    <div className="space-y-4">
                      {responses.map((response: any, idx: number) => (
                        <div 
                          key={idx} 
                          style={{ 
                            padding: '1.25rem', 
                            borderRadius: '0.75rem',
                            backgroundColor: idx % 2 === 0 ? '#f0fdf4' : '#faf5ff',
                            border: `1px solid ${idx % 2 === 0 ? '#dcfce7' : '#f3e8ff'}`
                          }}
                        >
                          <p className="text-xs font-bold mb-2" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {response.metadata?.question_key || response.metadata?.step || `Response ${idx + 1}`}
                          </p>
                          <p style={{ color: '#111827', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {response.content || response.message || 'No response provided'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        marginBottom: '1rem' 
                      }}>
                        <MessageSquare size={32} style={{ color: '#cbd5e1' }} />
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '1rem' }}>No responses available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Display Saved Notes */}
                  {intakeData.notes && showSavedNotesInfo && (
                    <div style={{ 
                      padding: '1.25rem', 
                      borderRadius: '0.75rem',
                      backgroundColor: '#f0fdf4', 
                      border: '1px solid #dcfce7',
                      marginBottom: '1.5rem'
                    }}>
                      <div className="flex items-start gap-2 mb-2">
                        <span style={{ fontSize: '1.2rem' }}>📌</span>
                        <p className="text-xs font-bold" style={{ color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Notes</p>
                      </div>
                      <p style={{ 
                        color: '#15803d', 
                        fontSize: '0.95rem', 
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word'
                      }}>
                        {intakeData.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Edit/Add Notes Section */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        color: '#111827'
                      }}>
                        {intakeData.notes ? '✏️ Edit or Add Notes' : '✍️ Add Notes'}
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Add internal notes about this intake. These notes are only visible to admins..."
                        style={{ 
                          flex: 1,
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          border: '1px solid #d1d5db',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          color: '#111827',
                          resize: 'none',
                          minHeight: '200px'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#a855f7'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)'
                          e.currentTarget.style.backgroundColor = '#faf5ff'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.backgroundColor = '#ffffff'
                        }}
                      />
                    </div>
                    
                    {/* Save Status and Button */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div className="flex items-center gap-2">
                        {hasUnsavedChanges ? (
                          <>
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%',
                              backgroundColor: '#f59e0b',
                              animation: 'pulse 2s infinite'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: '500' }}>
                              Unsaved changes
                            </span>
                          </>
                        ) : (
                          <>
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%',
                              backgroundColor: '#10b981'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                              All changes saved
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes || !hasUnsavedChanges}
                        className="px-4 py-2 text-white rounded-lg transition font-medium flex items-center gap-2"
                        style={{
                          backgroundColor: !hasUnsavedChanges ? '#d1d5db' : isSavingNotes ? '#9ca3af' : '#a855f7',
                          cursor: isSavingNotes || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
                          opacity: isSavingNotes || !hasUnsavedChanges ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!(isSavingNotes || !hasUnsavedChanges)) {
                            e.currentTarget.style.backgroundColor = '#9333ea'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(isSavingNotes || !hasUnsavedChanges)) {
                            e.currentTarget.style.backgroundColor = '#a855f7'
                          }
                        }}
                      >
                        <Save size={16} />
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
