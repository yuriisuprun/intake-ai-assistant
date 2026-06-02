'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/common/Footer'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (configError) {
        throw new Error(configError)
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
        },
      })

      if (signUpError) {
        console.error('Supabase signup error:', signUpError)
        throw signUpError
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        setError('Please check your email to confirm your account before logging in.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else if (data?.user) {
        // Auto-login if email confirmation is not required
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.message || 'Failed to sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          className="rounded-lg p-8 w-full max-w-md"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>Create Account</h1>
          <p className="mb-6" style={{ color: '#4b5563' }}>Join Intake Assistant</p>

          {configError && (
            <div 
              className="px-4 py-3 rounded-lg mb-4"
              style={{ 
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b'
              }}
            >
              {configError}
            </div>
          )}

          {error && (
            <div 
              className="px-4 py-3 rounded-lg mb-4"
              style={{
                backgroundColor: error.includes('check your email') ? '#dbeafe' : '#fee2e2',
                border: error.includes('check your email') ? '1px solid #93c5fd' : '1px solid #fecaca',
                color: error.includes('check your email') ? '#1e40af' : '#991b1b'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: loading || !!configError ? '#f3f4f6' : '#ffffff'
                }}
                placeholder="John Doe"
                required
                disabled={loading || !!configError}
                onFocus={(e) => {
                  if (!loading && !configError) {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: loading || !!configError ? '#f3f4f6' : '#ffffff'
                }}
                placeholder="you@example.com"
                required
                disabled={loading || !!configError}
                onFocus={(e) => {
                  if (!loading && !configError) {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none transition"
                style={{ 
                  border: '1px solid #d1d5db',
                  backgroundColor: loading || !!configError ? '#f3f4f6' : '#ffffff'
                }}
                placeholder="••••••••"
                required
                disabled={loading || !!configError}
                onFocus={(e) => {
                  if (!loading && !configError) {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!configError}
              className="w-full py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: loading || !!configError ? '#9ca3af' : '#a855f7',
                color: '#ffffff',
                cursor: loading || !!configError ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading && !configError) {
                  e.currentTarget.style.backgroundColor = '#9333ea'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !configError) {
                  e.currentTarget.style.backgroundColor = '#a855f7'
                }
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: '#4b5563' }}>
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium transition"
              style={{ color: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a855f7')}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
