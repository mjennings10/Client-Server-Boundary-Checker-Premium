// =============================================================================
// HISTORY SERVER ACTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains server actions for managing analysis history.
//
// KEY ACTIONS:
// - getHistory: Fetch recent analyses with pagination
// - deleteAnalysis: Remove a specific analysis
// - clearHistory: Clear all analyses
// - exportHistory: Export analyses in various formats
//
// ARCHITECTURE NOTES:
// - History is stored in the BoundaryCheck table
// - Supports pagination for large history lists
// - Export functionality supports multiple formats (MD, JSON, CSV)
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { prisma, recordAnalyticsEvent } from '@/lib/db';
import type {
  Classification,
  ClassificationResult,
  ExportFormat,
  ExportOptions,
  ExportResult,
  AnalysisDepth,
} from '@/types';

// =============================================================================
// HISTORY FETCHING
// =============================================================================

/**
 * Fetches analysis history with optional pagination.
 *
 * @param options - Pagination and filter options
 * @returns Array of classification results
 */
export async function getHistory(
  options: {
    take?: number;
    skip?: number;
    classification?: Classification;
  } = {}
): Promise<ClassificationResult[]> {
  const { take = 50, skip = 0, classification } = options;

  try {
    const checks = await prisma.boundaryCheck.findMany({
      where: classification ? { classification } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return checks.map((check) => ({
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
    }));
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
}

/**
 * Gets the total count of analyses in history.
 * Used for pagination UI.
 *
 * @returns Total count of analyses
 */
export async function getHistoryCount(): Promise<number> {
  try {
    return await prisma.boundaryCheck.count();
  } catch (error) {
    console.error('Failed to count history:', error);
    return 0;
  }
}

// =============================================================================
// HISTORY MANAGEMENT
// =============================================================================

/**
 * Deletes a specific analysis from history.
 *
 * @param id - The analysis ID to delete
 * @returns Success status
 */
export async function deleteAnalysis(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.boundaryCheck.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete analysis:', error);
    return { success: false };
  }
}

/**
 * Clears all analyses from history.
 * Use with caution - this is irreversible!
 *
 * @returns Number of deleted analyses
 */
export async function clearHistory(): Promise<{ deleted: number }> {
  try {
    const result = await prisma.boundaryCheck.deleteMany({});

    revalidatePath('/');
    return { deleted: result.count };
  } catch (error) {
    console.error('Failed to clear history:', error);
    return { deleted: 0 };
  }
}

// =============================================================================
// EXPORT FUNCTIONALITY
// =============================================================================

/**
 * Exports analysis history in the specified format.
 *
 * SUPPORTED FORMATS:
 * - markdown: Human-readable Markdown document
 * - json: Machine-readable JSON array
 * - csv: Spreadsheet-compatible CSV
 *
 * @param options - Export configuration
 * @returns Export result with content and metadata
 */
export async function exportHistory(
  options: ExportOptions
): Promise<ExportResult> {
  const { format, includeCode, includePipelineDetails, includeSuggestions, analysisIds } =
    options;

  // Fetch analyses to export
  const whereClause = analysisIds?.length
    ? { id: { in: analysisIds } }
    : undefined;

  const analyses = await prisma.boundaryCheck.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  // Record export event for analytics
  await recordAnalyticsEvent('export', {
    format,
    count: analyses.length,
    includeCode,
    includePipelineDetails,
  });

  // Generate export based on format
  switch (format) {
    case 'markdown':
      return generateMarkdownExport(analyses, {
        includeCode,
        includePipelineDetails,
        includeSuggestions,
      });

    case 'json':
      return generateJsonExport(analyses, {
        includeCode,
        includePipelineDetails,
        includeSuggestions,
      });

    case 'csv':
      return generateCsvExport(analyses);

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// =============================================================================
// EXPORT FORMAT GENERATORS
// =============================================================================

interface ExportGeneratorOptions {
  includeCode: boolean;
  includePipelineDetails: boolean;
  includeSuggestions: boolean;
}

/**
 * Generates a Markdown export of analyses.
 * Creates a well-formatted document suitable for documentation.
 */
function generateMarkdownExport(
  analyses: Array<{
    id: string;
    createdAt: Date;
    code: string;
    classification: string;
    explanation: string;
    riskLevel: string | null;
    patterns: string | null;
    suggestions: string | null;
    pipelineResults: string | null;
  }>,
  options: ExportGeneratorOptions
): ExportResult {
  const lines: string[] = [];

  // Header
  lines.push('# Boundary Analysis Export');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total Analyses: ${analyses.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Summary statistics
  const stats = {
    clientOnly: analyses.filter((a) => a.classification === 'client-only').length,
    serverOnly: analyses.filter((a) => a.classification === 'server-only').length,
    both: analyses.filter((a) => a.classification === 'both').length,
  };

  lines.push('## Summary');
  lines.push('');
  lines.push(`- Client-Only: ${stats.clientOnly}`);
  lines.push(`- Server-Only: ${stats.serverOnly}`);
  lines.push(`- Both Safe: ${stats.both}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Individual analyses
  lines.push('## Analyses');
  lines.push('');

  for (const analysis of analyses) {
    lines.push(`### Analysis ${analysis.id.slice(0, 8)}`);
    lines.push('');
    lines.push(`**Classification:** ${analysis.classification}`);
    lines.push(`**Risk Level:** ${analysis.riskLevel || 'N/A'}`);
    lines.push(`**Date:** ${analysis.createdAt.toISOString()}`);
    lines.push('');

    if (options.includeCode) {
      lines.push('**Code:**');
      lines.push('```typescript');
      lines.push(analysis.code);
      lines.push('```');
      lines.push('');
    }

    lines.push('**Explanation:**');
    lines.push(analysis.explanation);
    lines.push('');

    if (options.includePipelineDetails && analysis.patterns) {
      try {
        const patterns = JSON.parse(analysis.patterns);
        if (patterns.length > 0) {
          lines.push('**Detected Patterns:**');
          for (const pattern of patterns) {
            lines.push(`- ${pattern.name} (${pattern.environment})`);
          }
          lines.push('');
        }
      } catch {
        // Skip invalid pattern data
      }
    }

    if (options.includeSuggestions && analysis.suggestions) {
      try {
        const suggestions = JSON.parse(analysis.suggestions);
        if (suggestions.length > 0) {
          lines.push('**Suggestions:**');
          for (const suggestion of suggestions) {
            lines.push(`- **${suggestion.title}:** ${suggestion.recommendation}`);
          }
          lines.push('');
        }
      } catch {
        // Skip invalid suggestion data
      }
    }

    lines.push('---');
    lines.push('');
  }

  const content = lines.join('\n');

  return {
    content,
    filename: `boundary-analysis-export-${Date.now()}.md`,
    mimeType: 'text/markdown',
    analysisCount: analyses.length,
  };
}

/**
 * Generates a JSON export of analyses.
 * Suitable for programmatic consumption and data analysis.
 */
function generateJsonExport(
  analyses: Array<{
    id: string;
    createdAt: Date;
    code: string;
    classification: string;
    explanation: string;
    riskLevel: string | null;
    patterns: string | null;
    suggestions: string | null;
    pipelineResults: string | null;
    analysisDepth: string;
  }>,
  options: ExportGeneratorOptions
): ExportResult {
  const exportData = analyses.map((analysis) => {
    const base: Record<string, unknown> = {
      id: analysis.id,
      createdAt: analysis.createdAt.toISOString(),
      classification: analysis.classification,
      explanation: analysis.explanation,
      riskLevel: analysis.riskLevel,
      analysisDepth: analysis.analysisDepth,
    };

    if (options.includeCode) {
      base.code = analysis.code;
    }

    if (options.includePipelineDetails) {
      if (analysis.patterns) {
        try {
          base.patterns = JSON.parse(analysis.patterns);
        } catch {
          base.patterns = [];
        }
      }
      if (analysis.pipelineResults) {
        try {
          base.pipelineResults = JSON.parse(analysis.pipelineResults);
        } catch {
          base.pipelineResults = null;
        }
      }
    }

    if (options.includeSuggestions && analysis.suggestions) {
      try {
        base.suggestions = JSON.parse(analysis.suggestions);
      } catch {
        base.suggestions = [];
      }
    }

    return base;
  });

  const content = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: analyses.length,
      analyses: exportData,
    },
    null,
    2
  );

  return {
    content,
    filename: `boundary-analysis-export-${Date.now()}.json`,
    mimeType: 'application/json',
    analysisCount: analyses.length,
  };
}

/**
 * Generates a CSV export of analyses.
 * Suitable for spreadsheet applications and simple data analysis.
 */
function generateCsvExport(
  analyses: Array<{
    id: string;
    createdAt: Date;
    code: string;
    classification: string;
    explanation: string;
    riskLevel: string | null;
  }>
): ExportResult {
  const headers = ['ID', 'Created At', 'Classification', 'Risk Level', 'Explanation'];
  const rows = [headers.join(',')];

  for (const analysis of analyses) {
    const row = [
      analysis.id,
      analysis.createdAt.toISOString(),
      analysis.classification,
      analysis.riskLevel || 'N/A',
      // Escape quotes and wrap in quotes for CSV safety
      `"${analysis.explanation.replace(/"/g, '""')}"`,
    ];
    rows.push(row.join(','));
  }

  const content = rows.join('\n');

  return {
    content,
    filename: `boundary-analysis-export-${Date.now()}.csv`,
    mimeType: 'text/csv',
    analysisCount: analyses.length,
  };
}
