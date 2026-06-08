'use client'

import { useState } from 'react'
import { Trash2, ChevronDown, AlertTriangle, X, Loader } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onDeleteSelected: () => void
  isDeleting?: boolean
  onClear: () => void
}

export function BulkActionsBar({
  selectedCount,
  onDeleteSelected,
  isDeleting = false,
  onClear,
}: BulkActionsBarProps) {
  const [showMenu, setShowMenu] = useState(false)

  if (selectedCount === 0) return null

  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-0.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <AlertTriangle size={20} style={{ color: '#dc2626' }} />
        <div>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#7f1d1d',
          }}>
            {selectedCount} intake{selectedCount === 1 ? '' : 's'} selected
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#b91c1c',
            marginTop: '0.25rem',
          }}>
            Bulk operations will affect all selected items
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={onClear}
          disabled={isDeleting}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #fca5a5',
            backgroundColor: '#ffffff',
            color: '#7f1d1d',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            opacity: isDeleting ? 0.6 : 1,
            transition: 'all 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = '#fee2e2'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
          }}
        >
          <X size={14} />
          Clear
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isDeleting}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: isDeleting
                ? '#fca5a5'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s ease-out',
              opacity: isDeleting ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {isDeleting ? (
              <>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete All
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </>
            )}
          </button>

          {showMenu && !isDeleting && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                minWidth: '200px',
                overflow: 'hidden',
                animation: 'slideUp 0.2s ease-out',
              }}
            >
              <style>{`
                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(0.5rem);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

              <div style={{ padding: '0.5rem' }}>
                <p style={{
                  margin: 0,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}>
                  Bulk Actions
                </p>

                <button
                  onClick={() => {
                    onDeleteSelected()
                    setShowMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete {selectedCount} intake{selectedCount === 1 ? '' : 's'}</span>
                </button>
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  padding: '0.5rem 0.75rem',
                  lineHeight: 1.4,
                }}>
                  <strong>Warning:</strong> Deleting will permanently remove all selected intakes and their data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
