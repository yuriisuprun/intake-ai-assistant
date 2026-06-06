'use client'

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
  value?: any
  onChange?: (value: any) => void
  onSubmit?: (answer: any) => void
  isLoading?: boolean
  error?: string
}

// Reusable input field component to eliminate duplication
function InputField({
  type,
  value,
  onChange,
  placeholder,
  required,
  questionKey,
  ariaLabel,
}: {
  type: string
  value: any
  onChange: (value: any) => void
  placeholder?: string
  required: boolean
  questionKey: string
  ariaLabel: string
}) {
  const baseClasses =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  switch (type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required || undefined}
          aria-label={ariaLabel}
          aria-required={required}
          className={baseClasses}
        />
      )

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          required={required || undefined}
          aria-label={ariaLabel}
          aria-required={required}
          className={baseClasses}
        />
      )

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required || undefined}
          aria-label={ariaLabel}
          aria-required={required}
          className={baseClasses}
        />
      )

    case 'file':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={32} />
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700 font-semibold">
              Click to upload
            </span>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              className="hidden"
              multiple={false}
              required={required || undefined}
              aria-label={ariaLabel}
              aria-required={required}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            {value?.name || 'No file selected'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, Word, Images, Excel (max 50MB)
          </p>
        </div>
      )

    default:
      return null
  }
}

function QuestionRendererComponent({
  question,
  value = '',
  onChange,
  onSubmit,
  isLoading = false,
  error = '',
}: QuestionRendererProps) {
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (question.required && !value) {
      return
    }

    if (onSubmit) {
      onSubmit(value)
    }
  }

  // Determine if we're in form mode (with onSubmit) or controlled mode (with onChange)
  const isFormMode = !!onSubmit

  // Common input rendering logic
  const renderInputs = () => (
    <>
      {/* Question Title and Description */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-gray-600">
            {question.description}
          </p>
        )}
      </div>

      {/* Text Input */}
      {question.question_type === 'text' && (
        <InputField
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={question.placeholder}
          required={question.required}
          questionKey={question.key}
          ariaLabel={question.question}
        />
      )}

      {/* Textarea */}
      {question.question_type === 'textarea' && (
        <InputField
          type="textarea"
          value={value}
          onChange={handleChange}
          placeholder={question.placeholder}
          required={question.required}
          questionKey={question.key}
          ariaLabel={question.question}
        />
      )}

      {/* Select */}
      {question.question_type === 'select' && (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required={question.required || undefined}
          aria-label={question.question}
          aria-required={question.required}
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
        <fieldset className="space-y-3">
          <legend className="sr-only">{question.question}</legend>
          {question.options?.map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={question.key}
                value={option}
                checked={value === option}
                onChange={(e) => handleChange(e.target.value)}
                required={question.required || undefined}
                aria-required={question.required}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Date */}
      {question.question_type === 'date' && (
        <InputField
          type="date"
          value={value}
          onChange={handleChange}
          required={question.required}
          questionKey={question.key}
          ariaLabel={question.question}
        />
      )}

      {/* File Upload */}
      {question.question_type === 'file' && (
        <InputField
          type="file"
          value={value}
          onChange={handleChange}
          required={question.required}
          questionKey={question.key}
          ariaLabel={question.question}
        />
      )}

      {/* Error Message */}
      {error && (
        <div
          className="text-red-600 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </>
  )

  if (isFormMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderInputs()}

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

  // Controlled mode (for public-intake page)
  return <div className="space-y-6">{renderInputs()}</div>
}

export function QuestionRenderer(props: QuestionRendererProps) {
  return <QuestionRendererComponent {...props} />
}

export default QuestionRendererComponent
