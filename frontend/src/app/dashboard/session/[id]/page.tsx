'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { SummaryPanel } from '@/components/dashboard/SummaryPanel'
import { DocumentViewer } from '@/components/common/DocumentViewer'
import Footer from '@/components/common/Footer'
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  role: string
  content: string
  created_at: string
}

interface File {
  id: string
  filename: string
  file_path: string
  created_at: string
}

interface SessionDetail {
  id: string
  client_id: string
  legal_category?: string
  status: string
  urgency?: string
  created_at: string
  summary?: {
    summary: string
    legal_category: string
    urgency: string
    key_facts: string[]
    missing_information: string[]
    recommended_next_questions: string[]
    confidence: number
  }
}

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState<'summary' | 'messages' | 'files'>('summary')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSessionDetail = async () => {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        if (!authSession) {
          router.push('/login')
          return
        }

        setUser(authSession.user)

        // Set token for API client
        if (authSession.access_token) {
          apiClient.setToken(authSession.access_token)
        }

        // Fetch session details
        const sessionResponse = await apiClient.getIntakeSession(sessionId)
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data)
        } else {
          setError('Failed to load session details')
        }

        // Fetch messages
        try {
          const messagesResponse = await apiClient.getMessages(sessionId)
          if (messagesResponse.success && messagesResponse.data) {
            setMessages(messagesResponse.data.messages || [])
          }
        } catch (err) {
          console.error('Error loading messages:', err)
        }

        // Fetch files
        try {
          const filesResponse = await apiClient.getFiles(sessionId)
          if (filesResponse.success && filesResponse.data) {
            setFiles(filesResponse.data.files || [])
          }
        } catch (err) {
          console.error('Error loading files:', err)
        }
      } catch (err) {
        console.error('Error loading session:', err)
        setError('Failed to load session details')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      initializeSessionDetail()
    }
  }, [sessionId, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session details...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={20} />
              Back
            </button>
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

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Session not found'}</p>
            <button
              onClick={handleBack}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Go back to dashboard
            </button>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.legal_category || 'Intake Session'}
              </h1>
              <p className="text-sm text-gray-600">ID: {session.id}</p>
            </div>
          </div>
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
          {/* Session Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{session.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Legal Category</p>
                <p className="font-semibold text-gray-900">{session.legal_category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgency</p>
                <p className={`font-semibold capitalize ${
                  session.urgency === 'high' ? 'text-red-600' :
                  session.urgency === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {session.urgency || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                    activeTab === 'summary'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'messages'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare size={18} />
                  Messages ({messages.length})
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'files'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText size={18} />
                  Files ({files.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'summary' && (
                <div>
                  {session.summary ? (
                    <SummaryPanel summary={session.summary} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No summary available yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900 capitalize">
                              {message.role}
                            </span>
                            <span className="text-xs text-gray-600">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No messages yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <div>
                  {files.length > 0 ? (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="text-blue-600" size={24} />
                              <div>
                                <p className="font-semibold text-gray-900">{file.filename}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(file.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={file.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No files uploaded.</p>
                    </div>
                  )}
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
