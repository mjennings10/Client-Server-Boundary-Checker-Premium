// =============================================================================
// UTILITY FUNCTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains utility functions used throughout the application.
// Following the Shadcn UI convention, we use clsx + tailwind-merge for
// className handling, plus additional helper functions.
//
// CONTENTS:
// 1. Class Name Utilities - For dynamic Tailwind class composition
// 2. Date/Time Utilities - For formatting timestamps
// 3. String Utilities - For text manipulation
// 4. Validation Utilities - For input validation
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =============================================================================
// 1. CLASS NAME UTILITIES
// =============================================================================

/**
 * Combines class names using clsx and tailwind-merge.
 * This is the standard pattern used by Shadcn UI components.
 *
 * WHY BOTH LIBRARIES?
 * - clsx: Conditionally joins class names, handles arrays, objects, falsy values
 * - tailwind-merge: Intelligently merges Tailwind classes, resolving conflicts
 *
 * EXAMPLE:
 * cn("px-4 py-2", isActive && "bg-blue-500", className)
 * // If isActive is true and className is "px-6", returns "py-2 bg-blue-500 px-6"
 * // Note: px-6 overrides px-4 thanks to tailwind-merge
 *
 * @param inputs - Class values to combine (strings, arrays, objects, etc.)
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// =============================================================================
// 2. DATE/TIME UTILITIES
// =============================================================================

/**
 * Formats a date as a relative time string (e.g., "5m ago", "2h ago").
 * Used in history items and timeline displays.
 *
 * TIME THRESHOLDS:
 * - < 60 seconds: "just now"
 * - < 60 minutes: "{n}m ago"
 * - < 24 hours: "{n}h ago"
 * - < 7 days: "{n}d ago"
 * - >= 7 days: Full date string
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Human-readable relative time string
 */
export function formatTimeAgo(date: Date | string): string {
  // Ensure we have a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Calculate time difference in various units
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Return appropriate format based on time difference
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  // For older dates, return the full date
  return dateObj.toLocaleDateString();
}

/**
 * Formats a date for display in result cards.
 * Uses locale-aware formatting for international support.
 *
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 * Used for displaying analysis times.
 *
 * EXAMPLES:
 * - 500 -> "500ms"
 * - 1500 -> "1.5s"
 * - 65000 -> "1m 5s"
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// =============================================================================
// 3. STRING UTILITIES
// =============================================================================

/**
 * Truncates a string to a maximum length, adding ellipsis if needed.
 * Used for previewing code snippets in history items.
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation (default: 60)
 * @returns Truncated string with ellipsis if truncated
 */
export function truncate(str: string, maxLength: number = 60): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Truncates code to just the first line for preview purposes.
 * If the first line is too long, it's also truncated.
 *
 * @param code - The code string to truncate
 * @param maxLength - Maximum length for the first line (default: 60)
 * @returns First line of code, truncated if necessary
 */
export function truncateCode(code: string, maxLength: number = 60): string {
  const firstLine = code.split('\n')[0] || code;
  return truncate(firstLine, maxLength);
}

/**
 * Counts the number of lines in a code string.
 * Used for code statistics display.
 *
 * @param code - The code string to count lines in
 * @returns Number of lines
 */
export function countLines(code: string): number {
  if (!code) return 0;
  return code.split('\n').length;
}

/**
 * Extracts a code snippet around a specific line number.
 * Used for showing context around detected patterns.
 *
 * @param code - The full code string
 * @param line - The target line number (1-indexed)
 * @param context - Number of lines to show before and after (default: 2)
 * @returns Object with the snippet and adjusted line numbers
 */
export function extractCodeContext(
  code: string,
  line: number,
  context: number = 2
): { snippet: string; startLine: number; endLine: number } {
  const lines = code.split('\n');
  const startLine = Math.max(1, line - context);
  const endLine = Math.min(lines.length, line + context);

  const snippet = lines.slice(startLine - 1, endLine).join('\n');

  return { snippet, startLine, endLine };
}

// =============================================================================
// 4. VALIDATION UTILITIES
// =============================================================================

