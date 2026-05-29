'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { SessionList } from '@/components/dashboard/SessionList'
import { SummaryPanel } from '@/components/dashboard/SummaryPanel'
import Footer from '@/components/common/Footer'

interface Session {
  id: string
  client_id: string
  legal_category?: string
  status: string
  urgency?: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        // Set token for API client
        if (session.access_token) {
          apiClient.setToken(session.access_token)
        }

        // Fetch sessions
        setSessionsLoading(true)
        const response = await apiClient.listIntakeSessions(0, 20)
        const sessionsList = response.data?.sessions || response.sessions || []
        setSessions(sessionsList)
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setSessionsLoading(false)
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sessions List */}
            <div className="lg:col-span-2">
              <SessionList sessions={sessions} isLoading={sessionsLoading} />
            </div>

            {/* Summary Panel */}
            <div>
              {selectedSession ? (
                <SummaryPanel summary={selectedSession} />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select a session to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
