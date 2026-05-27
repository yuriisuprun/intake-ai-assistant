'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

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

interface QuestionRendererProps {
  question: Question
  onSubmit: (answer: any) => void
  isLoading?: boolean
}

function QuestionRendererComponent({
  question,
  onSubmit,
  isLoading = false,
}: QuestionRendererProps) {
  const [answer, setAnswer] = useState<any>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (question.required && !answer) {
      setError('This field is required')
      return
    }

    onSubmit(answer)
    setAnswer('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-gray-600">{question.description}</p>
        )}
      </div>

      {/* Text Input */}
      {question.question_type === 'text' && (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {/* Textarea */}
      {question.question_type === 'textarea' && (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={question.placeholder}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {/* Select */}
      {question.question_type === 'select' && (
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an option...</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {/* Radio */}
      {question.question_type === 'radio' && (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={question.key}
                value={option}
                checked={answer === option}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Date */}
      {question.question_type === 'date' && (
        <input
          type="date"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {/* File Upload */}
      {question.question_type === 'file' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={32} />
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700 font-semibold">
              Click to upload
            </span>
            <input
              type="file"
              onChange={(e) => setAnswer(e.target.files?.[0] || null)}
              className="hidden"
              multiple={false}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            {answer?.name || 'No file selected'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, Word, Images, Excel (max 50MB)
          </p>
        </div>
      )}

      {/* Help Text */}
      {question.help_text && (
        <p className="text-sm text-gray-500">{question.help_text}</p>
      )}

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
      >
        {isLoading ? 'Loading...' : 'Next'}
      </button>
    </form>
  )
}

export function QuestionRenderer(props: QuestionRendererProps) {
  return <QuestionRendererComponent {...props} />
}

export default QuestionRendererComponent
