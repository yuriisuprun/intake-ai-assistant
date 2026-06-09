'use client'

import { Check, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  key: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'pending'
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  disabled?: boolean
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
}: StepIndicatorProps) {
  return (
    <div className="space-y-2">
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
              className={`w-full flex items-start gap-4 px-4 py-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-purple-50 border-l-4 border-purple-600'
                  : isCompleted
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'opacity-60'
              }`}
              style={{
                borderColor: isCurrent ? '#a855f7' : 'transparent',
              }}
            >
              {/* Step Indicator Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? <Check size={18} /> : index + 1}
              </div>

              {/* Step Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'text-purple-900'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {isCurrent && (
                    <ChevronRight
                      size={16}
                      className="text-purple-600"
                    />
                  )}
                </div>
                {step.description && (
                  <p
                    className={`text-xs mt-1 transition-colors ${
                      isCurrent
                        ? 'text-purple-700'
                        : isCompleted
                        ? 'text-gray-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </button>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex justify-center ml-4 py-0">
                <div
                  className={`w-0.5 h-3 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