/**
 * Validates code input for analysis.
 * Returns an error message if invalid, null if valid.
 *
 * VALIDATION RULES:
 * - Must not be empty or whitespace only
 * - Must not exceed 50,000 characters
 * - Must contain at least some code-like content
 *
 * @param code - The code string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCodeInput(code: string): string | null {
  // Check for empty input
  if (!code || code.trim().length === 0) {
    return 'Please provide code to analyze.';
  }

  // Check length limit
  if (code.length > 50000) {
    return 'Code snippet is too large. Please limit to 50,000 characters.';
  }

  // Basic check for code-like content (at least has some alphanumeric chars)
  if (!/[a-zA-Z0-9]/.test(code)) {
    return 'Input does not appear to contain valid code.';
  }

  return null;
}

/**
 * Parses code input to extract multiple snippets for batch analysis.
 * Snippets are separated by a specific delimiter pattern.
 *
 * DELIMITER PATTERNS SUPPORTED:
 * - "// --- snippet ---" (with optional name)
 * - Block comment with dashes: slash-asterisk --- snippet --- asterisk-slash
 * - Three or more dashes on their own line
 *
 * @param input - The input string containing multiple snippets
 * @returns Array of { code, label } objects
 */
export function parseCodeSnippets(input: string): Array<{ code: string; label?: string }> {
  // Pattern to match snippet delimiters
  // Matches: // --- snippet: name --- OR // --- OR ---
  const delimiterPattern = /(?:\/\/\s*---\s*(?:snippet)?:?\s*(.*?)\s*---)|(?:\/\*\s*---\s*(?:snippet)?:?\s*(.*?)\s*---\s*\*\/)|(?:^-{3,}$)/gm;

  const parts = input.split(delimiterPattern);
  const snippets: Array<{ code: string; label?: string }> = [];

  // Filter out empty parts and the delimiter matches
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part && part.trim()) {
      // Check if this looks like code (not just a label)
      if (part.includes('\n') || part.length > 50 || /[{}();=]/.test(part)) {
        snippets.push({
          code: part.trim(),
          label: snippets.length > 0 ? `Snippet ${snippets.length + 1}` : 'Snippet 1'
        });
      }
    }
  }

  // If no delimiters found, treat the whole input as one snippet
  if (snippets.length === 0 && input.trim()) {
    snippets.push({ code: input.trim() });
  }

  return snippets;
}

// =============================================================================
// 5. DATA TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Safely parses JSON with a fallback value.
 * Used for parsing JSON fields from the database.
 *
 * @param json - The JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;

  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generates a unique ID for batch operations.
 * Uses a combination of timestamp and random string.
 *
 * @returns Unique batch identifier
 */
export function generateBatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `batch_${timestamp}_${random}`;
}

// =============================================================================
// 6. COLOR UTILITIES
// =============================================================================

/**
 * Gets the Tailwind color classes for a classification type.
 * Centralizes color logic to ensure consistency across components.
 *
 * @param classification - The classification type
 * @returns Object with background, text, and border color classes
 */
export function getClassificationColors(classification: 'client-only' | 'server-only' | 'both'): {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (classification) {
    case 'client-only':
      return {
        bg: 'bg-client-500',
        bgLight: 'bg-client-500/20',
        text: 'text-client-400',
        border: 'border-client-500',
        dot: 'bg-client-500',
      };
    case 'server-only':
      return {
        bg: 'bg-server-500',
        bgLight: 'bg-server-500/20',
        text: 'text-server-400',
        border: 'border-server-500',
        dot: 'bg-server-500',
      };
    case 'both':
      return {
        bg: 'bg-both-500',
        bgLight: 'bg-both-500/20',
        text: 'text-both-400',
        border: 'border-both-500',
        dot: 'bg-both-500',
      };
  }
}

/**
 * Gets the Tailwind color classes for a risk level.
 *
 * @param riskLevel - The risk level
 * @returns Object with color classes for the risk level
 */
export function getRiskColors(riskLevel: 'low' | 'medium' | 'high' | 'critical'): {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
} {
  switch (riskLevel) {
    case 'low':
      return {
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500',
      };
    case 'high':
      return {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500',
      };
    case 'critical':
      return {
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500',
      };
  }
}
