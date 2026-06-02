'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { IntakeStepper } from '@/components/intake/IntakeStepper'
import { QuestionRenderer } from '@/components/intake/QuestionRenderer'
import Footer from '@/components/common/Footer'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

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

export default function PublicIntakePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Client info state
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientInfoSubmitted, setClientInfoSubmitted] = useState(false)
  
  // Intake state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string>('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [completed, setCompleted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string>('')

  // Fetch intake flow
  useEffect(() => {
    const initializeIntake = async () => {
      try {
        setLoading(true)
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
  }, [])

  const handleStartIntake = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientName.trim() || !clientEmail.trim()) {
      setError('Please provide your name and email')
      return
    }

    // Basic email validation
    if (!clientEmail.includes('@')) {
      setError('Please provide a valid email address')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Start anonymous intake session
      const response = await apiClient.startIntake({
        anonymous_client_name: clientName,
        anonymous_client_email: clientEmail,
        anonymous_client_phone: clientPhone,
      })

      if (response.success && response.data) {
        const sessionId = response.data.id || response.data
        setSessionId(sessionId)
        setReferenceNumber(sessionId.substring(0, 8).toUpperCase())
        setClientInfoSubmitted(true)
        setCurrentQuestionIndex(0)
      } else {
        setError('Failed to start intake session. Please try again.')
      }
    } catch (err: any) {
      console.error('Error starting intake:', err)
      setError(err.message || 'Failed to start intake. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswerChange = (value: any) => {
    const currentQuestion = questions[currentQuestionIndex]
    setAnswers({
      ...answers,
      [currentQuestion.key]: value,
    })
    // Clear error when user changes their answer
    if (error) {
      setError('')
    }
  }

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    const answer = answers[currentQuestion.key]

    // Validate required fields
    if (currentQuestion.required && !answer) {
      setError('This field is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Submit step
      await apiClient.submitIntakeStep({
        session_id: sessionId,
        step_key: currentQuestion.key,
        answer: answer,
        question_type: currentQuestion.question_type,
      })

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // Complete intake
        await apiClient.completeIntake(sessionId)
        setCompleted(true)
      }
    } catch (err: any) {
      console.error('Error submitting step:', err)
      setError(err.message || 'Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setError('')
    }
  }

  const handleStartOver = () => {
    setClientName('')
    setClientEmail('')
    setClientPhone('')
    setClientInfoSubmitted(false)
    setSessionId('')
    setAnswers({})
    setCompleted(false)
    setCurrentQuestionIndex(0)
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intake form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⚖️ Intake Form</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Completion Screen */}
        {completed ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your intake form has been successfully submitted.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Your Reference Number:</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{referenceNumber}</p>
              <p className="text-xs text-gray-500 mt-2">Save this number for your records</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Our team will review your intake information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>We'll contact you soon to discuss next steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>A lawyer will be assigned to your case</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartOver}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Another Intake
            </button>
          </div>
        ) : !clientInfoSubmitted ? (
          // Client Info Form
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600 mb-8">
              Please provide your contact information to begin the intake process.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartIntake} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">We'll use this to contact you about your case</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Privacy Notice:</span> Your information is secure and will only be used to process your legal intake.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
              >
                {submitting ? 'Starting...' : 'Start Intake Process'}
              </button>
            </form>
          </div>
        ) : (
          // Intake Questions
          <div className="bg-white rounded-lg shadow-lg p-8">
            {questionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <IntakeStepper
                  currentStep={currentQuestionIndex + 1}
                  totalSteps={questions.length}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Question */}
                {questions[currentQuestionIndex] && (
                  <div className="mb-8">
                    <QuestionRenderer
                      question={questions[currentQuestionIndex]}
                      value={answers[questions[currentQuestionIndex].key]}
                      onChange={handleAnswerChange}
                      error={error}
                    />

                    {questions[currentQuestionIndex].help_text && (
                      <p className="text-sm text-gray-500 mt-4">
                        💡 {questions[currentQuestionIndex].help_text}
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                  >
                    {submitting ? 'Submitting...' : currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
