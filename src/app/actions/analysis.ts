// =============================================================================
// ANALYSIS SERVER ACTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains server actions for the main analysis functionality.
// Server actions are async functions that run on the server but can be
// called from Client Components.
//
// KEY ACTIONS:
// - classifyBoundary: Main entry point for code analysis
// - classifyBoundaryPremium: Full pipeline analysis with all steps
// - getAnalysisById: Retrieve a specific analysis
//
// ARCHITECTURE NOTES:
// - All actions are marked with 'use server' directive
// - Actions validate input before processing
// - Results are saved to database for history/analytics
// - Analytics events are recorded for dashboard metrics
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { prisma, recordAnalyticsEvent } from '@/lib/db';
import { executePipeline, getClassificationFromPipeline } from '@/lib/pipeline';
import { validateCodeInput } from '@/lib/utils';
import type {
  Classification,
  ClassificationResult,
  ClassificationError,
  AnalysisDepth,
  FrameworkMode,
  StrictnessLevel,
  PipelineResults,
} from '@/types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Options for the analysis operation.
 * All fields are optional - defaults will be used if not specified.
 */
export interface AnalysisOptions {
  /** How thorough the analysis should be */
  analysisDepth?: AnalysisDepth;

  /** Target framework mode */
  frameworkMode?: FrameworkMode;

  /** How strict the boundary checking should be */
  strictnessLevel?: StrictnessLevel;

  /** Optional batch ID if part of a batch operation */
  batchId?: string;
}

/**
 * Premium analysis result including full pipeline data.
 * Extends the base ClassificationResult with additional fields.
 */
export interface PremiumAnalysisResult extends ClassificationResult {
  /** Complete pipeline results with all step outputs */
  pipelineResults: PipelineResults;
}

// =============================================================================
// MAIN ANALYSIS ACTIONS
// =============================================================================

/**
 * Performs a premium boundary analysis on the given code.
 * This is the main entry point for the premium analysis feature.
 *
 * PROCESS:
 * 1. Validate input code
 * 2. Load user config for default settings
 * 3. Execute the multi-step pipeline
 * 4. Save results to database
 * 5. Record analytics event
 * 6. Revalidate page cache
 *
 * @param code - The code to analyze
 * @param options - Optional analysis configuration
 * @returns Analysis result or error
 */
export async function classifyBoundaryPremium(
  code: string,
  options: AnalysisOptions = {}
): Promise<PremiumAnalysisResult | ClassificationError> {
  // ===========================================================================
  // INPUT VALIDATION
  // ===========================================================================
  // Validate the code input before processing
  // ===========================================================================

  const validationError = validateCodeInput(code);
  if (validationError) {
    return { error: validationError };
  }

  // ===========================================================================
  // LOAD USER CONFIG
  // ===========================================================================
  // Merge provided options with stored user preferences
  // ===========================================================================

  let userConfig;
  try {
    userConfig = await prisma.userConfig.findUnique({
      where: { id: 'default' },
    });
  } catch (error) {
    // Config table might not exist yet - use defaults
    console.error('Failed to load user config:', error);
  }

  // Build pipeline config from options and user preferences
  const pipelineConfig = {
    analysisDepth:
      options.analysisDepth ||
      (userConfig?.analysisDepth as AnalysisDepth) ||
      'standard',
    frameworkMode:
      options.frameworkMode ||
      (userConfig?.frameworkMode as FrameworkMode) ||
      'app-router',
    strictnessLevel:
      options.strictnessLevel ||
      (userConfig?.strictnessLevel as StrictnessLevel) ||
      'standard',
  };

  // ===========================================================================
  // EXECUTE PIPELINE
  // ===========================================================================
  // Run the multi-step analysis pipeline
  // ===========================================================================

  let pipelineResults: PipelineResults;
  try {
    pipelineResults = await executePipeline(code, pipelineConfig);
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    return { error: 'Analysis pipeline failed. Please try again.' };
  }

  // ===========================================================================
  // EXTRACT RESULTS
  // ===========================================================================
  // Get the main classification and other data from pipeline
  // ===========================================================================

  const classification = getClassificationFromPipeline(pipelineResults);
  if (!classification) {
    return { error: 'Failed to classify code. Please try again.' };
  }

  const explanation =
    pipelineResults.classification.data?.explanation ||
    'Classification completed.';
  const patterns = pipelineResults.patternDetection.data?.patterns || [];
  const riskLevel = pipelineResults.riskAssessment.data?.riskLevel || 'low';
  const suggestions = pipelineResults.suggestions.data?.suggestions || [];

  // ===========================================================================
  // SAVE TO DATABASE
  // ===========================================================================
  // Store the analysis result with all premium data
  // ===========================================================================

  let savedCheck;
  try {
    savedCheck = await prisma.boundaryCheck.create({
      data: {
        code,
        classification,
        explanation,
        analysisDepth: pipelineConfig.analysisDepth,
        pipelineResults: JSON.stringify(pipelineResults),
        patterns: JSON.stringify(patterns),
        riskLevel,
        suggestions: JSON.stringify(suggestions),
        batchId: options.batchId || null,
      },
    });
  } catch (error) {
    console.error('Failed to save analysis:', error);
    // Continue without saving - we still have the result
    savedCheck = {
      id: 'unsaved-' + Date.now(),
      createdAt: new Date(),
    };
  }

  // ===========================================================================
  // RECORD ANALYTICS
  // ===========================================================================
  // Track this analysis for the analytics dashboard
  // ===========================================================================

  await recordAnalyticsEvent('analysis', {
    classification,
    riskLevel,
    analysisDepth: pipelineConfig.analysisDepth,
    patternsCount: patterns.length,
    duration: pipelineResults.metadata.totalDuration,
  });

  // ===========================================================================
  // REVALIDATE CACHE
  // ===========================================================================
  // Refresh the page to show updated history
  // ===========================================================================

  revalidatePath('/');

  // ===========================================================================
  // RETURN RESULT
  // ===========================================================================

  return {
    id: savedCheck.id,
    classification: classification as Classification,
    explanation,
    code,
    createdAt: savedCheck.createdAt,
    analysisDepth: pipelineConfig.analysisDepth,
    pipelineResults,
    patterns,
    riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
    suggestions,
  };
}

