// =============================================================================
// SHARED TYPESCRIPT TYPES - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains all shared type definitions used across the application.
// Centralizing types here ensures consistency and makes refactoring easier.
//
// ORGANIZATION:
// 1. Classification Types - Core boundary classification types
// 2. Pipeline Types - Multi-step analysis pipeline structures
// 3. Pattern Types - Code pattern detection structures
// 4. Configuration Types - User settings and preferences
// 5. Analytics Types - Dashboard and metrics structures
// 6. Export Types - Data export formats
// 7. UI Types - Component prop types
// =============================================================================

// =============================================================================
// 1. CLASSIFICATION TYPES
// =============================================================================
// These are the core types for boundary classification results.
// The Classification type is the foundation of the entire application.
// =============================================================================

/**
 * The three possible boundary classifications for code.
 *
 * - "client-only": Code that can ONLY run in the browser
 *   Examples: useState, window.localStorage, onClick handlers
 *
 * - "server-only": Code that can ONLY run on the server
 *   Examples: fs.readFile, database queries, process.env access
 *
 * - "both": Code that is isomorphic and can run in either environment
 *   Examples: Pure functions, type definitions, basic utilities
 */
export type Classification = 'client-only' | 'server-only' | 'both';

/**
 * Risk levels for boundary violations.
 * Used to prioritize issues and guide developer attention.
 *
 * - "low": Code is properly placed, minimal risk
 * - "medium": Minor issues that may cause problems
 * - "high": Significant violations that will likely cause runtime errors
 * - "critical": Definite failures if code runs in wrong environment
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Complete result from a boundary check analysis.
 * This is the primary data structure returned from analysis operations.
 */
export interface ClassificationResult {
  /** Unique identifier for this analysis */
  id: string;

  /** The boundary classification */
  classification: Classification;

  /** Human-readable explanation of the classification */
  explanation: string;

  /** The original code that was analyzed */
  code: string;

  /** When the analysis was performed */
  createdAt: Date;

  // ==========================================================================
  // PREMIUM FIELDS
  // ==========================================================================

  /** Analysis depth used for this check */
  analysisDepth?: AnalysisDepth;

  /** Complete pipeline results (all 5 steps) */
  pipelineResults?: PipelineResults;

  /** Detected code patterns */
  patterns?: DetectedPattern[];

  /** Risk assessment level */
  riskLevel?: RiskLevel;

  /** Refactoring suggestions */
  suggestions?: Suggestion[];

  /** Batch ID if part of a batch operation */
  batchId?: string;
}

/**
 * Error response from classification operations.
 * Used for discriminated union pattern in function returns.
 */
export interface ClassificationError {
  error: string;
}

// =============================================================================
// 2. PIPELINE TYPES
// =============================================================================
// The premium version uses a multi-step analysis pipeline.
// Each step builds on previous steps to provide comprehensive analysis.
// =============================================================================

/**
 * The 5 steps in the analysis pipeline.
 * Each step has a specific purpose and outputs specific data.
 */
export type PipelineStep =
  | 'classification'      // Step 1: Basic boundary classification
  | 'pattern-detection'   // Step 2: Detect APIs, hooks, imports
  | 'risk-assessment'     // Step 3: Evaluate risk level
  | 'suggestions'         // Step 4: Generate refactoring suggestions
  | 'examples';           // Step 5: Provide code examples

/**
 * Status of an individual pipeline step.
 * Enables progress tracking and error handling per step.
 */
export type PipelineStepStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

/**
 * Result from a single pipeline step.
 * Generic structure that accommodates different step outputs.
 */
export interface PipelineStepResult<T = unknown> {
  /** Current status of this step */
  status: PipelineStepStatus;

  /** The step's output data (type varies by step) */
  data?: T;

  /** Execution time in milliseconds */
  duration?: number;

  /** Error message if step failed */
  error?: string;

  /** When this step started */
  startedAt?: Date;

  /** When this step completed */
  completedAt?: Date;
}

/**
 * Step 1 output: Classification result.
 */
export interface ClassificationStepData {
  classification: Classification;
  explanation: string;
  confidence: number; // 0-100 confidence score
}

/**
 * Step 2 output: Pattern detection result.
 */
export interface PatternDetectionStepData {
  patterns: DetectedPattern[];
  summary: string;
}

/**
 * Step 3 output: Risk assessment result.
 */
export interface RiskAssessmentStepData {
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  overallScore: number; // 0-100, higher = more risky
}

/**
 * Step 4 output: Suggestions result.
 */
export interface SuggestionsStepData {
  suggestions: Suggestion[];
  summary: string;
}

/**
 * Step 5 output: Code examples result.
 */
