// =============================================================================
// RESULT DISPLAY COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Displays comprehensive analysis results including pipeline data.
// Enhanced from base version with pattern visualization, risk display,
// suggestions, and code examples.
//
// PREMIUM FEATURES:
// - Classification badge with SVG icon (no emojis)
// - Detected patterns list with line numbers
// - Risk assessment visualization
// - Refactoring suggestions accordion
// - Code examples (for comprehensive depth)
// - Pipeline timing information
//
// ARCHITECTURE:
// The component receives a ClassificationResult and renders different
// sections based on available data. Premium fields are optional and
// the component gracefully handles their absence.
// =============================================================================

import { cn } from '@/lib/utils';
import { formatDuration, formatDateTime, getRiskColors } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { ClassificationResult, Classification, DetectedPattern, Suggestion } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface ResultDisplayProps {
  /** The classification result to display */
  result: ClassificationResult;
  /** Whether to show extended details (patterns, suggestions, etc.) */
  showDetails?: boolean;
}

// =============================================================================
// CLASSIFICATION CONFIGURATION
// =============================================================================

/**
 * Configuration for each classification type.
 * Defines labels, colors, and SVG icons (no emojis per requirements).
 */
const classificationConfig: Record<
  Classification,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    iconPath: string;
  }
> = {
  'client-only': {
    label: 'Client Only',
    bgColor: 'bg-client-100',
    textColor: 'text-client-600',
    borderColor: 'border-client-500',
    // Browser/monitor icon
    iconPath:
      'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  'server-only': {
    label: 'Server Only',
    bgColor: 'bg-server-100',
    textColor: 'text-server-600',
    borderColor: 'border-server-500',
    // Server icon
    iconPath:
      'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  },
  both: {
    label: 'Both Safe',
    bgColor: 'bg-both-100',
    textColor: 'text-both-600',
    borderColor: 'border-both-500',
    // Check/shield icon
    iconPath:
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
};

// =============================================================================
// RESULT DISPLAY COMPONENT
// =============================================================================

export default function ResultDisplay({
  result,
  showDetails = true,
}: ResultDisplayProps) {
  const config = classificationConfig[result.classification];
  const patterns = result.patterns || [];
  const suggestions = result.suggestions || [];
  const riskLevel = result.riskLevel;
  const pipelineResults = result.pipelineResults;

  return (
    <div className="space-y-6">
      {/* =====================================================================
          CLASSIFICATION BADGE
          ===================================================================== */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border-2',
            config.bgColor,
            config.textColor,
            config.borderColor
          )}
        >
          {/* SVG icon instead of emoji */}
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={config.iconPath}
            />
          </svg>
          {config.label}
        </div>

        {/* Risk level badge (if available) */}
        {riskLevel && (
          <div
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border',
              getRiskColors(riskLevel).bg,
              getRiskColors(riskLevel).text,
              getRiskColors(riskLevel).border
            )}
          >
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </div>
        )}
      </div>

      {/* =====================================================================
          ENVIRONMENT INDICATORS
          ===================================================================== */}
      <div className="flex gap-2">
        {/* Client indicator */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium',
            result.classification === 'client-only' || result.classification === 'both'
              ? 'bg-client-50 text-client-600 border border-client-500'
              : 'bg-gray-800 text-gray-500 border border-gray-700'
          )}
        >
          <span>Client</span>
          {(result.classification === 'client-only' || result.classification === 'both') && (
            <svg
              className="h-3.5 w-3.5"
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
          )}
        </div>

        {/* Server indicator */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium',
            result.classification === 'server-only' || result.classification === 'both'
              ? 'bg-server-50 text-server-600 border border-server-500'
              : 'bg-gray-800 text-gray-500 border border-gray-700'
          )}
        >
          <span>Server</span>
          {(result.classification === 'server-only' || result.classification === 'both') && (
            <svg
              className="h-3.5 w-3.5"
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
          )}
        </div>
      </div>

      {/* =====================================================================
          EXPLANATION
          ===================================================================== */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Explanation
        </h3>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {result.explanation}
          </p>
        </div>
      </div>

      {/* =====================================================================
          DETECTED PATTERNS (Premium Feature)
          ===================================================================== */}
      {showDetails && patterns.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Detected Patterns ({patterns.length})
          </h3>
          <div className="space-y-1">
            {patterns.map((pattern: DetectedPattern, index: number) => (
              <PatternItem key={`${pattern.name}-${index}`} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUGGESTIONS (Premium Feature)
          ===================================================================== */}
      {showDetails && suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Suggestions ({suggestions.length})
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {suggestions.map((suggestion: Suggestion, index: number) => (
              <AccordionItem key={index} value={`suggestion-${index}`}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                        suggestion.priority === 1
                          ? 'bg-red-500 text-white'
                          : suggestion.priority === 2
                          ? 'bg-orange-500 text-white'
                          : 'bg-yellow-500 text-black'
                      )}
                    >
                      {suggestion.priority}
                    </span>
                    <span>{suggestion.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-300">Issue:</span>{' '}
                      {suggestion.issue}
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-300">Recommendation:</span>{' '}
                      {suggestion.recommendation}
                    </p>
                    {suggestion.codeExample && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-300">Example:</span>
                        <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                          <code>{suggestion.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* =====================================================================
          CODE EXAMPLES (Comprehensive Depth Only)
          ===================================================================== */}
      {showDetails && pipelineResults?.examples?.data && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Code Examples
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {pipelineResults.examples.data.clientExample && (
              <AccordionItem value="client-example">
                <AccordionTrigger className="text-sm">
                  Client Component Example
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="p-3 bg-gray-800 rounded text-xs overflow-x-auto">
                    <code>{pipelineResults.examples.data.clientExample}</code>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
            {pipelineResults.examples.data.serverExample && (
              <AccordionItem value="server-example">
                <AccordionTrigger className="text-sm">
                  Server Component Example
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="p-3 bg-gray-800 rounded text-xs overflow-x-auto">
                    <code>{pipelineResults.examples.data.serverExample}</code>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
            {pipelineResults.examples.data.refactoredExample && (
              <AccordionItem value="refactored-example">
                <AccordionTrigger className="text-sm">
                  Refactored Example
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="p-3 bg-gray-800 rounded text-xs overflow-x-auto">
                    <code>{pipelineResults.examples.data.refactoredExample}</code>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}

      {/* =====================================================================
          METADATA FOOTER
          ===================================================================== */}
      <div className="pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <div>
          Analyzed on {formatDateTime(result.createdAt)}
        </div>
        {pipelineResults?.metadata?.totalDuration && (
          <div>
            Analysis time: {formatDuration(pipelineResults.metadata.totalDuration)}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PATTERN ITEM COMPONENT
// =============================================================================

/**
 * Displays a single detected pattern with its details.
 */
function PatternItem({ pattern }: { pattern: DetectedPattern }) {
  // Determine color based on environment
  const envColors = {
    client: 'text-client-500 bg-client-500/10',
    server: 'text-server-500 bg-server-500/10',
    both: 'text-both-500 bg-both-500/10',
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-gray-800/50 text-sm">
      {/* Environment badge */}
      <span
        className={cn(
          'px-1.5 py-0.5 rounded text-xs font-medium',
          envColors[pattern.environment]
        )}
      >
        {pattern.environment}
      </span>

      {/* Pattern name */}
      <span className="font-mono text-gray-300">{pattern.name}</span>

      {/* Line number (if available) */}
      {pattern.line && (
        <span className="text-gray-500 text-xs">line {pattern.line}</span>
      )}

      {/* Risk indicator (if available) */}
      {pattern.riskContribution && pattern.riskContribution !== 'low' && (
        <span
          className={cn(
            'ml-auto text-xs',
            pattern.riskContribution === 'critical'
              ? 'text-red-400'
              : pattern.riskContribution === 'high'
              ? 'text-orange-400'
              : 'text-yellow-400'
          )}
        >
          {pattern.riskContribution}
        </span>
      )}
    </div>
  );
}
