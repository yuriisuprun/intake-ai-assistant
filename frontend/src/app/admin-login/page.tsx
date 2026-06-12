'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // No Supabase config check needed anymore
    // Backend handles authentication
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // Call backend authentication endpoint
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed. Please check your credentials.')
      }

      const data = await response.json()

      // Store auth token in localStorage
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_email', data.email)
      localStorage.setItem('user_role', data.role)

      setSuccess('Login successful! Redirecting to intakes...')
      
      // Small delay to show success message, then redirect
      setTimeout(() => {
        router.push('/admin/intakes')
      }, 800)
    } catch (err: any) {
      console.error('Admin login error:', err)
      setError(err.message || 'Failed to log in. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px 16px'
    }}>
      <div 
        className="rounded-xl w-full max-w-md"
        style={{ 
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e5e7eb',
          padding: '40px 32px'
        }}
      >
        {/* Logo/Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            className="inline-flex items-center justify-center rounded-lg mb-4"
            style={{ 
              backgroundColor: '#111827',
              width: '48px',
              height: '48px'
            }}
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827', marginBottom: '8px' }}>
            Admin Access
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Sign in to manage intakes and clients
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            className="rounded-lg mb-6"
            style={{ 
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ marginTop: '2px' }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <p style={{ fontSize: '0.8125rem', lineHeight: '1.5' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            className="rounded-lg mb-6"
            style={{ 
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px 16px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ marginTop: '2px' }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <p style={{ fontSize: '0.8125rem', lineHeight: '1.5' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label className="font-semibold" style={{ color: '#1f2937', marginBottom: '8px', fontSize: '0.875rem', display: 'block' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg outline-none transition"
              style={{ 
                border: '1px solid #d1d5db',
                backgroundColor: loading ? '#f3f4f6' : '#ffffff',
                color: '#111827',
                padding: '10px 12px',
                fontSize: '0.9375rem',
                lineHeight: '1.5'
              }}
              placeholder="Enter your email"
              required
              disabled={loading}
              onFocus={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#111827'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label className="font-semibold" style={{ color: '#1f2937', marginBottom: '8px', fontSize: '0.875rem', display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg outline-none transition"
              style={{ 
                border: '1px solid #d1d5db',
                backgroundColor: loading ? '#f3f4f6' : '#ffffff',
                color: '#111827',
                padding: '10px 12px',
                fontSize: '0.9375rem',
                lineHeight: '1.5'
              }}
              placeholder="Enter your password"
              required
              disabled={loading}
              onFocus={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#111827'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg font-semibold transition flex items-center justify-center"
            style={{
              backgroundColor: loading ? '#d1d5db' : '#111827',
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '11px 16px',
              fontSize: '0.9375rem',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1f2937'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#111827'
              }
            }}
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ 
          marginBottom: '24px',
          borderTop: '1px solid #e5e7eb'
        }}></div>

        {/* Footer Links */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '12px' }}>
            Not an admin?{' '}
            <Link 
              href="/login" 
              className="font-semibold transition"
              style={{ color: '#111827' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
            >
              User Login
            </Link>
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
            <Link 
              href="/" 
              className="font-semibold transition"
              style={{ color: '#111827' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
            >
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