export interface ExamplesStepData {
  clientExample?: string;
  serverExample?: string;
  refactoredExample?: string;
  explanation: string;
}

/**
 * Complete pipeline results containing all step outputs.
 * This is stored as JSON in the database.
 */
export interface PipelineResults {
  /** Step 1: Classification */
  classification: PipelineStepResult<ClassificationStepData>;

  /** Step 2: Pattern Detection */
  patternDetection: PipelineStepResult<PatternDetectionStepData>;

  /** Step 3: Risk Assessment */
  riskAssessment: PipelineStepResult<RiskAssessmentStepData>;

  /** Step 4: Suggestions */
  suggestions: PipelineStepResult<SuggestionsStepData>;

  /** Step 5: Examples */
  examples: PipelineStepResult<ExamplesStepData>;

  /** Overall pipeline metadata */
  metadata: {
    /** Total execution time in milliseconds */
    totalDuration: number;

    /** Number of steps completed successfully */
    stepsCompleted: number;

    /** Analysis depth used */
    analysisDepth: AnalysisDepth;

    /** When pipeline started */
    startedAt: Date;

    /** When pipeline finished */
    completedAt: Date;
  };
}

// =============================================================================
// 3. PATTERN TYPES
// =============================================================================
// Patterns represent specific code constructs that affect boundary placement.
// These are detected during Step 2 of the pipeline.
// =============================================================================

/**
 * Types of patterns that can be detected in code.
 */
export type PatternType =
  | 'hook'          // React hooks (useState, useEffect, etc.)
  | 'browser-api'   // Browser globals (window, document, localStorage)
  | 'node-api'      // Node.js APIs (fs, path, process)
  | 'directive'     // Next.js directives ("use client", "use server")
  | 'import'        // Environment-specific imports
  | 'event-handler' // Browser event handlers (onClick, onChange)
  | 'database'      // Database access patterns
  | 'fetch'         // Data fetching patterns
  | 'other';        // Catch-all for other patterns

/**
 * A single detected pattern in the analyzed code.
 */
export interface DetectedPattern {
  /** Type of pattern detected */
  type: PatternType;

  /** Name/identifier of the pattern (e.g., "useState", "window") */
  name: string;

  /** Line number where pattern was found (1-indexed) */
  line?: number;

  /** Column number where pattern starts */
  column?: number;

  /** Which environment this pattern is associated with */
  environment: 'client' | 'server' | 'both';

  /** Brief description of why this pattern matters */
  description?: string;

  /** Risk contribution of this pattern */
  riskContribution?: RiskLevel;
}

/**
 * A factor contributing to the overall risk assessment.
 */
export interface RiskFactor {
  /** Name of the risk factor */
  name: string;

  /** Description of the risk */
  description: string;

  /** Severity of this factor */
  severity: RiskLevel;

  /** Patterns that contribute to this risk */
  relatedPatterns: string[];
}

/**
 * A refactoring suggestion for the analyzed code.
 */
export interface Suggestion {
  /** Short title for the suggestion */
  title: string;

  /** Detailed description of the issue */
  issue: string;

  /** How to fix the issue */
  recommendation: string;

  /** Priority level (1 = highest priority) */
  priority: number;

  /** Which patterns this suggestion addresses */
  relatedPatterns?: string[];

  /** Code snippet showing the fix (optional) */
  codeExample?: string;
}

// =============================================================================
// 4. CONFIGURATION TYPES
// =============================================================================
// User-configurable settings that affect analysis behavior.
// These are stored in the UserConfig table and can be modified via the UI.
// =============================================================================

/**
 * Analysis depth options.
 * Controls how thorough and detailed the analysis is.
 */
export type AnalysisDepth = 'quick' | 'standard' | 'comprehensive';

/**
 * Framework mode options.
 * Different Next.js versions have different boundary rules.
 */
export type FrameworkMode = 'app-router' | 'pages-router';

/**
 * Strictness level options.
 * Controls how aggressively violations are flagged.
 */
export type StrictnessLevel = 'lenient' | 'standard' | 'strict';

/**
 * Complete user configuration object.
 */
export interface UserConfig {
  /** Unique identifier (always "default" in this version) */
  id: string;

  /** Default analysis depth for new analyses */
  analysisDepth: AnalysisDepth;

  /** Target framework mode */
  frameworkMode: FrameworkMode;

  /** Boundary checking strictness */
  strictnessLevel: StrictnessLevel;

  /** When config was last updated */
  updatedAt: Date;
}

/**
 * Input type for updating user configuration.
 * All fields are optional - only specified fields are updated.
 */
export interface UserConfigUpdate {
  analysisDepth?: AnalysisDepth;
  frameworkMode?: FrameworkMode;
  strictnessLevel?: StrictnessLevel;
}

