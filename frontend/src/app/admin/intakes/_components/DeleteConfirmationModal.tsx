'use client'

import { useState } from 'react'
import { AlertTriangle, Loader, Copy, Check } from 'lucide-react'

interface DeleteConfirmationModalProps {
  intake: any
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => Promise<void>
  loading?: boolean
}

export function DeleteConfirmationModal({
  intake,
  isOpen,
  onClose,
  onConfirmDelete,
  loading = false,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen || !intake) return null

  const referenceNum = intake.reference_number || intake.id.substring(0, 8).toUpperCase()
  const requiresConfirmation = confirmText === referenceNum

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onConfirmDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(referenceNum)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '28rem',
          width: '100%',
          overflow: 'hidden',
          animation: 'slideInUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-0.25rem); }
            20%, 40%, 60%, 80% { transform: translateX(0.25rem); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Warning Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            borderBottom: '3px solid #991b1b',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              padding: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={24} style={{ color: '#fecaca' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Delete Intake</h2>
            <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              This action is permanent and cannot be easily undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Deleting this intake will permanently remove:
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                padding: '1rem',
                borderLeft: '4px solid #ef4444',
              }}
            >
              <li style={{
                color: '#111827',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}>
                • Intake for <strong>{intake.client_name}</strong> ({intake.client_email})
              </li>
              <li style={{
                color: '#111827',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}>
                • All client responses and uploaded documents
              </li>
              <li style={{
                color: '#111827',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: 500,
              }}>
                • Admin notes and internal comments
              </li>
              <li style={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}>
                • Complete audit trail (cannot be recovered)
              </li>
            </ul>
          </div>

          {/* Reference Info */}
          <div
            style={{
              backgroundColor: '#fef2f2',
              borderRadius: '0.375rem',
              padding: '1rem',
              borderLeft: '4px solid #fca5a5',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ color: '#7f1d1d', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: 600 }}>
              Reference Number
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#7f1d1d',
                  flex: 1,
                }}
              >
                {referenceNum}
              </code>
              <button
                onClick={handleCopyReference}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#fca5a5',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: '#7f1d1d',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f87171'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fca5a5'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Confirmation Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              Type <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>{referenceNum}</code> to confirm deletion
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter reference number..."
              disabled={isDeleting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${confirmText && !requiresConfirmation ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                fontWeight: 500,
                backgroundColor: '#f9fafb',
                color: '#111827',
                transition: 'all 0.2s ease-out',
                cursor: isDeleting ? 'not-allowed' : 'text',
                opacity: isDeleting ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#111827'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = confirmText && !requiresConfirmation ? '#ef4444' : '#d1d5db'
              }}
            />
            {confirmText && !requiresConfirmation && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>
                ✗ Reference number does not match
              </p>
            )}
            {requiresConfirmation && (
              <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>
                ✓ Ready to delete
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#111827',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
              transition: 'all 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || !requiresConfirmation}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: !requiresConfirmation
                ? '#d1d5db'
                : isDeleting
                  ? '#fca5a5'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: !requiresConfirmation || isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease-out',
              opacity: !requiresConfirmation || isDeleting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (requiresConfirmation && !isDeleting) {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
                e.currentTarget.style.transform = 'translateY(-0.125rem)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isDeleting ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
