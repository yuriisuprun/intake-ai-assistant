'use client'

import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

interface Summary {
  summary: string
  legal_category: string
  urgency: string
  key_facts: string[]
  missing_information: string[]
  recommended_next_questions: string[]
  confidence: number
}

interface SummaryPanelProps {
  summary: Summary
  isLoading?: boolean
}

export function SummaryPanel({ summary, isLoading = false }: SummaryPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating summary...</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-600">No summary available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h3>
        <p className="text-gray-700 leading-relaxed">{summary.summary}</p>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600">Legal Category</p>
            <p className="font-semibold text-gray-900">{summary.legal_category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Urgency</p>
            <p className={`font-semibold ${
              summary.urgency === 'high' ? 'text-red-600' :
              summary.urgency === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {summary.urgency.charAt(0).toUpperCase() + summary.urgency.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="font-semibold text-gray-900">{(summary.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Key Facts */}
      {summary.key_facts.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Key Facts
          </h3>
          <ul className="space-y-2">
            {summary.key_facts.map((fact, index) => (
              <li key={index} className="flex gap-3 text-gray-700">
                <span className="text-green-600 font-bold">•</span>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Information */}
      {summary.missing_information.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={20} />
            Missing Information
          </h3>
          <ul className="space-y-2">
            {summary.missing_information.map((info, index) => (
              <li key={index} className="flex gap-3 text-gray-700">
                <span className="text-yellow-600 font-bold">•</span>
                {info}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Questions */}
      {summary.recommended_next_questions.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="text-blue-600" size={20} />
            Recommended Follow-up Questions
          </h3>
          <ul className="space-y-2">
            {summary.recommended_next_questions.map((question, index) => (
              <li key={index} className="flex gap-3 text-gray-700">
                <span className="text-blue-600 font-bold">?</span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