/**
 * Simple boundary classification (compatibility with base version).
 * Performs a quick analysis using the pipeline with minimal options.
 *
 * @param code - The code to analyze
 * @returns Classification result or error
 */
export async function classifyBoundary(
  code: string
): Promise<ClassificationResult | ClassificationError> {
  // Use the premium function with quick depth for backward compatibility
  const result = await classifyBoundaryPremium(code, {
    analysisDepth: 'standard',
  });

  if ('error' in result) {
    return result;
  }

  // Return simplified result for backward compatibility
  return {
    id: result.id,
    classification: result.classification,
    explanation: result.explanation,
    code: result.code,
    createdAt: result.createdAt,
    analysisDepth: result.analysisDepth,
    pipelineResults: result.pipelineResults,
    patterns: result.patterns,
    riskLevel: result.riskLevel,
    suggestions: result.suggestions,
  };
}

/**
 * Retrieves a specific analysis by ID.
 * Used for loading history items.
 *
 * @param id - The analysis ID
 * @returns Analysis result or null if not found
 */
export async function getAnalysisById(
  id: string
): Promise<ClassificationResult | null> {
  try {
    const check = await prisma.boundaryCheck.findUnique({
      where: { id },
    });

    if (!check) return null;

    return {
      id: check.id,
      classification: check.classification as Classification,
      explanation: check.explanation,
      code: check.code,
      createdAt: check.createdAt,
      analysisDepth: check.analysisDepth as AnalysisDepth,
      pipelineResults: check.pipelineResults
        ? JSON.parse(check.pipelineResults)
        : undefined,
      patterns: check.patterns ? JSON.parse(check.patterns) : undefined,
      riskLevel: check.riskLevel as 'low' | 'medium' | 'high' | 'critical',
      suggestions: check.suggestions ? JSON.parse(check.suggestions) : undefined,
    };
  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    return null;
  }
}

/**
 * Re-analyzes existing code with new settings.
 * Useful for comparing results with different configurations.
 *
 * @param id - The original analysis ID
 * @param options - New analysis options
 * @returns New analysis result
 */
export async function reanalyze(
  id: string,
  options: AnalysisOptions
): Promise<PremiumAnalysisResult | ClassificationError> {
  // Get the original analysis
  const original = await getAnalysisById(id);

  if (!original) {
    return { error: 'Original analysis not found.' };
  }

  // Re-run analysis with new options
  return classifyBoundaryPremium(original.code, options);
}
