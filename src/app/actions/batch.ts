// =============================================================================
// BATCH ANALYSIS SERVER ACTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains server actions for batch analysis operations.
// Batch analysis allows users to analyze multiple code snippets at once.
//
// KEY ACTIONS:
// - startBatchAnalysis: Begin a batch analysis operation
// - getBatchStatus: Check the status of a batch operation
// - getBatchResults: Get results of a completed batch
//
// ARCHITECTURE NOTES:
// - Batch operations run sequentially to avoid rate limits
// - Each item in the batch gets its own database entry
// - All items share a common batchId for grouping
// - Progress is tracked and can be queried
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { prisma, recordAnalyticsEvent } from '@/lib/db';
import { classifyBoundaryPremium, type AnalysisOptions } from './analysis';
import { parseCodeSnippets, generateBatchId } from '@/lib/utils';
import type {
  BatchAnalysis,
  BatchItem,
  BatchStatus,
  Classification,
  ClassificationResult,
  AnalysisDepth,
} from '@/types';

// =============================================================================
// BATCH ANALYSIS STATE
// =============================================================================
// We use in-memory state to track batch progress since batches are
// short-lived operations. For longer operations, consider using a
// proper job queue (Redis, Bull, etc.)
// =============================================================================

/**
 * In-memory cache for batch analysis state.
 * Key is batchId, value is the current state.
 *
 * NOTE: This is cleared on server restart. For production,
 * consider persisting batch state to database.
 */
const batchStateCache = new Map<string, BatchAnalysis>();

// =============================================================================
// BATCH ANALYSIS ACTIONS
// =============================================================================

/**
 * Starts a batch analysis operation.
 * Parses the input into individual snippets and analyzes each one.
 *
 * INPUT FORMATS SUPPORTED:
 * 1. Multiple snippets separated by "// ---" delimiter
 * 2. Multiple snippets separated by "---" on its own line
 * 3. Single snippet (treated as batch of 1)
 *
 * @param input - The input text containing one or more code snippets
 * @param options - Analysis options applied to all snippets
 * @returns The batch ID for tracking progress
 */
export async function startBatchAnalysis(
  input: string,
  options: AnalysisOptions = {}
): Promise<{ batchId: string } | { error: string }> {
  // ===========================================================================
  // PARSE INPUT
  // ===========================================================================
  // Split the input into individual code snippets
  // ===========================================================================

  const snippets = parseCodeSnippets(input);

  if (snippets.length === 0) {
    return { error: 'No valid code snippets found in input.' };
  }

  if (snippets.length > 20) {
    return { error: 'Maximum 20 snippets allowed per batch.' };
  }

  // ===========================================================================
  // INITIALIZE BATCH STATE
  // ===========================================================================
  // Create the batch tracking object
  // ===========================================================================

  const batchId = generateBatchId();

  const batchState: BatchAnalysis = {
    id: batchId,
    items: snippets.map((snippet, index) => ({
      index,
      code: snippet.code,
      label: snippet.label,
      status: 'pending' as BatchStatus,
    })),
    status: 'running',
    completedCount: 0,
    errorCount: 0,
    startedAt: new Date(),
  };

  // Store in cache
  batchStateCache.set(batchId, batchState);

  // Record analytics event
  await recordAnalyticsEvent('batch_start', {
    batchId,
    itemCount: snippets.length,
    analysisDepth: options.analysisDepth || 'standard',
  });

  // ===========================================================================
  // EXECUTE BATCH (Non-blocking)
  // ===========================================================================
  // Start the batch processing without waiting for completion
  // This allows the client to poll for progress
  // ===========================================================================

  // Execute in background (don't await)
  executeBatch(batchId, options).catch((error) => {
    console.error(`Batch ${batchId} failed:`, error);
    const state = batchStateCache.get(batchId);
    if (state) {
      state.status = 'error';
    }
  });

  return { batchId };
}

/**
 * Executes a batch analysis operation.
 * Processes each snippet sequentially to avoid rate limits.
 *
 * @param batchId - The batch ID
 * @param options - Analysis options
 */
async function executeBatch(
  batchId: string,
  options: AnalysisOptions
): Promise<void> {
  const state = batchStateCache.get(batchId);
  if (!state) {
    throw new Error(`Batch ${batchId} not found`);
  }

  // Process each item sequentially
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];

    // Update status to running
    item.status = 'running';

    try {
      // Perform analysis
      const result = await classifyBoundaryPremium(item.code, {
        ...options,
        batchId,
      });

      if ('error' in result) {
        // Analysis returned an error
        item.status = 'error';
        item.error = result.error;
        state.errorCount++;
      } else {
        // Analysis succeeded
        item.status = 'completed';
        item.result = result;
        state.completedCount++;
      }
    } catch (error) {
      // Unexpected error
      item.status = 'error';
      item.error = error instanceof Error ? error.message : 'Unknown error';
      state.errorCount++;
    }

    // Add a small delay between items to avoid rate limiting
    if (i < state.items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // ===========================================================================
  // FINALIZE BATCH
  // ===========================================================================
  // Calculate summary statistics and update final state
  // ===========================================================================

  state.status = 'completed';
  state.completedAt = new Date();

  // Calculate summary
  const completedItems = state.items.filter((item) => item.status === 'completed');
  state.summary = {
    clientOnly: completedItems.filter(
      (item) => item.result?.classification === 'client-only'
    ).length,
    serverOnly: completedItems.filter(
      (item) => item.result?.classification === 'server-only'
    ).length,
    both: completedItems.filter(
      (item) => item.result?.classification === 'both'
    ).length,
    averageRisk: calculateAverageRisk(completedItems),
  };

  // Record completion event
  await recordAnalyticsEvent('batch_complete', {
    batchId,
    completedCount: state.completedCount,
    errorCount: state.errorCount,
    duration: state.completedAt.getTime() - (state.startedAt?.getTime() || 0),
    summary: state.summary,
  });

  // Revalidate the page
  revalidatePath('/');
}

