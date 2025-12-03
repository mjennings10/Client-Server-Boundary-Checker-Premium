// =============================================================================
// EXPORT PANEL COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Provides export functionality for analysis results.
// Supports multiple formats: Markdown, JSON, CSV.
//
// FEATURES:
// - Format selection (MD, JSON, CSV)
// - Include/exclude options (code, details, suggestions)
// - Download generated file
// - Copy to clipboard
//
// EXPORT FORMATS:
// - Markdown: Human-readable document with formatting
// - JSON: Machine-readable structured data
// - CSV: Spreadsheet-compatible data
// =============================================================================

'use client';

import { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Switch, LabeledSwitch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { exportHistory } from '@/app/actions';
import type { ExportFormat, ExportResult } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface ExportPanelProps {
  /** Optional: Specific analysis IDs to export (empty = all) */
  analysisIds?: string[];
  /** Callback when export completes */
  onExportComplete?: (result: ExportResult) => void;
}

// =============================================================================
// EXPORT PANEL COMPONENT
// =============================================================================

export default function ExportPanel({ analysisIds, onExportComplete }: ExportPanelProps) {
  // ===========================================================================
  // STATE
  // ===========================================================================

  // Export options
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [includeCode, setIncludeCode] = useState(true);
  const [includePipelineDetails, setIncludePipelineDetails] = useState(true);
  const [includeSuggestions, setIncludeSuggestions] = useState(true);

  // Export state
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  /**
   * Initiates the export process.
   */
  const handleExport = () => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const exportResult = await exportHistory({
          format,
          includeCode,
          includePipelineDetails,
          includeSuggestions,
          analysisIds,
        });

        setResult(exportResult);
        onExportComplete?.(exportResult);
      } catch (err) {
        setError('Failed to generate export. Please try again.');
        console.error('Export error:', err);
      }
    });
  };

  /**
   * Downloads the exported file.
   */
  const handleDownload = () => {
    if (!result) return;

    // Create blob and download link
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Copies export content to clipboard.
   */
  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* Export icon */}
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Export Results
        </CardTitle>
        <CardDescription>
          Export your analysis history in various formats
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Export Format</label>
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">
                <div className="flex items-center gap-2">
                  <span>Markdown (.md)</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <span>JSON (.json)</span>
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <span>CSV (.csv)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Options */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-200">Include in Export</label>

          <LabeledSwitch
            label="Code Snippets"
            description="Include the original code in the export"
            checked={includeCode}
            onCheckedChange={setIncludeCode}
          />

          <LabeledSwitch
            label="Pipeline Details"
            description="Include pattern detection and timing data"
            checked={includePipelineDetails}
            onCheckedChange={setIncludePipelineDetails}
            disabled={format === 'csv'}
          />

          <LabeledSwitch
            label="Suggestions"
            description="Include refactoring suggestions"
            checked={includeSuggestions}
            onCheckedChange={setIncludeSuggestions}
            disabled={format === 'csv'}
          />
        </div>

        {/* Error Display */}
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

        {/* Result Preview */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Generated: {result.filename}
              </span>
              <span className="text-gray-500">
                {result.analysisCount} analyses
              </span>
            </div>

            {/* Preview box */}
            <div className="relative">
              <pre className="p-4 bg-gray-800 rounded-lg text-xs overflow-auto max-h-48 font-mono text-gray-300">
                {result.content.slice(0, 500)}
                {result.content.length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!result ? (
          <Button
            onClick={handleExport}
            disabled={isPending}
            isLoading={isPending}
            className="flex-1"
          >
            Generate Export
          </Button>
        ) : (
          <>
            <Button onClick={handleDownload} className="flex-1">
              <svg
                className="h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg
                    className="h-4 w-4 mr-2 text-green-400"
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
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setResult(null)}>
              New Export
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
