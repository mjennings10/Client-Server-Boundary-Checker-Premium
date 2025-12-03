'use client';

import { useState, useTransition } from 'react';
import { classifyBoundary, ClassificationResult, ClassificationError } from '@/app/actions';
import ResultDisplay from './ResultDisplay';

interface CodeEditorProps {
  initialCode?: string;
  initialResult?: ClassificationResult | null;
}

export default function CodeEditor({ initialCode = '', initialResult = null }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ClassificationResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await classifyBoundary(code);

      if ('error' in response) {
        setError((response as ClassificationError).error);
        setResult(null);
      } else {
        setResult(response as ClassificationResult);
        setError(null);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      // Move cursor after the tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Update code when initialCode changes (from history selection)
  const loadCode = (newCode: string, newResult: ClassificationResult | null) => {
    setCode(newCode);
    setResult(newResult);
    setError(null);
  };

  // Expose loadCode method for parent components
  if (typeof window !== 'undefined') {
    (window as unknown as { loadCode: typeof loadCode }).loadCode = loadCode;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Panel - Code Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-200">Code Input</h2>
          <span className="text-xs text-gray-500">{code.length.toLocaleString()} characters</span>
        </div>

        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`// Paste your JavaScript/TypeScript code here...\n\n// Examples:\n// - React components\n// - Server actions\n// - API route handlers\n// - Utility functions\n// - Type definitions`}
            className="code-editor w-full h-full min-h-[400px] p-4 bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-600"
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || !code.trim()}
          className="mt-4 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Check Boundary
            </>
          )}
        </button>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col min-w-0">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Analysis Result</h2>

        <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-auto">
          {error ? (
            <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-300">{error}</p>
            </div>
          ) : result ? (
            <ResultDisplay result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-center">
                Enter code in the editor and click<br />
                &ldquo;Check Boundary&rdquo; to analyze
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
