'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

interface SessionData {
  id: string;
  client_id: string;
  status: string;
  legal_area: string;
  problem_description: string;
  timeline?: string;
  urgency_description?: string;
  desired_outcome?: string;
  contact_preference?: string;
  additional_info?: string;
  created_at: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface File {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export default function ClientSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { user } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Fetch session details
        const sessionResponse = await apiClient.get(`/client/intake/${sessionId}`);
        if (sessionResponse.data.success) {
          setSession(sessionResponse.data.data);
        }

        // Fetch messages
        const messagesResponse = await apiClient.get(`/messages/${sessionId}`);
        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.data);
        }

        // Fetch files
        const filesResponse = await apiClient.get(`/client/files/${sessionId}`);
        if (filesResponse.data.success) {
          setFiles(filesResponse.data.data);
        }
      } catch (err) {
        setError('Failed to load session details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Session not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Intake Session</h1>
        <p className="text-gray-600">View your submitted information</p>
      </div>

      {/* Session Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {session.status}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Legal Area</p>
            <p className="text-lg font-semibold">{session.legal_area || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="text-lg font-semibold">
              {new Date(session.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Submitted Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Submitted Information</h2>
        <div className="space-y-4">
          {session.problem_description && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-600 font-medium">Problem Description</p>
              <p className="text-gray-900 mt-1">{session.problem_description}</p>
            </div>
          )}
          {session.timeline && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-600 font-medium">Timeline</p>
              <p className="text-gray-900 mt-1">{session.timeline}</p>
            </div>
          )}
          {session.desired_outcome && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-600 font-medium">Desired Outcome</p>
              <p className="text-gray-900 mt-1">{session.desired_outcome}</p>
            </div>
          )}
          {session.contact_preference && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-600 font-medium">Contact Preference</p>
              <p className="text-gray-900 mt-1">{session.contact_preference}</p>
            </div>
          )}
          {session.additional_info && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-600 font-medium">Additional Information</p>
              <p className="text-gray-900 mt-1">{session.additional_info}</p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{file.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.file_size / 1024).toFixed(2)} KB •{' '}
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.role === 'client'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {message.role === 'client' ? 'You' : 'System'}
                </p>
                <p className="text-gray-900">{message.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
