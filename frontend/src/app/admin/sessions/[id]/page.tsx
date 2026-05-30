'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

interface SessionDetail {
  id: string;
  client_id: string;
  client_name: string;
  status: string;
  legal_category: string;
  urgency: string;
  flow_data: Record<string, any>;
  ai_summary?: any;
  created_at: string;
  completed_at?: string;
}

interface Note {
  id: string;
  note_text: string;
  created_by: string;
  created_at: string;
}

export default function AdminSessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { user } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Fetch session details
        const sessionResponse = await apiClient.get(`/admin/intake/${sessionId}`);
        if (sessionResponse.data.success) {
          setSession(sessionResponse.data.data);
        }

        // Fetch notes
        const notesResponse = await apiClient.get(`/admin/notes/${sessionId}`);
        if (notesResponse.data.success) {
          setNotes(notesResponse.data.data);
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      const response = await apiClient.post(`/admin/notes`, {
        session_id: sessionId,
        note_text: newNote,
      });

      if (response.data.success) {
        setNotes([response.data.data, ...notes]);
        setNewNote('');
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      setError('Error adding note');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const response = await apiClient.post(`/admin/summary/${sessionId}/generate`, {});

      if (response.data.success) {
        setSession((prev) =>
          prev ? { ...prev, ai_summary: response.data.data } : null
        );
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError('Error generating summary');
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">Session Details</h1>
        <p className="text-gray-600">{session.client_name}</p>
      </div>

      {/* Session Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <p className="text-sm text-gray-600">Legal Category</p>
            <p className="text-lg font-semibold">{session.legal_category || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Urgency</p>
            <p className="text-lg font-semibold">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.urgency === 'high'
                    ? 'bg-red-100 text-red-800'
                    : session.urgency === 'medium'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {session.urgency || 'N/A'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="text-lg font-semibold">
              {new Date(session.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Submitted Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Submitted Information</h2>
            <div className="space-y-4">
              {Object.entries(session.flow_data).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <p className="text-sm text-gray-600 font-medium">{key}</p>
                  <p className="text-gray-900 mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">AI Summary</h2>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {generatingSummary ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>

            {session.ai_summary ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Summary</p>
                  <p className="text-gray-900 mt-1">{session.ai_summary.summary}</p>
                </div>
                {session.ai_summary.key_facts && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Key Facts</p>
                    <ul className="list-disc list-inside mt-1 text-gray-900">
                      {session.ai_summary.key_facts.map((fact: string, i: number) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.ai_summary.missing_information && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Missing Information</p>
                    <ul className="list-disc list-inside mt-1 text-gray-900">
                      {session.ai_summary.missing_information.map((info: string, i: number) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No summary generated yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Notes</h2>

            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={submitting || !newNote.trim()}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{note.note_text}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {note.created_by} • {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                Assign to Team
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                Change Status
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                Export Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
