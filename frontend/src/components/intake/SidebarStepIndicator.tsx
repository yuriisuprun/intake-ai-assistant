'use client'

import { Check, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  key: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'pending'
}

interface SidebarStepIndicatorProps {
  steps: Step[]
  currentStepIndex: number
  totalSteps: number
  completedSteps: number
  onStepClick?: (stepIndex: number) => void
  disabled?: boolean
}

export function SidebarStepIndicator({
  steps,
  currentStepIndex,
  totalSteps,
  completedSteps,
  onStepClick,
  disabled = false,
}: SidebarStepIndicatorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#1f2937' }}>
          Progress
        </h3>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Step {currentStepIndex + 1} of {totalSteps}
        </p>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isPending = step.status === 'pending'

          return (
            <div key={step.key}>
              <button
                onClick={() => {
                  if (!disabled && onStepClick && isCompleted) {
                    onStepClick(index)
                  }
                }}
                disabled={disabled || (onStepClick && !isCompleted)}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  isCurrent
                    ? 'bg-gray-100'
                    : isCompleted
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-60'
                }`}
                style={{
                  borderLeft: isCurrent ? '3px solid #111827' : '3px solid transparent',
                  paddingLeft: 'calc(0.75rem - 3px)',
                }}
              >
                {/* Step Indicator Icon */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-xs font-semibold transition-colors truncate ${
                      isCurrent
                        ? 'text-gray-900'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.description && (
                    <p
                      className={`text-xs mt-0.5 transition-colors truncate ${
                        isCurrent
                          ? 'text-gray-900'
                          : isCompleted
                          ? 'text-gray-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <ChevronRight
                    size={14}
                    className="text-gray-900 flex-shrink-0"
                  />
                )}
              </button>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center ml-3 py-0">
                  <div
                    className={`w-0.5 h-2 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
        <p className="text-xs text-center" style={{ color: '#6b7280' }}>
          <span className="font-semibold text-green-600">{completedSteps}</span>
          {' '}completed • 
          <span className="font-semibold text-gray-900 ml-1">{totalSteps - completedSteps - 1}</span>
          {' '}remaining
        </p>
      </div>
    </div>
  )
}

export default SidebarStepIndicator
