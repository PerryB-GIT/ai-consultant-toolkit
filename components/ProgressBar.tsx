'use client';

import * as Progress from '@radix-ui/react-progress';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  currentStep: number;
  completedSteps: number[];
  stepLabels?: string[];
  totalSteps?: number;
}

const DEFAULT_STEP_LABELS = [
  'Download Setup Script',
  'Run Phase 1 Setup',
  'Upload & Validate',
  'Authenticate (gh + claude)',
  'Download Phase 2 Script',
  'Install Skills & MCPs',
  'Configure EA Persona',
  'Authenticate Google Services',
  'Test EA & Workflows',
  'Build Custom Skills',
  'Production Ready',
];

export default function ProgressBar({
  currentStep,
  completedSteps,
  stepLabels = DEFAULT_STEP_LABELS,
  totalSteps = 11,
}: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const getStepIcon = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return <span className="text-green-400">✓</span>;
    }
    if (stepNumber === currentStep) {
      return <span className="text-primary">→</span>;
    }
    return <span className="text-gray-600">○</span>;
  };

  return (
    <div className="w-full bg-background-card border border-gray-800 rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          AI Consultant Setup
        </h2>
        <p className="text-gray-400 text-sm">
          Step {currentStep}/{totalSteps} - {percentage}% Complete
        </p>
      </div>

      {/* Progress Bar */}
      <Progress.Root
        className="relative overflow-hidden bg-gray-800 rounded-full w-full h-3 mb-6"
        value={percentage}
      >
        <Progress.Indicator
          className="bg-gradient-to-r from-primary to-primary-dark h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </Progress.Root>

      {/* Step List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {stepLabels.slice(0, totalSteps).map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-md transition-all duration-200',
                {
                  'bg-primary/10 border border-primary/30': isCurrent,
                  'bg-green-500/5': isCompleted && !isCurrent,
                  'hover:bg-gray-800/50': !isCurrent,
                }
              )}
            >
              <span className="text-lg font-mono w-6 flex-shrink-0">
                {getStepIcon(stepNumber)}
              </span>
              <span
                className={clsx('text-sm flex-grow', {
                  'text-white font-medium': isCurrent,
                  'text-gray-400 line-through': isCompleted && !isCurrent,
                  'text-gray-500': !isCompleted && !isCurrent,
                })}
              >
                {label}
                {isCurrent && (
                  <span className="ml-2 text-xs text-primary animate-pulse">
                    (current)
                  </span>
                )}
              </span>
              {isCompleted && !isCurrent && (
                <span className="text-xs text-green-400 flex-shrink-0">
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{completedSteps.length} completed</span>
          <span>{totalSteps - currentStep} remaining</span>
        </div>
      </div>
    </div>
  );
}
