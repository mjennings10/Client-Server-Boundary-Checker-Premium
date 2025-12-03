// =============================================================================
// SERVER ACTIONS INDEX - Client/Server Boundary Checker Premium
// =============================================================================
// This file re-exports all server actions from a single entry point.
// This makes imports cleaner and provides a central location for all actions.
//
// USAGE:
// import { classifyBoundary, getHistory, updateConfig } from '@/app/actions';
//
// ORGANIZATION:
// - analysis.ts: Code analysis and classification
// - history.ts: History management and export
// - batch.ts: Batch analysis operations
// - config.ts: User configuration
// - analytics.ts: Dashboard analytics
// =============================================================================

'use server';

// =============================================================================
// ANALYSIS ACTIONS
// =============================================================================
// Main code analysis functionality
// =============================================================================

export {
  classifyBoundary,
  classifyBoundaryPremium,
  getAnalysisById,
  reanalyze,
  type AnalysisOptions,
  type PremiumAnalysisResult,
} from './analysis';

// =============================================================================
// HISTORY ACTIONS
// =============================================================================
// History management and export functionality
// =============================================================================

export {
  getHistory,
  getHistoryCount,
  deleteAnalysis,
  clearHistory,
  exportHistory,
} from './history';

// =============================================================================
// BATCH ACTIONS
// =============================================================================
// Batch analysis operations
// =============================================================================

export {
  startBatchAnalysis,
  getBatchStatus,
  getBatchResults,
  cancelBatch,
  clearBatchCache,
  getBatchHistory,
} from './batch';

// =============================================================================
// CONFIGURATION ACTIONS
// =============================================================================
// User settings and preferences
// =============================================================================

export {
  getConfig,
  updateConfig,
  resetConfig,
  ANALYSIS_DEPTH_OPTIONS,
  FRAMEWORK_MODE_OPTIONS,
  STRICTNESS_LEVEL_OPTIONS,
} from './config';

// =============================================================================
// ANALYTICS ACTIONS
// =============================================================================
// Dashboard analytics and metrics
// =============================================================================

export {
  getAnalyticsSummary,
  getTimeSeriesData,
  getTopPatterns,
  getClassificationDistribution,
  getRiskDistribution,
  getRecentActivity,
  getTrends,
} from './analytics';

// =============================================================================
// TYPE RE-EXPORTS
// =============================================================================
// Re-export commonly used types for convenience
// =============================================================================

export type {
  Classification,
  ClassificationResult,
  ClassificationError,
  PipelineResults,
  DetectedPattern,
  Suggestion,
  RiskLevel,
  AnalysisDepth,
  FrameworkMode,
  StrictnessLevel,
  UserConfig,
  BatchAnalysis,
  ExportOptions,
  ExportResult,
  AnalyticsSummary,
} from '@/types';