/**
 * Calculates the average risk score for completed batch items.
 *
 * @param items - Completed batch items
 * @returns Average risk score (0-100)
 */
function calculateAverageRisk(items: BatchItem[]): number {
  const riskScores: Record<string, number> = {
    low: 20,
    medium: 50,
    high: 75,
    critical: 95,
  };

  let totalScore = 0;
  let count = 0;

  for (const item of items) {
    if (item.result?.riskLevel) {
      totalScore += riskScores[item.result.riskLevel] || 0;
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 0;
}

// =============================================================================
// BATCH STATUS ACTIONS
// =============================================================================

/**
 * Gets the current status of a batch operation.
 * Use this to poll for progress during batch execution.
 *
 * @param batchId - The batch ID to check
 * @returns Current batch state or null if not found
 */
export async function getBatchStatus(
  batchId: string
): Promise<BatchAnalysis | null> {
  const state = batchStateCache.get(batchId);
  return state || null;
}

/**
 * Gets the results of a completed batch operation.
 * Returns detailed results for each item in the batch.
 *
 * @param batchId - The batch ID
 * @returns Batch results or null if not found
 */
export async function getBatchResults(
  batchId: string
): Promise<BatchAnalysis | null> {
  // First check cache
  const cached = batchStateCache.get(batchId);
  if (cached) {
    return cached;
  }

  // If not in cache, try to reconstruct from database
  try {
    const checks = await prisma.boundaryCheck.findMany({
      where: { batchId },
      orderBy: { createdAt: 'asc' },
    });

    if (checks.length === 0) {
      return null;
    }

    // Reconstruct batch state from database records
    const reconstructed: BatchAnalysis = {
      id: batchId,
      items: checks.map((check, index) => ({
        index,
        code: check.code,
        status: 'completed' as BatchStatus,
        result: {
          id: check.id,
          classification: check.classification as Classification,
          explanation: check.explanation,
          code: check.code,
          createdAt: check.createdAt,
          analysisDepth: check.analysisDepth as AnalysisDepth,
          patterns: check.patterns ? JSON.parse(check.patterns) : undefined,
          riskLevel: check.riskLevel as 'low' | 'medium' | 'high' | 'critical',
          suggestions: check.suggestions
            ? JSON.parse(check.suggestions)
            : undefined,
        },
      })),
      status: 'completed',
      completedCount: checks.length,
      errorCount: 0,
      completedAt: checks[checks.length - 1].createdAt,
    };

    return reconstructed;
  } catch (error) {
    console.error('Failed to get batch results:', error);
    return null;
  }
}

/**
 * Cancels a running batch operation.
 * Marks remaining items as cancelled and stops processing.
 *
 * @param batchId - The batch ID to cancel
 * @returns Success status
 */
export async function cancelBatch(
  batchId: string
): Promise<{ success: boolean }> {
  const state = batchStateCache.get(batchId);

  if (!state) {
    return { success: false };
  }

  if (state.status !== 'running') {
    return { success: false };
  }

  // Mark as cancelled
  state.status = 'cancelled';

  // Mark pending items as cancelled
  for (const item of state.items) {
    if (item.status === 'pending') {
      item.status = 'cancelled' as BatchStatus;
    }
  }

  return { success: true };
}

/**
 * Clears a batch from the cache.
 * Use this after you've processed the results.
 *
 * @param batchId - The batch ID to clear
 */
export async function clearBatchCache(batchId: string): Promise<void> {
  batchStateCache.delete(batchId);
}

/**
 * Gets all batches from history.
 * Queries the database for unique batch IDs and their item counts.
 *
 * @returns Array of batch summaries
 */
export async function getBatchHistory(): Promise<
  Array<{
    batchId: string;
    itemCount: number;
    createdAt: Date;
    classifications: { clientOnly: number; serverOnly: number; both: number };
  }>
> {
  try {
    // Get all batch IDs with their counts
    const batches = await prisma.boundaryCheck.groupBy({
      by: ['batchId'],
      where: { batchId: { not: null } },
      _count: { id: true },
      _min: { createdAt: true },
    });

    // For each batch, get classification breakdown
    const results = await Promise.all(
      batches.map(async (batch) => {
        if (!batch.batchId) return null;

        const classifications = await prisma.boundaryCheck.groupBy({
          by: ['classification'],
          where: { batchId: batch.batchId },
          _count: { id: true },
        });

        return {
          batchId: batch.batchId,
          itemCount: batch._count.id,
          createdAt: batch._min.createdAt || new Date(),
          classifications: {
            clientOnly:
              classifications.find((c) => c.classification === 'client-only')
                ?._count.id || 0,
            serverOnly:
              classifications.find((c) => c.classification === 'server-only')
                ?._count.id || 0,
            both:
              classifications.find((c) => c.classification === 'both')?._count
                .id || 0,
          },
        };
      })
    );

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error('Failed to get batch history:', error);
    return [];
  }
}