// =============================================================================
// 5. ANALYTICS TYPES
// =============================================================================
// Types for the analytics dashboard and metrics tracking.
// =============================================================================

/**
 * Types of events tracked for analytics.
 */
export type AnalyticsEventType =
  | 'analysis'        // A single analysis was performed
  | 'batch_start'     // A batch analysis started
  | 'batch_complete'  // A batch analysis completed
  | 'config_change'   // User changed settings
  | 'export';         // User exported results

/**
 * A single analytics event.
 */
export interface AnalyticsEvent {
  id: string;
  createdAt: Date;
  eventType: AnalyticsEventType;
  data: Record<string, unknown>;
}

/**
 * Summary statistics for the analytics dashboard.
 */
export interface AnalyticsSummary {
  /** Total number of analyses performed */
  totalAnalyses: number;

  /** Breakdown by classification type */
  classificationBreakdown: {
    clientOnly: number;
    serverOnly: number;
    both: number;
  };

  /** Breakdown by risk level */
  riskBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  /** Most commonly detected patterns */
  topPatterns: Array<{
    name: string;
    type: PatternType;
    count: number;
  }>;

  /** Analyses over time (for charting) */
  timeSeriesData: Array<{
    date: string;
    count: number;
  }>;

  /** Average analysis time in milliseconds */
  averageAnalysisTime: number;
}

// =============================================================================
// 6. EXPORT TYPES
// =============================================================================
// Types for exporting analysis results in various formats.
// =============================================================================

/**
 * Supported export formats.
 */
export type ExportFormat = 'markdown' | 'json' | 'csv';

/**
 * Options for export operations.
 */
export interface ExportOptions {
  /** Format to export in */
  format: ExportFormat;

  /** Include code in export */
  includeCode: boolean;

  /** Include pipeline details */
  includePipelineDetails: boolean;

  /** Include suggestions */
  includeSuggestions: boolean;

  /** IDs of analyses to export (empty = all) */
  analysisIds?: string[];
}

/**
 * Result of an export operation.
 */
export interface ExportResult {
  /** The exported content */
  content: string;

  /** Suggested filename */
  filename: string;

  /** MIME type for download */
  mimeType: string;

  /** Number of analyses included */
  analysisCount: number;
}

// =============================================================================
// 7. BATCH ANALYSIS TYPES
// =============================================================================
// Types for batch analysis operations.
// =============================================================================

/**
 * Status of a batch analysis operation.
 */
export type BatchStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled';

/**
 * A single item in a batch analysis.
 */
export interface BatchItem {
  /** Index in the batch (0-based) */
  index: number;

  /** The code snippet to analyze */
  code: string;

  /** Optional label/name for this snippet */
  label?: string;

  /** Current status of this item */
  status: BatchStatus;

  /** Result if completed */
  result?: ClassificationResult;

  /** Error if failed */
  error?: string;
}

/**
 * Complete batch analysis state.
 */
export interface BatchAnalysis {
  /** Unique batch identifier */
  id: string;

  /** All items in the batch */
  items: BatchItem[];

  /** Overall batch status */
  status: BatchStatus;

  /** Number of items completed */
  completedCount: number;

  /** Number of items that failed */
  errorCount: number;

  /** When batch started */
  startedAt?: Date;

  /** When batch completed */
  completedAt?: Date;

  /** Summary statistics */
  summary?: {
    clientOnly: number;
    serverOnly: number;
    both: number;
    averageRisk: number;
  };
}

// =============================================================================
// 8. UI COMPONENT TYPES
// =============================================================================
// Prop types for React components.
// =============================================================================

/**
 * Configuration for classification display styling.
 */
export interface ClassificationConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconPath: string;
}

/**
 * Props for components that display classification results.
 */
export interface ClassificationDisplayProps {
  classification: Classification;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Tab configuration for main navigation.
 */
export interface TabConfig {
  id: string;
  label: string;
  iconPath: string;
}

// =============================================================================
// PIPELINE RESULT (SIMPLIFIED)
// =============================================================================
// A simpler pipeline result structure for component use.
// This is different from PipelineResults which stores full step data.
// =============================================================================

/**
 * Simplified step for UI display.
 */
export interface SimplePipelineStep {
  stepName: string;
  status: PipelineStepStatus;
  duration?: number;
  error?: string;
  result?: unknown;
}

/**
 * Simplified pipeline result for component use.
 * Used by CodeEditor, MainContent, and other UI components.
 */
export interface PipelineResult {
  /** List of executed steps */
  steps: SimplePipelineStep[];

  /** Total duration in milliseconds */
  totalDuration: number;

  /** Final classification result */
  finalClassification: Classification;

  /** Final explanation */
  finalExplanation: string;
}
