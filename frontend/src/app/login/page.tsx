'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/common/Footer'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [configError, setConfigError] = useState('')

  useEffect(() => {
    // Check Supabase configuration on mount
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setConfigError(
        'Supabase is not properly configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
      )
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (configError) {
        throw new Error(configError)
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error('Supabase login error:', loginError)
        throw loginError
      }

      // Redirect to admin intakes page after login
      router.push('/admin/intakes')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div 
          className="rounded-xl w-full max-w-md"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '40px 32px'
          }}
        >
          {/* Header Section */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="text-3xl font-bold" style={{ color: '#111827', marginBottom: '8px' }}>Welcome Back</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: '1.5' }}>Log in to your account</p>
          </div>

          {/* Error Alerts */}
          {configError && (
            <div 
              className="rounded-lg mb-6"
              style={{ 
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px 16px'
              }}
            >
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>{configError}</p>
            </div>
          )}

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
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label className="block font-medium" style={{ color: '#1f2937', marginBottom: '8px', fontSize: '0.875rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: loading || !!configError ? '#f3f4f6' : '#ffffff',
                  padding: '10px 12px',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }}
                placeholder="you@example.com"
                required
                disabled={loading || !!configError}
                onFocus={(e) => {
                  if (!loading && !configError) {
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
              <label className="block font-medium" style={{ color: '#1f2937', marginBottom: '8px', fontSize: '0.875rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: loading || !!configError ? '#f3f4f6' : '#ffffff',
                  padding: '10px 12px',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }}
                placeholder="••••••••"
                required
                disabled={loading || !!configError}
                onFocus={(e) => {
                  if (!loading && !configError) {
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
              disabled={loading || !!configError}
              className="w-full rounded-lg font-semibold transition"
              style={{
                backgroundColor: loading || !!configError ? '#d1d5db' : '#111827',
                color: '#ffffff',
                cursor: loading || !!configError ? 'not-allowed' : 'pointer',
                padding: '11px 16px',
                fontSize: '0.9375rem',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}
              onMouseEnter={(e) => {
                if (!loading && !configError) {
                  e.currentTarget.style.backgroundColor = '#1f2937'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !configError) {
                  e.currentTarget.style.backgroundColor = '#111827'
                }
              }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold transition"
                style={{ color: '#111827' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
