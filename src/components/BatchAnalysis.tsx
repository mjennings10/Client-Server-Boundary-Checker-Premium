// =============================================================================
// BATCH ANALYSIS COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Enables analyzing multiple code snippets in a single operation.
// Provides batch input, progress tracking, and summary results.
//
// FEATURES:
// - Multi-snippet input with delimiter support
// - Real-time progress tracking
// - Summary statistics
// - Individual result viewing
// - Batch history
//
// INPUT FORMATS:
// Snippets can be separated by:
// - "// --- snippet: name ---" comments
// - "---" on its own line
// - Multiple functions/components are auto-detected
// =============================================================================

'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { startBatchAnalysis, getBatchStatus, clearBatchCache } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { BatchAnalysis as BatchAnalysisType, BatchItem, Classification } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface BatchAnalysisProps {
  /** Callback when batch completes */
  onBatchComplete?: (batch: BatchAnalysisType) => void;
}

// =============================================================================
// BATCH ANALYSIS COMPONENT
// =============================================================================

export default function BatchAnalysis({ onBatchComplete }: BatchAnalysisProps) {
  // ===========================================================================
  // STATE
  // ===========================================================================

  // Input state
  const [input, setInput] = useState('');

  // Batch execution state
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchAnalysisType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading state
  const [isPending, startTransition] = useTransition();
  const [isPolling, setIsPolling] = useState(false);

  // View state
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // ===========================================================================
  // BATCH POLLING
  // ===========================================================================

  /**
   * Polls for batch status updates while the batch is running.
   * Uses a 1-second interval to check for progress.
   */
  useEffect(() => {
    if (!batchId || !isPolling) return;

    const pollInterval = setInterval(async () => {
      const status = await getBatchStatus(batchId);

      if (status) {
        setBatch(status);

        // Stop polling when batch is done
        if (status.status !== 'running') {
          setIsPolling(false);

          // Notify parent
          if (status.status === 'completed') {
            onBatchComplete?.(status);
          }

          // Clear cache after a delay
          setTimeout(() => {
            clearBatchCache(batchId);
          }, 60000); // Keep in cache for 1 minute
        }
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [batchId, isPolling, onBatchComplete]);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  /**
   * Starts the batch analysis process.
   */
  const handleStartBatch = () => {
    if (!input.trim()) {
      setError('Please enter code to analyze.');
      return;
    }

    setError(null);
    setSelectedItem(null);

    startTransition(async () => {
      const result = await startBatchAnalysis(input);

      if ('error' in result) {
        setError(result.error);
      } else {
        setBatchId(result.batchId);
        setIsPolling(true);
      }
    });
  };

  /**
   * Clears the current batch and resets state.
   */
  const handleClear = () => {
    setInput('');
    setBatchId(null);
    setBatch(null);
    setError(null);
    setSelectedItem(null);
  };

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================

  const progress = batch
    ? Math.round(((batch.completedCount + batch.errorCount) / batch.items.length) * 100)
    : 0;

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* =====================================================================
          INPUT SECTION
          ===================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* Stack icon */}
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Batch Analysis
          </CardTitle>
          <CardDescription>
            Analyze multiple code snippets at once. Separate snippets with &quot;---&quot; or
            &quot;// --- snippet ---&quot; comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`// --- snippet: Component 1 ---
function Button() {
  const [active, setActive] = useState(false);
  return <button onClick={() => setActive(true)}>Click</button>;
}

// --- snippet: Server Action ---
async function saveData(data) {
  "use server";
  await prisma.item.create({ data });
}

// --- snippet: Utility ---
export function formatDate(date) {
  return date.toLocaleDateString();
}`}
            className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 font-mono text-sm"
            disabled={isPolling}
          />

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              <svg
                className="h-4 w-4 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleStartBatch}
              disabled={isPending || isPolling || !input.trim()}
              isLoading={isPending || isPolling}
              className="flex-1"
            >
              {isPolling ? 'Analyzing...' : 'Start Batch Analysis'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isPending || isPolling}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================================
          PROGRESS SECTION
          ===================================================================== */}
      {batch && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Batch Progress</CardTitle>
              <span className="text-sm text-gray-400">
                {batch.completedCount + batch.errorCount} / {batch.items.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <Progress value={progress} />

            {/* Item list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batch.items.map((item, index) => (
                <BatchItemRow
                  key={index}
                  item={item}
                  isSelected={selectedItem === index}
                  onClick={() => setSelectedItem(index)}
                />
              ))}
            </div>

            {/* Summary (when complete) */}
            {batch.status === 'completed' && batch.summary && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-client-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-client-500">
                      {batch.summary.clientOnly}
                    </div>
                    <div className="text-xs text-gray-400">Client Only</div>
                  </div>
                  <div className="p-3 bg-server-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-server-500">
                      {batch.summary.serverOnly}
                    </div>
                    <div className="text-xs text-gray-400">Server Only</div>
                  </div>
                  <div className="p-3 bg-both-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-both-500">
                      {batch.summary.both}
                    </div>
                    <div className="text-xs text-gray-400">Both Safe</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          SELECTED ITEM DETAILS
          ===================================================================== */}
      {batch && selectedItem !== null && batch.items[selectedItem]?.result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {batch.items[selectedItem].label || `Snippet ${selectedItem + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Classification */}
              <div className="flex items-center gap-2">
                <ClassificationBadge
                  classification={batch.items[selectedItem].result!.classification}
                />
              </div>

              {/* Code preview */}
              <pre className="p-3 bg-gray-800 rounded text-xs overflow-x-auto max-h-32">
                <code>{batch.items[selectedItem].code}</code>
              </pre>

              {/* Explanation */}
              <p className="text-sm text-gray-400">
                {batch.items[selectedItem].result!.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// BATCH ITEM ROW COMPONENT
// =============================================================================

function BatchItemRow({
  item,
  isSelected,
  onClick,
}: {
  item: BatchItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusIcons = {
    pending: (
      <div className="w-4 h-4 rounded-full bg-gray-600" />
    ),
    running: (
      <svg
        className="w-4 h-4 text-blue-400 animate-spin"
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
    ),
    completed: (
      <svg
        className="w-4 h-4 text-green-400"
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
    ),
    error: (
      <svg
        className="w-4 h-4 text-red-400"
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
    ),
    cancelled: (
      <div className="w-4 h-4 rounded-full bg-gray-500" />
    ),
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
        isSelected ? 'bg-gray-700' : 'bg-gray-800/50 hover:bg-gray-800'
      )}
    >
      {/* Status icon */}
      {statusIcons[item.status]}

      {/* Label */}
      <span className="flex-1 text-sm text-gray-300 truncate">
        {item.label || `Snippet ${item.index + 1}`}
      </span>

      {/* Classification badge (if completed) */}
      {item.result && (
        <ClassificationDot classification={item.result.classification} />
      )}

      {/* Error indicator */}
      {item.error && (
        <span className="text-xs text-red-400 truncate max-w-[100px]">
          {item.error}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ClassificationBadge({ classification }: { classification: Classification }) {
  const config = {
    'client-only': { label: 'Client Only', className: 'bg-client-500/20 text-client-500' },
    'server-only': { label: 'Server Only', className: 'bg-server-500/20 text-server-500' },
    both: { label: 'Both Safe', className: 'bg-both-500/20 text-both-500' },
  };

  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium', config[classification].className)}>
      {config[classification].label}
    </span>
  );
}

function ClassificationDot({ classification }: { classification: Classification }) {
  const config = {
    'client-only': 'bg-client-500',
    'server-only': 'bg-server-500',
    both: 'bg-both-500',
  };

  return <div className={cn('w-2 h-2 rounded-full', config[classification])} />;
}
