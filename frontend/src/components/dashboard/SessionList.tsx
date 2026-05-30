'use client'

import Link from 'next/link'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface Session {
  id: string
  client_id: string
  legal_category?: string
  status: string
  urgency?: string
  created_at: string
  clients?: {
    id: string
    full_name: string
    email: string
  }
}

interface SessionListProps {
  sessions: Session[]
  isLoading?: boolean
}

function SessionListComponent({ sessions, isLoading = false }: SessionListProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-600">No intake sessions yet.</p>
        <Link href="/intake" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Start a new intake
        </Link>
      </div>
    )
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="text-green-600" size={20} />
    }
    return <AlertCircle className="text-blue-600" size={20} />
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/dashboard/session/${session.id}`}
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(session.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.legal_category || 'Intake Session'}
                  </h3>
                  {session.clients?.full_name && (
                    <p className="text-sm text-gray-600 mt-1">
                      Client: {session.clients.full_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(session.created_at).toLocaleDateString()}
                </div>

                {session.urgency && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(session.urgency)}`}>
                    {session.urgency.charAt(0).toUpperCase() + session.urgency.slice(1)}
                  </span>
                )}

                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  {session.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">
                ID: {session.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function SessionList(props: SessionListProps) {
  return <SessionListComponent {...props} />
}

export default SessionListComponent
