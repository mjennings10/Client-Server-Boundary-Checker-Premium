// =============================================================================
// ANALYSIS PIPELINE - Client/Server Boundary Checker Premium
// =============================================================================
// This file implements the multi-step analysis pipeline that powers the
// premium version of the boundary checker.
//
// PIPELINE OVERVIEW:
// The pipeline consists of 5 sequential steps, each building on the previous:
//
// Step 1: CLASSIFICATION
//         Basic boundary classification (client-only/server-only/both)
//         This is the core functionality from the base version.
//
// Step 2: PATTERN DETECTION
//         Identify specific APIs, hooks, and patterns in the code
//         Uses regex-based static analysis (see patterns.ts)
//
// Step 3: RISK ASSESSMENT
//         Evaluate the risk level based on detected patterns
//         Consider pattern combinations and severity
//
// Step 4: SUGGESTIONS
//         Generate AI-powered refactoring suggestions
//         Help developers fix boundary violations
//
// Step 5: EXAMPLES
//         Provide code examples showing proper implementations
//         Educational value for learning boundaries
//
// ANALYSIS DEPTH MODES:
// - quick: Steps 1-2 only (fast, basic)
// - standard: Steps 1-4 (balanced, most common)
// - comprehensive: All 5 steps (thorough, more API calls)
//
// ARCHITECTURE DECISIONS:
// - Each step is independent and can fail without breaking others
// - Pipeline state is tracked for progress visualization
// - Results are cached in the database for future reference
// =============================================================================

import { getOpenAI } from './openai';
import { detectPatterns, generatePatternSummary, calculateRiskLevel } from './patterns';
import type {
  AnalysisDepth,
  Classification,
  PipelineResults,
  PipelineStepResult,
  ClassificationStepData,
  PatternDetectionStepData,
  RiskAssessmentStepData,
  SuggestionsStepData,
  ExamplesStepData,
  DetectedPattern,
  RiskFactor,
  Suggestion,
  StrictnessLevel,
  FrameworkMode,
} from '@/types';

// =============================================================================
// PIPELINE CONFIGURATION
// =============================================================================

/**
 * Configuration for the analysis pipeline.
 * These settings affect how the analysis is performed.
 */
export interface PipelineConfig {
  /** How thorough the analysis should be */
  analysisDepth: AnalysisDepth;

  /** Target framework mode */
  frameworkMode: FrameworkMode;

  /** How strict the boundary checking should be */
  strictnessLevel: StrictnessLevel;
}

/**
 * Default pipeline configuration.
 * Used when no config is provided.
 */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  analysisDepth: 'standard',
  frameworkMode: 'app-router',
  strictnessLevel: 'standard',
};

// =============================================================================
// PIPELINE EXECUTION
// =============================================================================

/**
 * Executes the full analysis pipeline on the given code.
 * Returns comprehensive results including all step outputs.
 *
 * EXECUTION FLOW:
 * 1. Initialize pipeline state with all steps pending
 * 2. Execute Step 1: Classification (always runs)
 * 3. Execute Step 2: Pattern Detection (always runs)
 * 4. Execute Step 3: Risk Assessment (standard+ depth)
 * 5. Execute Step 4: Suggestions (standard+ depth)
 * 6. Execute Step 5: Examples (comprehensive depth only)
 * 7. Calculate final metadata and return
 *
 * @param code - The code to analyze
 * @param config - Pipeline configuration
 * @returns Complete pipeline results
 */
