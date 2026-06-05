'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import IntakeStepper from '@/components/intake/IntakeStepper';
import QuestionRenderer from '@/components/intake/QuestionRenderer';
import { apiClient } from '@/lib/api';

interface Question {
  key: string;
  step: number;
  question: string;
  question_type: string;
  required: boolean;
  options?: string[];
}

interface IntakeFlow {
  questions: Question[];
  total_steps: number;
}

export default function ClientIntakePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flow, setFlow] = useState<IntakeFlow | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Fetch intake flow
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const response = await apiClient.get('/api/client/intake/flow');
        if (response.success) {
          setFlow(response.data);
        }
      } catch (err) {
        setError('Failed to load intake form');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Also fetch existing clients
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/api/client/profile');
        if (response.success && response.data) {
          setClients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.log('Could not fetch existing clients');
      }
    };

    fetchFlow();
    fetchClients();
  }, []);

  // Start intake session
  const handleStartIntake = async () => {
    let clientName = '';
    let clientEmail = '';
    
    // Find selected client info
    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (selectedClient) {
      clientName = selectedClient.full_name;
      clientEmail = selectedClient.email;
    }
    
    if (!clientName || !clientEmail) {
      setError('Please select or create a client');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.post('/api/client/intake/start', {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: null,
      });

      if (response.success) {
        setSessionId(response.data.id);
        setCurrentStep(0);
        setShowClientForm(false);
      } else {
        setError('Failed to start intake session');
      }
    } catch (err) {
      setError('Error starting intake session');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async (answer: any) => {
    if (!sessionId || !flow) return;

    const question = flow.questions[currentStep];

    try {
      setSubmitting(true);

      // Handle file upload separately
      let finalAnswer = answer;
      if (question.question_type === 'file' && answer instanceof File) {
        try {
          // Upload file first
          const formData = new FormData();
          formData.append('file', answer);

          const uploadResponse = await apiClient.post('/api/client/files/upload', formData, {
            params: { session_id: sessionId },
          });

          if (uploadResponse.success) {
            // Store the filename as the answer
            finalAnswer = answer.name;
          } else {
            setError('Failed to upload file');
            setSubmitting(false);
            return;
          }
        } catch (uploadErr) {
          setError('Error uploading file');
          console.error(uploadErr);
          setSubmitting(false);
          return;
        }
      }

      const response = await apiClient.post('/api/client/intake/step', {
        session_id: sessionId,
        step_key: question.key,
        answer: finalAnswer,
        question_type: question.question_type,
      });

      if (response.success) {
        setAnswers({
          ...answers,
          [question.key]: finalAnswer,
        });

        if (currentStep < flow.total_steps - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Last question, show completion
          setCurrentStep(flow.total_steps);
        }
      } else {
        setError('Failed to submit answer');
      }
    } catch (err) {
      setError('Error submitting answer');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Complete intake
  const handleCompleteIntake = async () => {
    if (!sessionId) return;

    try {
      setSubmitting(true);
      const response = await apiClient.post('/api/client/intake/complete', {
        session_id: sessionId,
      });

      if (response.success) {
        router.push('/client/dashboard');
      } else {
        setError('Failed to complete intake');
      }
    } catch (err) {
      setError('Error completing intake');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Create new client
  const handleCreateClient = async () => {
    if (!newClientName || !newClientEmail) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.post('/api/client/profile', {
        full_name: newClientName,
        email: newClientEmail,
      });

      if (response.success) {
        const newClient = response.data;
        setClients([...clients, newClient]);
        setSelectedClientId(newClient.id);
        setNewClientName('');
        setNewClientEmail('');
        setShowClientForm(false);
      } else {
        setError('Failed to create client');
      }
    } catch (err) {
      setError('Error creating client');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load intake form</p>
      </div>
    );
  }

  // Show client selection screen
  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Start New Intake</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!showClientForm ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              >
                <option value="">-- Select a client --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowClientForm(true)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition mb-4"
              >
                Create New Client
              </button>

              <button
                onClick={handleStartIntake}
                disabled={!selectedClientId || submitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Starting...' : 'Start Intake'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateClient}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {submitting ? 'Creating...' : 'Create Client'}
                </button>
                <button
                  onClick={() => setShowClientForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show completion screen
  if (currentStep >= flow.total_steps) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-4">Intake Complete!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for completing the intake form. Your information has been submitted.
          </p>
          <button
            onClick={handleCompleteIntake}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {submitting ? 'Redirecting...' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // Show intake form
  const question = flow.questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto">
      <IntakeStepper currentStep={currentStep + 1} totalSteps={flow.total_steps} />

      <div className="bg-white rounded-lg shadow p-8 mt-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <QuestionRenderer
          question={question}
          onSubmit={handleSubmitAnswer}
          loading={submitting}
        />

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || submitting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400"
          >
            Previous
          </button>
          <div className="flex-1 text-center text-sm text-gray-600 py-2">
            Question {currentStep + 1} of {flow.total_steps}
          </div>
        </div>
      </div>
    </div>
  );
}
