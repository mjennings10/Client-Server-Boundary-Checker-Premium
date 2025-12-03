// =============================================================================
// CODE EDITOR COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Enhanced code editor with syntax highlighting using Prism.js.
// This is a major upgrade from the base version's plain textarea.
//
// PREMIUM FEATURES:
// - Syntax highlighting for TypeScript/JSX
// - Line numbers
// - Custom monospace font
// - Tab key indentation
// - Loading history items
// - Character count display
// - Integration with multi-step analysis pipeline
//
// ARCHITECTURE:
// The editor uses a dual-layer approach:
// 1. A hidden textarea for actual input
// 2. A visible highlighted overlay for display
// This provides both syntax highlighting and native text editing.
//
// PRISM.JS INTEGRATION:
// We use Prism.js for syntax highlighting. The library highlights code
// based on language grammar rules, producing colored HTML output.
// =============================================================================

'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import Prism from 'prismjs';
// Import Prism languages for TypeScript/JSX syntax highlighting
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import { classifyBoundaryPremium } from '@/app/actions';
import { Button } from './ui/button';
import type { ClassificationResult, PipelineResult, UserConfig } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface CodeEditorProps {
  /** Initial code to display in the editor */
  initialCode?: string;
  /** Callback when analysis starts */
  onAnalysisStart?: () => void;
  /** Callback when analysis completes */
  onAnalysisComplete?: (result: ClassificationResult, pipeline: PipelineResult) => void;
  /** User configuration for analysis settings */
  config?: UserConfig | null;
}

// =============================================================================
// CODE EDITOR COMPONENT
// =============================================================================

/**
 * CodeEditor - enhanced code input with syntax highlighting.
 *
 * USAGE:
 * <CodeEditor />
 * <CodeEditor initialCode="const x = 1;" />
 * <CodeEditor
 *   onAnalysisStart={() => setLoading(true)}
 *   onAnalysisComplete={(result, pipeline) => handleResult(result, pipeline)}
 *   config={userConfig}
 * />
 */
export default function CodeEditor({
  initialCode = '',
  onAnalysisStart,
  onAnalysisComplete,
  config,
}: CodeEditorProps) {
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  // Code input state
  const [code, setCode] = useState(initialCode);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Loading state for async operations
  const [isPending, startTransition] = useTransition();

  // Highlighted HTML output
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  // Refs for synchronized scrolling
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // ===========================================================================
  // SYNTAX HIGHLIGHTING
  // ===========================================================================

  /**
   * Updates syntax highlighting when code changes.
   * Uses Prism.js to convert code to highlighted HTML.
   */
  useEffect(() => {
    // Ensure Prism.languages.tsx exists, fallback to typescript if not
    const grammar = Prism.languages.tsx || Prism.languages.typescript || Prism.languages.javascript;
    const highlighted = Prism.highlight(
      code || ' ', // Space prevents empty content issues
      grammar,
      'tsx'
    );
    setHighlightedCode(highlighted);
  }, [code]);

  // ===========================================================================
  // SCROLL SYNCHRONIZATION
  // ===========================================================================

  /**
   * Synchronizes scroll position between textarea and highlight overlay.
   * This creates the illusion of editing highlighted code directly.
   */
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // ===========================================================================
  // ANALYSIS SUBMISSION
  // ===========================================================================

  /**
   * Submits code for boundary analysis using the premium pipeline.
   * Uses server action for AI-powered multi-step classification.
   */
  const handleSubmit = () => {
    // Validate input
    if (!code.trim()) {
      setError('Please enter some code to analyze.');
      return;
    }

    // Clear previous state
    setError(null);

    // Notify parent that analysis is starting
    onAnalysisStart?.();

    // Start async transition for analysis
    startTransition(async () => {
      try {
        // Call the premium analysis endpoint with config
        const response = await classifyBoundaryPremium(code, {
          analysisDepth: config?.analysisDepth || 'standard',
          frameworkMode: config?.frameworkMode || 'app-router',
          strictnessLevel: config?.strictnessLevel || 'standard',
        });

        if ('error' in response) {
          // Handle error response
          setError(response.error);
        } else {
          // Handle success response
          const { result, pipeline } = response;
          setError(null);

          // Notify parent component with result and pipeline data
          onAnalysisComplete?.(result, pipeline);
        }
      } catch (err) {
        console.error('Analysis error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  // ===========================================================================
  // KEYBOARD HANDLING
  // ===========================================================================

  /**
   * Handles keyboard shortcuts and special keys.
   * - Tab: Insert 2 spaces for indentation
   * - Ctrl+Enter: Submit for analysis
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key - insert indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 2 spaces at cursor position
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);

      // Move cursor after the indentation
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl+Enter - submit for analysis
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Loads code from an external source (e.g., history item).
   * Exposed globally for other components to call.
   */
  const loadCode = useCallback((newCode: string) => {
    setCode(newCode);
    setError(null);
  }, []);

  // Expose loadCode method on window for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { loadCode: typeof loadCode }).loadCode = loadCode;
    }
  }, [loadCode]);

  // ===========================================================================
  // LINE NUMBER CALCULATION
  // ===========================================================================

  /**
   * Generates line numbers for the editor gutter.
   */
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="flex flex-col">
      {/* Header with title and character count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-200">Code Input</h2>
          {/* Analysis mode indicator */}
          {config && (
            <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
              {config.analysisDepth}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {code.length.toLocaleString()} characters
        </span>
      </div>

      {/* Editor container with line numbers and highlighting */}
      <div className="relative rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="flex min-h-[350px] max-h-[500px]">
          {/* Line numbers gutter */}
          <div className="flex-shrink-0 py-4 px-3 bg-gray-800/50 border-r border-gray-700 select-none overflow-hidden">
            <div className="text-right font-mono text-xs text-gray-500 leading-6">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>
          </div>

          {/* Editor area with dual-layer for highlighting */}
          <div className="flex-1 relative overflow-hidden">
            {/* Highlighted code overlay (visible but not editable) */}
            <pre
              ref={highlightRef}
              className="absolute inset-0 p-4 m-0 overflow-auto pointer-events-none font-mono text-sm leading-6 whitespace-pre-wrap break-words"
              aria-hidden="true"
            >
              <code
                className="language-tsx"
                dangerouslySetInnerHTML={{ __html: highlightedCode || '&nbsp;' }}
              />
            </pre>

            {/* Actual textarea (invisible but captures input) */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder={`// Paste your JavaScript/TypeScript code here...\n\n// Examples:\n// - React components with hooks\n// - Server actions with 'use server'\n// - API route handlers\n// - Utility functions`}
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none focus:outline-none font-mono text-sm leading-6 whitespace-pre-wrap"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          {/* Error icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Submit button row */}
      <div className="mt-4 flex items-center gap-4">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !code.trim()}
          isLoading={isPending}
          className="flex-1"
          size="lg"
        >
          {isPending ? (
            'Analyzing...'
          ) : (
            <>
              {/* Analyze icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Analyze Boundary
            </>
          )}
        </Button>

        {/* Clear button */}
        {code.trim() && !isPending && (
          <Button
            variant="outline"
            onClick={() => {
              setCode('');
              setError(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> to analyze
      </p>
    </div>
  );
}
