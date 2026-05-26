'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Get the code from the URL
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        try {
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code)
          // Redirect to dashboard
          router.push('/dashboard')
        } catch (error) {
          console.error('Error exchanging code for session:', error)
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Confirming your email...</p>
      </div>
    </div>
  )
}
