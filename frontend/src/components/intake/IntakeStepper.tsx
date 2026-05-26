'use client'

import { Check } from 'lucide-react'

interface IntakeStepperProps {
  currentStep: number
  totalSteps: number
}

function IntakeStepperComponent({ currentStep, totalSteps }: IntakeStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? <Check size={20} /> : stepNumber}
              </div>

              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  )
}

export function IntakeStepper(props: IntakeStepperProps) {
  return <IntakeStepperComponent {...props} />
}

export default IntakeStepperComponent
