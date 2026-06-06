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

      // Start Intake session
      const response = await apiClient.startIntake({
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
      })

      if (response.success && response.data) {
        const sessionId = response.data.id || response.data
        setSessionId(sessionId)
        // Use reference_number from API response (stored in database)
        setReferenceNumber(response.data.reference_number)
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

      // Handle file upload separately
      let finalAnswer = answer
      if (currentQuestion.question_type === 'file' && answer instanceof File) {
        try {
          // Upload file first using the dedicated uploadFile method
          const uploadResponse = await apiClient.uploadFile(sessionId, answer)

          if (uploadResponse.success) {
            // Store the filename as the answer
            finalAnswer = answer.name
          } else {
            setError('Failed to upload file')
            setSubmitting(false)
            return
          }
        } catch (uploadErr: any) {
          setError('Error uploading file: ' + (uploadErr.message || 'Unknown error'))
          console.error(uploadErr)
          setSubmitting(false)
          return
        }
      }

      // Submit step
      await apiClient.submitIntakeStep({
        session_id: sessionId,
        step_key: currentQuestion.key,
        answer: finalAnswer !== undefined ? finalAnswer : null,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intake form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>📋 Intake Assistant</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm transition"
            style={{ color: '#4b5563' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r p-6 hidden lg:block" style={{ borderColor: '#e5e7eb' }}>
          {/* Sidebar Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>In this form</h3>
            <nav className="space-y-1 mb-8">
              <a href="#" className="text-sm block px-3 py-2 rounded" style={{ color: '#374151' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}>Getting Started</a>
              <a href="#" className="text-sm block px-3 py-2 rounded" style={{ color: '#374151' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}>Your Information</a>
              <a href="#" className="text-sm block px-3 py-2 rounded" style={{ color: '#374151' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}>Case Details</a>
              <a href="#" className="text-sm block px-3 py-2 rounded" style={{ color: '#374151' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}>Document Upload</a>
              <a href="#" className="text-sm block px-3 py-2 rounded" style={{ color: '#374151' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}>Review & Submit</a>
            </nav>


          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 px-8 py-8">
        {/* Completion Screen */}
        {completed ? (
          <div className="bg-white rounded-lg p-8 text-center" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <CheckCircle style={{ color: '#22c55e' }} className="mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>Thank You!</h2>
            <p className="mb-8" style={{ color: '#4b5563' }}>
              Your intake form has been successfully submitted.
            </p>
            
            <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <p className="text-sm mb-2" style={{ color: '#4b5563' }}>Your Reference Number:</p>
              <p className="text-2xl font-mono font-bold" style={{ color: '#a855f7' }}>{referenceNumber}</p>
              <p className="text-xs mt-2" style={{ color: '#6b7280' }}>Save this number for your records</p>
            </div>

            <div className="rounded-lg p-6 mb-8 text-left" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#111827' }}>What happens next?</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#4b5563' }}>
                <li className="flex items-start gap-3">
                  <span className="font-bold" style={{ color: '#a855f7' }}>1.</span>
                  <span>Our team will review your intake information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold" style={{ color: '#a855f7' }}>2.</span>
                  <span>We'll contact you soon to discuss next steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold" style={{ color: '#a855f7' }}>3.</span>
                  <span>A lawyer will be assigned to your case</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartOver}
              className="text-white px-8 py-3 rounded-lg transition font-medium"
              style={{ backgroundColor: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a855f7')}
            >
              Submit Another Intake
            </button>
          </div>
        ) : !clientInfoSubmitted ? (
          // Client Info Form
          <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#111827' }}>Get Started</h2>
            <p className="mb-8 leading-relaxed" style={{ color: '#4b5563' }}>
              Please provide your contact information to begin the intake process. Your information is secure and protected.
            </p>

            {error && (
              <div className="px-4 py-3 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b' }}>
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartIntake} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1f2937' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg outline-none transition"
                  style={{ border: '1px solid #d1d5db', boxShadow: 'none' }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1f2937' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-lg outline-none transition"
                  style={{ border: '1px solid #d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  required
                />
                <p className="text-xs mt-1.5" style={{ color: '#6b7280' }}>We'll use this to contact you about your case</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1f2937' }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg outline-none transition"
                  style={{ border: '1px solid #d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #d1d5db'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <p className="text-sm" style={{ color: '#1f2937' }}>
                  <span className="font-semibold">Privacy Notice:</span> Your information is secure and will only be used to process your legal intake.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white py-3 rounded-lg transition font-semibold"
                style={{ backgroundColor: submitting ? '#9ca3af' : '#a855f7' }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#9333ea')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#a855f7')}
              >
                {submitting ? 'Starting...' : 'Start Intake Process'}
              </button>
            </form>
          </div>
        ) : (
          // Intake Questions
          <div className="bg-white rounded-lg p-8" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            {questionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
                <p style={{ color: '#4b5563' }}>Loading questions...</p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <IntakeStepper
                  currentStep={currentQuestionIndex + 1}
                  totalSteps={questions.length}
                />

                {error && (
                  <div className="px-4 py-3 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b' }}>
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Question */}
                {questions[currentQuestionIndex] && (
                  <div className="mb-8 mt-6">
                    <QuestionRenderer
                      question={questions[currentQuestionIndex]}
                      value={answers[questions[currentQuestionIndex].key]}
                      onChange={handleAnswerChange}
                      error={error}
                    />

                    {questions[currentQuestionIndex].help_text && (
                      <p className="text-sm mt-4 flex items-start gap-2" style={{ color: '#6b7280' }}>
                        <span>💡</span>
                        <span>{questions[currentQuestionIndex].help_text}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-10">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || submitting}
                    className="flex-1 px-6 py-3 rounded-lg transition font-medium text-sm"
                    style={{ 
                      border: '1px solid #d1d5db',
                      color: currentQuestionIndex === 0 || submitting ? '#9ca3af' : '#374151',
                      backgroundColor: currentQuestionIndex === 0 || submitting ? '#f3f4f6' : '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      if (!(currentQuestionIndex === 0 || submitting)) {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(currentQuestionIndex === 0 || submitting)) {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                      }
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-lg transition font-medium text-sm"
                    style={{ 
                      backgroundColor: submitting ? '#9ca3af' : '#a855f7',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#9333ea')}
                    onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#a855f7')}
                  >
                    {submitting ? 'Submitting...' : currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
