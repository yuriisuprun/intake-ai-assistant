'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { IntakeStepper } from '@/components/intake/IntakeStepper'
import { QuestionRenderer } from '@/components/intake/QuestionRenderer'

interface Question {
  key: string
  step: number
  question: string
  description?: string
  question_type: string
  required: boolean
  options?: string[]
  placeholder?: string
  help_text?: string
}

interface Client {
  id: string
  full_name: string
  email: string
}

export default function IntakePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Client selection state
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [showClientForm, setShowClientForm] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  
  // Intake state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string>('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [completed, setCompleted] = useState(false)
  const [intakeStarted, setIntakeStarted] = useState(false)

  // Check authentication and fetch clients
  useEffect(() => {
    const initializeIntake = async () => {
      try {
        // Check auth
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

        // Fetch clients
        const clientsData = await apiClient.listClients(0, 100)
        const clientsList = clientsData.data?.clients || []
        setClients(clientsList)

        // Fetch intake flow
        setQuestionsLoading(true)
        const flowData = await apiClient.getIntakeFlow()
        const questionsArray = flowData.questions || flowData
        const sortedQuestions = Array.isArray(questionsArray)
          ? questionsArray.sort((a: Question, b: Question) => a.step - b.step)
          : []
        
        setQuestions(sortedQuestions)
      } catch (err) {
        console.error('Error initializing intake:', err)
        setError('Failed to load intake form. Please try again.')
      } finally {
        setQuestionsLoading(false)
        setLoading(false)
      }
    }

    initializeIntake()
  }, [router])

  const handleStartIntake = async () => {
    if (!selectedClientId) {
      setError('Please select or create a client')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Start intake session
      const sessionData = await apiClient.startIntake(selectedClientId)
      const sessionId = sessionData.data?.id || sessionData.session_id || sessionData.id
      setSessionId(sessionId)
      setIntakeStarted(true)
    } catch (err) {
      console.error('Error starting intake:', err)
      setError('Failed to start intake. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateClient = async () => {
    if (!newClientName || !newClientEmail) {
      setError('Please enter client name and email')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Create client via API
      const response = await apiClient.createClient(newClientName, newClientEmail)
      const newClient = response.data

      setClients([...clients, newClient])
      setSelectedClientId(newClient.id)
      setNewClientName('')
      setNewClientEmail('')
      setShowClientForm(false)
    } catch (err) {
      console.error('Error creating client:', err)
      setError('Failed to create client. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuestionSubmit = async (answer: any) => {
    if (!sessionId || questions.length === 0) return

    try {
      setSubmitting(true)
      setError('')

      const currentQuestion = questions[currentQuestionIndex]
      
      // Submit answer to backend
      await apiClient.submitIntakeStep(
        sessionId,
        currentQuestion.key,
        answer,
        currentQuestion.question_type
      )

      // Store answer locally
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: answer
      }))

      // Check if this is the last question
      if (currentQuestionIndex === questions.length - 1) {
        // Complete intake
        await apiClient.completeIntake(sessionId)
        setCompleted(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1)
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
      setError('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  if (loading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intake form...</p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Intake Complete!</h2>
          <p className="text-gray-600 mb-4">Thank you for providing your information.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  if (!intakeStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Client Intake Form</h1>
            <p className="text-gray-600 mt-2">Select or create a client to begin</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!showClientForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-600">or</p>
                </div>

                <button
                  onClick={() => setShowClientForm(true)}
                  className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  Create New Client
                </button>

                <button
                  onClick={handleStartIntake}
                  disabled={!selectedClientId || submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {submitting ? 'Starting...' : 'Start Intake'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="Enter client email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowClientForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateClient}
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                  >
                    {submitting ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No questions available.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const totalSteps = questions.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Intake Form</h1>
          <p className="text-gray-600 mt-2">Please provide information about your case</p>
        </div>

        <IntakeStepper currentStep={currentQuestionIndex + 1} totalSteps={totalSteps} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          <QuestionRenderer
            question={currentQuestion}
            onSubmit={handleQuestionSubmit}
            isLoading={submitting}
          />

          {currentQuestionIndex > 0 && (
            <button
              onClick={handlePreviousQuestion}
              disabled={submitting}
              className="mt-4 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 font-semibold"
            >
              Previous
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
