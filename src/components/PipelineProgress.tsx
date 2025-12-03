// =============================================================================
// PIPELINE PROGRESS COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Visualizes the multi-step analysis pipeline progress.
// Shows each step's status, timing, and results.
//
// PIPELINE STEPS:
// 1. Classification - Basic boundary classification
// 2. Pattern Detection - Identify APIs, hooks, patterns
// 3. Risk Assessment - Evaluate risk level
// 4. Suggestions - Generate refactoring suggestions
// 5. Examples - Provide code examples (comprehensive only)
//
// STEP STATUSES:
// - pending: Not yet started (gray)
// - running: Currently executing (blue, animated)
// - completed: Successfully finished (green)
// - error: Failed with error (red)
// - skipped: Not run due to depth setting (gray, dashed)
// =============================================================================

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { Progress } from './ui/progress';
import type { PipelineResults, PipelineStepStatus } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface PipelineProgressProps {
  /** Current pipeline results (may be partial during execution) */
  results: PipelineResults | null;
  /** Whether the pipeline is currently running */
  isRunning?: boolean;
  /** Compact display mode */
  compact?: boolean;
}

interface StepConfig {
  key: keyof Omit<PipelineResults, 'metadata'>;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

/**
 * Configuration for each pipeline step.
 * Defines the order, labels, and icons for display.
 */
const STEPS: StepConfig[] = [
  {
    key: 'classification',
    label: 'Classification',
    description: 'Determine client/server boundary',
    icon: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'patternDetection',
    label: 'Pattern Detection',
    description: 'Identify APIs and patterns',
    icon: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'riskAssessment',
    label: 'Risk Assessment',
    description: 'Evaluate risk level',
    icon: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'suggestions',
    label: 'Suggestions',
    description: 'Generate recommendations',
    icon: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
      </svg>
    ),
  },
  {
    key: 'examples',
    label: 'Examples',
    description: 'Generate code examples',
    icon: (
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

// =============================================================================
// STATUS STYLING
// =============================================================================

/**
 * Gets styling classes for a step based on its status.
 */
function getStatusStyles(status: PipelineStepStatus): {
  container: string;
  icon: string;
  label: string;
  border: string;
} {
  switch (status) {
    case 'pending':
      return {
        container: 'bg-gray-800',
        icon: 'text-gray-500',
        label: 'text-gray-500',
        border: 'border-gray-700',
      };
    case 'running':
      return {
        container: 'bg-blue-900/30',
        icon: 'text-blue-400 animate-pulse',
        label: 'text-blue-400',
        border: 'border-blue-500',
      };
    case 'completed':
      return {
        container: 'bg-green-900/20',
        icon: 'text-green-400',
        label: 'text-green-400',
        border: 'border-green-500',
      };
    case 'error':
      return {
        container: 'bg-red-900/20',
        icon: 'text-red-400',
        label: 'text-red-400',
        border: 'border-red-500',
      };
    case 'skipped':
      return {
        container: 'bg-gray-800/50',
        icon: 'text-gray-600',
        label: 'text-gray-600',
        border: 'border-gray-700 border-dashed',
      };
    default:
      return {
        container: 'bg-gray-800',
        icon: 'text-gray-500',
        label: 'text-gray-500',
        border: 'border-gray-700',
      };
  }
}

// =============================================================================
// PIPELINE PROGRESS COMPONENT
// =============================================================================

export default function PipelineProgress({
  results,
  isRunning = false,
  compact = false,
}: PipelineProgressProps) {
  // ===========================================================================
  // CALCULATE PROGRESS
  // ===========================================================================

  const progress = useMemo(() => {
    if (!results) return 0;

    const totalSteps = STEPS.length;
    let completedSteps = 0;

    for (const step of STEPS) {
      const stepResult = results[step.key];
      if (stepResult?.status === 'completed') {
        completedSteps++;
      }
    }

    return Math.round((completedSteps / totalSteps) * 100);
  }, [results]);

  // ===========================================================================
  // COMPACT VIEW
  // ===========================================================================

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Pipeline Progress</span>
          <span className="text-gray-500">
            {results?.metadata?.stepsCompleted || 0} / {STEPS.length} steps
          </span>
        </div>
        <Progress value={progress} />
        {results?.metadata?.totalDuration && (
          <p className="text-xs text-gray-500 text-right">
            Completed in {formatDuration(results.metadata.totalDuration)}
          </p>
        )}
      </div>
    );
  }

  // ===========================================================================
  // FULL VIEW
  // ===========================================================================

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-200">Analysis Pipeline</span>
          <span className="text-gray-400">{progress}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {STEPS.map((step, index) => {
          const stepResult = results?.[step.key];
          const status = stepResult?.status || 'pending';
          const styles = getStatusStyles(status);
          const duration = stepResult?.duration;

          return (
            <div
              key={step.key}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                styles.container,
                styles.border
              )}
            >
              {/* Step number */}
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'running'
                    ? 'bg-blue-500 text-white'
                    : status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                )}
              >
                {status === 'completed' ? (
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : status === 'error' ? (
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : status === 'running' ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step icon */}
              <div className={cn('flex-shrink-0', styles.icon)}>{step.icon}</div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium', styles.label)}>
                  {step.label}
                  {status === 'skipped' && (
                    <span className="ml-2 text-xs text-gray-500">(skipped)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>

              {/* Duration */}
              {duration && (
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {formatDuration(duration)}
                </div>
              )}

              {/* Error message */}
              {stepResult?.error && (
                <div className="text-xs text-red-400 truncate max-w-[200px]">
                  {stepResult.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total duration */}
      {results?.metadata?.totalDuration && (
        <div className="text-sm text-gray-400 text-right">
          Total time: {formatDuration(results.metadata.totalDuration)}
        </div>
      )}
    </div>
  );
}
