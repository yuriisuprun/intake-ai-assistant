'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastNotificationProps {
  message: string
  type: ToastType
  duration?: number
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export function ToastNotification({
  message,
  type,
  duration = 4000,
  onDismiss,
  action,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  if (!isVisible) return null

  const typeConfig = {
    success: {
      bg: '#dcfce7',
      border: '#86efac',
      text: '#166534',
      icon: CheckCircle,
    },
    error: {
      bg: '#fee2e2',
      border: '#fecaca',
      text: '#7f1d1d',
      icon: AlertCircle,
    },
    info: {
      bg: '#dbeafe',
      border: '#93c5fd',
      text: '#1e40af',
      icon: Info,
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        maxWidth: '24rem',
        zIndex: 50,
        animation: 'slideInUp 0.3s ease-out',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
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
      `}</style>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Icon size={20} style={{ color: config.text, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{
            color: config.text,
            fontSize: '0.875rem',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                borderRadius: '0.25rem',
                color: config.text,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
              }}
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss?.()
          }}
          style={{
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: config.text,
            opacity: 0.7,
            transition: 'opacity 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// Hook for managing toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<(ToastNotificationProps & { id: string })[]>([])

  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, message, type, duration, action }

    setToasts((prev) => [...prev, newToast])

    return () => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }
  }

  return { toasts, showToast, setToasts }
}