export async function executePipeline(
  code: string,
  config: PipelineConfig = DEFAULT_PIPELINE_CONFIG
): Promise<PipelineResults> {
  // Track overall timing
  const pipelineStartTime = Date.now();

  // Initialize all steps as pending
  const results: PipelineResults = {
    classification: { status: 'pending' },
    patternDetection: { status: 'pending' },
    riskAssessment: { status: 'pending' },
    suggestions: { status: 'pending' },
    examples: { status: 'pending' },
    metadata: {
      totalDuration: 0,
      stepsCompleted: 0,
      analysisDepth: config.analysisDepth,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  };

  // ===========================================================================
  // STEP 1: CLASSIFICATION
  // ===========================================================================
  // Always runs - this is the core functionality
  // ===========================================================================

  results.classification = await executeClassificationStep(code, config);
  if (results.classification.status === 'completed') {
    results.metadata.stepsCompleted++;
  }

  // ===========================================================================
  // STEP 2: PATTERN DETECTION
  // ===========================================================================
  // Always runs - provides detailed pattern information
  // ===========================================================================

  results.patternDetection = await executePatternDetectionStep(code);
  if (results.patternDetection.status === 'completed') {
    results.metadata.stepsCompleted++;
  }

  // ===========================================================================
  // STEP 3: RISK ASSESSMENT
  // ===========================================================================
  // Runs for standard and comprehensive depth
  // Skipped for quick depth to save time
  // ===========================================================================

  if (config.analysisDepth === 'quick') {
    results.riskAssessment = { status: 'skipped' };
  } else {
    const patterns = results.patternDetection.data?.patterns || [];
    results.riskAssessment = await executeRiskAssessmentStep(
      patterns,
      config.strictnessLevel
    );
    if (results.riskAssessment.status === 'completed') {
      results.metadata.stepsCompleted++;
    }
  }

  // ===========================================================================
  // STEP 4: SUGGESTIONS
  // ===========================================================================
  // Runs for standard and comprehensive depth
  // Uses AI to generate refactoring suggestions
  // ===========================================================================

  if (config.analysisDepth === 'quick') {
    results.suggestions = { status: 'skipped' };
  } else {
    const classification = results.classification.data?.classification;
    const patterns = results.patternDetection.data?.patterns || [];
    const riskLevel = results.riskAssessment.data?.riskLevel;

    results.suggestions = await executeSuggestionsStep(
      code,
      classification,
      patterns,
      riskLevel
    );
    if (results.suggestions.status === 'completed') {
      results.metadata.stepsCompleted++;
    }
  }

  // ===========================================================================
  // STEP 5: EXAMPLES
  // ===========================================================================
  // Only runs for comprehensive depth
  // Generates example code for educational purposes
  // ===========================================================================

  if (config.analysisDepth !== 'comprehensive') {
    results.examples = { status: 'skipped' };
  } else {
    const classification = results.classification.data?.classification;
    results.examples = await executeExamplesStep(code, classification);
    if (results.examples.status === 'completed') {
      results.metadata.stepsCompleted++;
    }
  }

  // ===========================================================================
  // FINALIZE METADATA
  // ===========================================================================

  results.metadata.totalDuration = Date.now() - pipelineStartTime;
  results.metadata.completedAt = new Date();

  return results;
}

// =============================================================================
// STEP 1: CLASSIFICATION
// =============================================================================

/**
 * Executes the classification step using the OpenAI API.
 * This is the core boundary analysis functionality.
 *
 * @param code - The code to classify
 * @param config - Pipeline configuration
 * @returns Classification step result
 */
async function executeClassificationStep(
  code: string,
  config: PipelineConfig
): Promise<PipelineStepResult<ClassificationStepData>> {
  const startTime = Date.now();

  try {
    // Build the system prompt based on framework mode
    const systemPrompt = buildClassificationPrompt(config.frameworkMode);

    // Call OpenAI API
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this code and classify it:\n\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        status: 'error',
        error: 'No response from AI model',
        duration: Date.now() - startTime,
      };
    }

    // Parse the response
    const parsed = JSON.parse(content) as {
      classification: string;
      explanation: string;
      confidence?: number;
    };

    // Validate classification
    const validClassifications = ['client-only', 'server-only', 'both'];
    if (!validClassifications.includes(parsed.classification)) {
      return {
        status: 'error',
        error: `Invalid classification: ${parsed.classification}`,
        duration: Date.now() - startTime,
      };
    }

    return {
      status: 'completed',
      data: {
        classification: parsed.classification as Classification,
        explanation: parsed.explanation,
        confidence: parsed.confidence ?? 85,
      },
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Classification failed',
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Builds the system prompt for classification based on framework mode.
 *
 * @param frameworkMode - The target framework mode
 * @returns System prompt string
 */
function buildClassificationPrompt(frameworkMode: FrameworkMode): string {
  const basePrompt = `You are an expert at analyzing JavaScript/TypeScript code for Next.js applications. Your job is to classify code snippets based on where they can safely run: on the client, on the server, or both.

## Framework Mode: ${frameworkMode === 'app-router' ? 'Next.js App Router' : 'Next.js Pages Router'}

${
  frameworkMode === 'app-router'
    ? `
### App Router Rules
- Components are Server Components by default
- Use "use client" directive for Client Components
- Use "use server" directive for Server Actions
- Server Components can directly access server resources
- Client Components cannot access server resources directly
`
    : `
### Pages Router Rules
- Pages are rendered on both server and client (SSR + hydration)
- Use getServerSideProps/getStaticProps for server-only data fetching
- Use useEffect for client-only side effects
- Be careful with code that runs during SSR
`
}

## Classification Rules

Classify as "client-only" when the code:
- Uses window, document, localStorage, or other browser globals
- Uses React hooks (useState, useEffect, useReducer, etc.)
- Has "use client" directive
- Uses browser event handlers (onClick, onChange, etc.)

Classify as "server-only" when the code:
- Uses fs, path, process.env, or other Node.js modules
- Uses "use server" directive
- Directly accesses databases
- Uses next/headers (headers, cookies)

Classify as "both" (safe for both environments) when the code:
- Contains only pure functions
- Only uses type definitions
- Uses environment-agnostic utilities

## Output Format

Respond with ONLY valid JSON:
{
  "classification": "client-only" | "server-only" | "both",
  "explanation": "Clear explanation referencing specific patterns found",
  "confidence": 0-100
}`;

  return basePrompt;
}

// =============================================================================
// STEP 2: PATTERN DETECTION
// =============================================================================

/**
 * Executes the pattern detection step using static analysis.
 * This step does not use the AI - it's purely regex-based.
 *
 * @param code - The code to analyze
 * @returns Pattern detection step result
 */
async function executePatternDetectionStep(
  code: string
): Promise<PipelineStepResult<PatternDetectionStepData>> {
  const startTime = Date.now();

  try {
    // Detect patterns using the patterns utility
    const patterns = detectPatterns(code);

    // Generate a human-readable summary
    const summary = generatePatternSummary(patterns);

    return {
      status: 'completed',
      data: {
        patterns,
        summary,
      },
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Pattern detection failed',
      duration: Date.now() - startTime,
    };
  }
}

// =============================================================================
// STEP 3: RISK ASSESSMENT
// =============================================================================

/**
 * Executes the risk assessment step.
 * Analyzes detected patterns to determine overall risk level.
 *
 * @param patterns - Detected patterns from Step 2
 * @param strictnessLevel - How strict the assessment should be
 * @returns Risk assessment step result
 */
async function executeRiskAssessmentStep(
  patterns: DetectedPattern[],
  strictnessLevel: StrictnessLevel
): Promise<PipelineStepResult<RiskAssessmentStepData>> {
  const startTime = Date.now();

  try {
    // Calculate base risk level from patterns
    let riskLevel = calculateRiskLevel(patterns);

    // Adjust based on strictness level
    if (strictnessLevel === 'lenient' && riskLevel === 'medium') {
      riskLevel = 'low';
    } else if (strictnessLevel === 'strict' && riskLevel === 'low') {
      // In strict mode, any patterns at all increase risk
      if (patterns.length > 0) {
        riskLevel = 'medium';
      }
    }

    // Build risk factors list
    const factors: RiskFactor[] = buildRiskFactors(patterns);

    // Calculate overall score (0-100, higher = more risky)
    const overallScore = calculateRiskScore(patterns, strictnessLevel);

    return {
      status: 'completed',
      data: {
        riskLevel,
        factors,
        overallScore,
      },
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Risk assessment failed',
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Builds a list of risk factors based on detected patterns.
 *
 * @param patterns - Detected patterns
 * @returns Array of risk factors
 */
function buildRiskFactors(patterns: DetectedPattern[]): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Check for mixed environment patterns
  const clientPatterns = patterns.filter((p) => p.environment === 'client');
  const serverPatterns = patterns.filter((p) => p.environment === 'server');

  if (clientPatterns.length > 0 && serverPatterns.length > 0) {
    factors.push({
      name: 'Mixed Environment APIs',
      description:
        'Code contains both client-only and server-only APIs, which cannot coexist in the same file without proper separation.',
      severity: 'critical',
      relatedPatterns: [
        ...clientPatterns.map((p) => p.name),
        ...serverPatterns.map((p) => p.name),
      ],
    });
  }

  // Check for browser globals without client directive
  const browserGlobals = patterns.filter((p) => p.type === 'browser-api');
  if (browserGlobals.length > 0) {
    const hasClientDirective = patterns.some(
      (p) => p.type === 'directive' && p.name === 'use client'
    );
    if (!hasClientDirective) {
      factors.push({
        name: 'Browser APIs Without Client Directive',
        description:
          'Browser globals are used but "use client" directive is missing. This will cause errors in Server Components.',
        severity: 'high',
        relatedPatterns: browserGlobals.map((p) => p.name),
      });
    }
  }

  // Check for hooks without client directive
  const hooks = patterns.filter((p) => p.type === 'hook');
  if (hooks.length > 0) {
    const hasClientDirective = patterns.some(
      (p) => p.type === 'directive' && p.name === 'use client'
    );
    if (!hasClientDirective) {
      factors.push({
        name: 'React Hooks Without Client Directive',
        description:
          'React hooks require client-side rendering. Add "use client" directive to the file.',
        severity: 'high',
        relatedPatterns: hooks.map((p) => p.name),
      });
    }
  }

  // Check for database access
  const dbPatterns = patterns.filter((p) => p.type === 'database');
  if (dbPatterns.length > 0) {
    factors.push({
      name: 'Direct Database Access',
      description:
        'Database operations must run on the server. Ensure this code is in a Server Component or Server Action.',
      severity: 'high',
      relatedPatterns: dbPatterns.map((p) => p.name),
    });
  }

  return factors;
}

/**
 * Calculates a numerical risk score based on patterns.
 *
 * SCORING ALGORITHM:
 * - Start at 0 (no risk)
 * - Add points for each pattern based on risk contribution
 * - Multiply by strictness factor
 * - Cap at 100
 *
 * @param patterns - Detected patterns
 * @param strictnessLevel - Strictness level for scoring
 * @returns Risk score 0-100
 */
function calculateRiskScore(
  patterns: DetectedPattern[],
  strictnessLevel: StrictnessLevel
): number {
  const riskPoints: Record<string, number> = {
    low: 5,
    medium: 15,
    high: 30,
    critical: 50,
  };

  const strictnessMultiplier: Record<StrictnessLevel, number> = {
    lenient: 0.7,
    standard: 1.0,
    strict: 1.5,
  };

  let score = 0;
  for (const pattern of patterns) {
    const contribution = pattern.riskContribution || 'low';
    score += riskPoints[contribution];
  }

  // Apply strictness multiplier
  score *= strictnessMultiplier[strictnessLevel];

  // Cap at 100
  return Math.min(100, Math.round(score));
}

// =============================================================================
// STEP 4: SUGGESTIONS
// =============================================================================

/**
 * Executes the suggestions step using AI.
 * Generates refactoring suggestions based on the analysis.
 *
 * @param code - The original code
 * @param classification - The classification result
 * @param patterns - Detected patterns
 * @param riskLevel - Assessed risk level
 * @returns Suggestions step result
 */
async function executeSuggestionsStep(
  code: string,
  classification: Classification | undefined,
  patterns: DetectedPattern[],
  riskLevel: string | undefined
): Promise<PipelineStepResult<SuggestionsStepData>> {
  const startTime = Date.now();

  // If no issues to fix, skip suggestions
  if (patterns.length === 0 || riskLevel === 'low') {
    return {
      status: 'completed',
      data: {
        suggestions: [],
        summary: 'No significant issues found. Code appears to be properly structured.',
      },
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  }

  try {
    // Build pattern summary for AI
    const patternSummary = patterns
      .map((p) => `- ${p.name} (${p.environment}, line ${p.line || 'unknown'})`)
      .join('\n');

    const prompt = `Given this ${classification} code with ${riskLevel} risk level:

\`\`\`
${code}
\`\`\`

Detected patterns:
${patternSummary}

Generate 2-4 specific refactoring suggestions to improve the code's boundary handling. Focus on practical, actionable advice.

Respond with JSON only:
{
  "suggestions": [
    {
      "title": "Short title",
      "issue": "What's wrong",
      "recommendation": "How to fix it",
      "priority": 1-4,
      "codeExample": "Optional code snippet showing the fix"
    }
  ],
  "summary": "Overall assessment"
}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a Next.js expert helping developers fix client/server boundary issues. Provide practical, specific suggestions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        status: 'error',
        error: 'No response from AI model',
        duration: Date.now() - startTime,
      };
    }

    const parsed = JSON.parse(content) as {
      suggestions: Suggestion[];
      summary: string;
    };

    return {
      status: 'completed',
      data: {
        suggestions: parsed.suggestions,
        summary: parsed.summary,
      },
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Suggestions generation failed',
      duration: Date.now() - startTime,
    };
  }
}

// =============================================================================
// STEP 5: EXAMPLES
// =============================================================================

/**
 * Executes the examples step using AI.
 * Generates code examples showing proper implementations.
 *
 * @param code - The original code
 * @param classification - The classification result
 * @returns Examples step result
 */
async function executeExamplesStep(
  code: string,
  classification: Classification | undefined
): Promise<PipelineStepResult<ExamplesStepData>> {
  const startTime = Date.now();

  try {
    const prompt = `Given this code classified as "${classification}":

\`\`\`
${code}
\`\`\`

Generate example code showing:
1. How this code should be structured as a proper Client Component (if applicable)
2. How this code could be refactored as a Server Component/Action (if applicable)
3. A refactored version that properly handles the boundary

Keep examples concise and focused on the boundary handling.

Respond with JSON only:
{
  "clientExample": "Code showing client component version (or null)",
  "serverExample": "Code showing server component/action version (or null)",
  "refactoredExample": "Improved version of the code (or null)",
  "explanation": "Brief explanation of the examples"
}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a Next.js expert providing code examples. Keep examples minimal and focused.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        status: 'error',
        error: 'No response from AI model',
        duration: Date.now() - startTime,
      };
    }

    const parsed = JSON.parse(content) as ExamplesStepData;

    return {
      status: 'completed',
      data: parsed,
      duration: Date.now() - startTime,
      startedAt: new Date(startTime),
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Examples generation failed',
      duration: Date.now() - startTime,
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extracts the final classification from pipeline results.
 * Convenience function for getting just the classification.
 *
 * @param results - Complete pipeline results
 * @returns Classification or null if not available
 */
export function getClassificationFromPipeline(
  results: PipelineResults
): Classification | null {
  if (
    results.classification.status === 'completed' &&
    results.classification.data
  ) {
    return results.classification.data.classification;
  }
  return null;
}

/**
 * Extracts patterns from pipeline results.
 *
 * @param results - Complete pipeline results
 * @returns Array of patterns or empty array
 */
export function getPatternsFromPipeline(
  results: PipelineResults
): DetectedPattern[] {
  if (
    results.patternDetection.status === 'completed' &&
    results.patternDetection.data
  ) {
    return results.patternDetection.data.patterns;
  }
  return [];
}

/**
 * Checks if the pipeline completed successfully.
 * A pipeline is successful if the classification step completed.
 *
 * @param results - Complete pipeline results
 * @returns True if successful
 */
export function isPipelineSuccessful(results: PipelineResults): boolean {
  return results.classification.status === 'completed';
}

/**
 * Gets the total number of steps that ran (not skipped).
 *
 * @param results - Complete pipeline results
 * @returns Number of steps that executed
 */
export function getExecutedStepsCount(results: PipelineResults): number {
  let count = 0;
  const steps = [
    results.classification,
    results.patternDetection,
    results.riskAssessment,
    results.suggestions,
    results.examples,
  ];

  for (const step of steps) {
    if (step.status !== 'skipped' && step.status !== 'pending') {
      count++;
    }
  }

  return count;
}
