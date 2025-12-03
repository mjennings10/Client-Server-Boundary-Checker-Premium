// =============================================================================
// PATTERN DETECTION UTILITIES - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains utilities for detecting code patterns that affect
// client/server boundary classification.
//
// PATTERN CATEGORIES:
// 1. React Hooks - useState, useEffect, useContext, etc.
// 2. Browser APIs - window, document, localStorage, etc.
// 3. Node.js APIs - fs, path, process, etc.
// 4. Next.js Directives - "use client", "use server"
// 5. Event Handlers - onClick, onChange, onSubmit, etc.
// 6. Database Access - Prisma, Drizzle, SQL patterns
// 7. Fetch Patterns - Client-side vs server-side fetching
//
// HOW DETECTION WORKS:
// We use regex patterns to scan code for known constructs.
// Each pattern has an associated environment (client/server/both)
// and a risk contribution level.
//
// LIMITATIONS:
// - Static analysis only, no AST parsing
// - May have false positives/negatives
// - Cannot detect dynamic API usage
// =============================================================================

import type { DetectedPattern, PatternType, RiskLevel } from '@/types';

// =============================================================================
// PATTERN DEFINITIONS
// =============================================================================
// Each pattern definition includes:
// - regex: Pattern to match in the code
// - type: Category of the pattern
// - name: Human-readable name
// - environment: Which environment the pattern is associated with
// - description: Why this pattern matters
// - riskContribution: How much this pattern affects risk assessment
// =============================================================================

interface PatternDefinition {
  regex: RegExp;
  type: PatternType;
  name: string;
  environment: 'client' | 'server' | 'both';
  description: string;
  riskContribution: RiskLevel;
}

/**
 * All pattern definitions used for detection.
 * Patterns are checked in order - more specific patterns should come first.
 */
const PATTERN_DEFINITIONS: PatternDefinition[] = [
  // ===========================================================================
  // NEXT.JS DIRECTIVES (highest priority - explicit declarations)
  // ===========================================================================
  {
    regex: /['"]use client['"]/g,
    type: 'directive',
    name: 'use client',
    environment: 'client',
    description: 'Explicitly marks this file as a Client Component',
    riskContribution: 'low',
  },
  {
    regex: /['"]use server['"]/g,
    type: 'directive',
    name: 'use server',
    environment: 'server',
    description: 'Explicitly marks this code as a Server Action',
    riskContribution: 'low',
  },

  // ===========================================================================
  // REACT HOOKS (client-only)
  // ===========================================================================
  {
    regex: /\buseState\s*[<(]/g,
    type: 'hook',
    name: 'useState',
    environment: 'client',
    description: 'React state hook - requires client-side rendering',
    riskContribution: 'high',
  },
  {
    regex: /\buseEffect\s*\(/g,
    type: 'hook',
    name: 'useEffect',
    environment: 'client',
    description: 'React effect hook - runs only in browser',
    riskContribution: 'high',
  },
  {
    regex: /\buseLayoutEffect\s*\(/g,
    type: 'hook',
    name: 'useLayoutEffect',
    environment: 'client',
    description: 'React layout effect hook - runs synchronously after DOM mutations',
    riskContribution: 'high',
  },
  {
    regex: /\buseReducer\s*[<(]/g,
    type: 'hook',
    name: 'useReducer',
    environment: 'client',
    description: 'React reducer hook - requires client-side state',
    riskContribution: 'high',
  },
  {
    regex: /\buseContext\s*\(/g,
    type: 'hook',
    name: 'useContext',
    environment: 'client',
    description: 'React context hook - requires client-side context provider',
    riskContribution: 'medium',
  },
  {
    regex: /\buseRef\s*[<(]/g,
    type: 'hook',
    name: 'useRef',
    environment: 'client',
    description: 'React ref hook - typically used with DOM elements',
    riskContribution: 'medium',
  },
  {
    regex: /\buseMemo\s*\(/g,
    type: 'hook',
    name: 'useMemo',
    environment: 'client',
    description: 'React memoization hook - client-side optimization',
    riskContribution: 'medium',
  },
  {
    regex: /\buseCallback\s*\(/g,
    type: 'hook',
    name: 'useCallback',
    environment: 'client',
    description: 'React callback hook - client-side optimization',
    riskContribution: 'medium',
  },
  {
    regex: /\buseImperativeHandle\s*\(/g,
    type: 'hook',
    name: 'useImperativeHandle',
    environment: 'client',
    description: 'React imperative handle hook - exposes ref methods',
    riskContribution: 'medium',
  },
  {
    regex: /\buseTransition\s*\(/g,
    type: 'hook',
    name: 'useTransition',
    environment: 'client',
    description: 'React transition hook - client-side async state updates',
    riskContribution: 'high',
  },
  {
    regex: /\buseDeferredValue\s*\(/g,
    type: 'hook',
    name: 'useDeferredValue',
    environment: 'client',
    description: 'React deferred value hook - client-side optimization',
    riskContribution: 'medium',
  },
  // Custom hooks (any use* pattern not already matched)
  {
    regex: /\buse[A-Z][a-zA-Z]*\s*\(/g,
    type: 'hook',
    name: 'Custom Hook',
    environment: 'client',
    description: 'Custom React hook - typically requires client-side execution',
    riskContribution: 'medium',
  },

  // ===========================================================================
  // BROWSER APIs (client-only)
  // ===========================================================================
  {
    regex: /\bwindow\./g,
    type: 'browser-api',
    name: 'window',
    environment: 'client',
    description: 'Browser window object - not available on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bdocument\./g,
    type: 'browser-api',
    name: 'document',
    environment: 'client',
    description: 'Browser document object - DOM not available on server',
    riskContribution: 'critical',
  },
  {
    regex: /\blocalStorage\./g,
    type: 'browser-api',
    name: 'localStorage',
    environment: 'client',
    description: 'Browser localStorage API - not available on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bsessionStorage\./g,
    type: 'browser-api',
    name: 'sessionStorage',
    environment: 'client',
    description: 'Browser sessionStorage API - not available on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bnavigator\./g,
    type: 'browser-api',
    name: 'navigator',
    environment: 'client',
    description: 'Browser navigator object - not available on server',
    riskContribution: 'high',
  },
  {
    regex: /\blocation\./g,
    type: 'browser-api',
    name: 'location',
    environment: 'client',
    description: 'Browser location object - not available on server',
    riskContribution: 'high',
  },
  {
    regex: /\bhistory\./g,
    type: 'browser-api',
    name: 'history',
    environment: 'client',
    description: 'Browser history API - not available on server',
    riskContribution: 'high',
  },
  {
    regex: /\bindexedDB\./g,
    type: 'browser-api',
    name: 'indexedDB',
    environment: 'client',
    description: 'Browser IndexedDB API - not available on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bWebSocket\s*\(/g,
    type: 'browser-api',
    name: 'WebSocket',
    environment: 'client',
    description: 'WebSocket API - typically used client-side',
    riskContribution: 'high',
  },
  {
    regex: /\bIntersectionObserver\s*\(/g,
    type: 'browser-api',
    name: 'IntersectionObserver',
    environment: 'client',
    description: 'IntersectionObserver API - requires DOM',
    riskContribution: 'high',
  },
  {
    regex: /\bMutationObserver\s*\(/g,
    type: 'browser-api',
    name: 'MutationObserver',
    environment: 'client',
    description: 'MutationObserver API - requires DOM',
    riskContribution: 'high',
  },
  {
    regex: /\bResizeObserver\s*\(/g,
    type: 'browser-api',
    name: 'ResizeObserver',
    environment: 'client',
    description: 'ResizeObserver API - requires DOM',
    riskContribution: 'high',
  },
  {
    regex: /\brequestAnimationFrame\s*\(/g,
    type: 'browser-api',
    name: 'requestAnimationFrame',
    environment: 'client',
    description: 'requestAnimationFrame - browser animation API',
    riskContribution: 'high',
  },
  {
    regex: /\bgetComputedStyle\s*\(/g,
    type: 'browser-api',
    name: 'getComputedStyle',
    environment: 'client',
    description: 'getComputedStyle - requires DOM',
    riskContribution: 'high',
  },

  // ===========================================================================
  // NODE.JS APIs (server-only)
  // ===========================================================================
  {
    regex: /\bfs\./g,
    type: 'node-api',
    name: 'fs',
    environment: 'server',
    description: 'Node.js file system module - not available in browser',
    riskContribution: 'critical',
  },
  {
    regex: /require\s*\(\s*['"]fs['"]\s*\)/g,
    type: 'node-api',
    name: 'require(fs)',
    environment: 'server',
    description: 'Node.js fs module import',
    riskContribution: 'critical',
  },
  {
    regex: /from\s+['"]fs['"]/g,
    type: 'import',
    name: 'import fs',
    environment: 'server',
    description: 'ES module import of fs',
    riskContribution: 'critical',
  },
  {
    regex: /\bpath\./g,
    type: 'node-api',
    name: 'path',
    environment: 'server',
    description: 'Node.js path module - not available in browser',
    riskContribution: 'high',
  },
  {
    regex: /from\s+['"]path['"]/g,
    type: 'import',
    name: 'import path',
    environment: 'server',
    description: 'ES module import of path',
    riskContribution: 'high',
  },
  {
    regex: /\bprocess\.env\./g,
    type: 'node-api',
    name: 'process.env',
    environment: 'server',
    description: 'Server-side environment variables',
    riskContribution: 'high',
  },
  {
    regex: /\bprocess\./g,
    type: 'node-api',
    name: 'process',
    environment: 'server',
    description: 'Node.js process object',
    riskContribution: 'high',
  },
  {
    regex: /\bchild_process\./g,
    type: 'node-api',
    name: 'child_process',
    environment: 'server',
    description: 'Node.js child process module',
    riskContribution: 'critical',
  },
  {
    regex: /\bos\./g,
    type: 'node-api',
    name: 'os',
    environment: 'server',
    description: 'Node.js OS module',
    riskContribution: 'high',
  },
  {
    regex: /\bcrypto\./g,
    type: 'node-api',
    name: 'crypto',
    environment: 'server',
    description: 'Node.js crypto module (use Web Crypto API for browser)',
    riskContribution: 'medium',
  },
  {
    regex: /from\s+['"]server-only['"]/g,
    type: 'import',
    name: 'server-only',
    environment: 'server',
    description: 'Explicit server-only package import',
    riskContribution: 'low',
  },

  // ===========================================================================
  // NEXT.JS SPECIFIC (server-only)
  // ===========================================================================
  {
    regex: /from\s+['"]next\/headers['"]/g,
    type: 'import',
    name: 'next/headers',
    environment: 'server',
    description: 'Next.js headers/cookies - server-only',
    riskContribution: 'high',
  },
  {
    regex: /\bheaders\s*\(\s*\)/g,
    type: 'node-api',
    name: 'headers()',
    environment: 'server',
    description: 'Next.js headers function - server-only',
    riskContribution: 'high',
  },
  {
    regex: /\bcookies\s*\(\s*\)/g,
    type: 'node-api',
    name: 'cookies()',
    environment: 'server',
    description: 'Next.js cookies function - server-only',
    riskContribution: 'high',
  },

  // ===========================================================================
  // DATABASE ACCESS (server-only)
  // ===========================================================================
  {
    regex: /\bprisma\./g,
    type: 'database',
    name: 'Prisma',
    environment: 'server',
    description: 'Prisma ORM - must run on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bdrizzle\./g,
    type: 'database',
    name: 'Drizzle',
    environment: 'server',
    description: 'Drizzle ORM - must run on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bmongoose\./g,
    type: 'database',
    name: 'Mongoose',
    environment: 'server',
    description: 'Mongoose ODM - must run on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bsequelize\./g,
    type: 'database',
    name: 'Sequelize',
    environment: 'server',
    description: 'Sequelize ORM - must run on server',
    riskContribution: 'critical',
  },
  {
    regex: /\bPool\s*\(\s*\{/g,
    type: 'database',
    name: 'pg Pool',
    environment: 'server',
    description: 'PostgreSQL connection pool - server-only',
    riskContribution: 'critical',
  },
  {
    regex: /\bMySQL\./g,
    type: 'database',
    name: 'MySQL',
    environment: 'server',
    description: 'MySQL client - server-only',
    riskContribution: 'critical',
  },

  // ===========================================================================
  // EVENT HANDLERS (client-only when used in JSX)
  // ===========================================================================
  {
    regex: /\bonClick\s*=/g,
    type: 'event-handler',
    name: 'onClick',
    environment: 'client',
    description: 'Click event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonChange\s*=/g,
    type: 'event-handler',
    name: 'onChange',
    environment: 'client',
    description: 'Change event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonSubmit\s*=/g,
    type: 'event-handler',
    name: 'onSubmit',
    environment: 'client',
    description: 'Submit event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonKeyDown\s*=/g,
    type: 'event-handler',
    name: 'onKeyDown',
    environment: 'client',
    description: 'KeyDown event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonKeyUp\s*=/g,
    type: 'event-handler',
    name: 'onKeyUp',
    environment: 'client',
    description: 'KeyUp event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonKeyPress\s*=/g,
    type: 'event-handler',
    name: 'onKeyPress',
    environment: 'client',
    description: 'KeyPress event handler - requires client interactivity',
    riskContribution: 'high',
  },
  {
    regex: /\bonFocus\s*=/g,
    type: 'event-handler',
    name: 'onFocus',
    environment: 'client',
    description: 'Focus event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonBlur\s*=/g,
    type: 'event-handler',
    name: 'onBlur',
    environment: 'client',
    description: 'Blur event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonMouseEnter\s*=/g,
    type: 'event-handler',
    name: 'onMouseEnter',
    environment: 'client',
    description: 'MouseEnter event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonMouseLeave\s*=/g,
    type: 'event-handler',
    name: 'onMouseLeave',
    environment: 'client',
    description: 'MouseLeave event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonScroll\s*=/g,
    type: 'event-handler',
    name: 'onScroll',
    environment: 'client',
    description: 'Scroll event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonLoad\s*=/g,
    type: 'event-handler',
    name: 'onLoad',
    environment: 'client',
    description: 'Load event handler - requires client interactivity',
    riskContribution: 'medium',
  },
  {
    regex: /\bonError\s*=/g,
    type: 'event-handler',
    name: 'onError',
    environment: 'client',
    description: 'Error event handler - requires client interactivity',
    riskContribution: 'medium',
  },

  // ===========================================================================
  // DATA FETCHING PATTERNS
  // ===========================================================================
  {
    regex: /\bfetch\s*\(/g,
    type: 'fetch',
    name: 'fetch',
    environment: 'both',
    description: 'Fetch API - works in both environments',
    riskContribution: 'low',
  },
  {
    regex: /\baxios\./g,
    type: 'fetch',
    name: 'axios',
    environment: 'both',
    description: 'Axios HTTP client - works in both environments',
    riskContribution: 'low',
  },
];

// =============================================================================
// PATTERN DETECTION FUNCTIONS
// =============================================================================

/**
 * Detects all patterns in the given code.
 * Returns an array of detected patterns with line numbers.
 *
 * ALGORITHM:
 * 1. Split code into lines for line number tracking
 * 2. For each pattern definition, search the entire code
 * 3. Calculate line number for each match
 * 4. Deduplicate patterns that match multiple times on same line
 *
 * @param code - The code string to analyze
 * @returns Array of detected patterns
 */
export function detectPatterns(code: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lines = code.split('\n');

  // Track which patterns we've already found to avoid duplicates
  const foundPatterns = new Set<string>();

  for (const definition of PATTERN_DEFINITIONS) {
    // Reset regex state for each pattern
    const regex = new RegExp(definition.regex.source, definition.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      // Calculate line number (1-indexed)
      const lineNumber = getLineNumber(code, match.index);

      // Create unique key for deduplication
      const key = `${definition.name}:${lineNumber}`;

      // Skip if we've already found this pattern on this line
      if (foundPatterns.has(key)) continue;
      foundPatterns.add(key);

      // Calculate column (1-indexed)
      const lineStart = code.lastIndexOf('\n', match.index) + 1;
      const column = match.index - lineStart + 1;

      patterns.push({
        type: definition.type,
        name: definition.name,
        line: lineNumber,
        column,
        environment: definition.environment,
        description: definition.description,
        riskContribution: definition.riskContribution,
      });
    }
  }

  // Sort patterns by line number for consistent output
  patterns.sort((a, b) => (a.line || 0) - (b.line || 0));

  return patterns;
}

/**
 * Gets the line number for a character index in the code.
 *
 * @param code - The full code string
 * @param charIndex - The character index to find line for
 * @returns Line number (1-indexed)
 */
function getLineNumber(code: string, charIndex: number): number {
  const substring = code.substring(0, charIndex);
  return (substring.match(/\n/g) || []).length + 1;
}

/**
 * Generates a summary of detected patterns.
 * Used in the pipeline results display.
 *
 * @param patterns - Array of detected patterns
 * @returns Human-readable summary string
 */
export function generatePatternSummary(patterns: DetectedPattern[]): string {
  if (patterns.length === 0) {
    return 'No specific environment patterns detected. Code appears to be environment-agnostic.';
  }

  // Count by environment
  const clientPatterns = patterns.filter((p) => p.environment === 'client');
  const serverPatterns = patterns.filter((p) => p.environment === 'server');
  const bothPatterns = patterns.filter((p) => p.environment === 'both');

  const parts: string[] = [];

  if (clientPatterns.length > 0) {
    const names = [...new Set(clientPatterns.map((p) => p.name))].slice(0, 5);
    parts.push(
      `Found ${clientPatterns.length} client-side pattern(s): ${names.join(', ')}${
        clientPatterns.length > 5 ? '...' : ''
      }`
    );
  }

  if (serverPatterns.length > 0) {
    const names = [...new Set(serverPatterns.map((p) => p.name))].slice(0, 5);
    parts.push(
      `Found ${serverPatterns.length} server-side pattern(s): ${names.join(', ')}${
        serverPatterns.length > 5 ? '...' : ''
      }`
    );
  }

  if (bothPatterns.length > 0) {
    const names = [...new Set(bothPatterns.map((p) => p.name))].slice(0, 3);
    parts.push(`Found ${bothPatterns.length} isomorphic pattern(s): ${names.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Calculates the overall risk level based on detected patterns.
 * Uses the highest risk contribution from any pattern.
 *
 * RISK HIERARCHY:
 * 1. critical - Any critical pattern makes overall risk critical
 * 2. high - Any high pattern (without critical) makes overall risk high
 * 3. medium - Any medium pattern (without critical/high) makes overall risk medium
 * 4. low - Default when no patterns or only low-risk patterns
 *
 * @param patterns - Array of detected patterns
 * @returns Calculated risk level
 */
export function calculateRiskLevel(patterns: DetectedPattern[]): RiskLevel {
  if (patterns.length === 0) return 'low';

  // Check for mixed environment patterns (client + server = high risk)
  const hasClient = patterns.some((p) => p.environment === 'client');
  const hasServer = patterns.some((p) => p.environment === 'server');

  // Mixed patterns is always high risk
  if (hasClient && hasServer) {
    return 'critical';
  }

  // Otherwise, use highest risk contribution
  const riskOrder: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
  let maxRisk: RiskLevel = 'low';

  for (const pattern of patterns) {
    if (pattern.riskContribution) {
      const currentIndex = riskOrder.indexOf(pattern.riskContribution);
      const maxIndex = riskOrder.indexOf(maxRisk);
      if (currentIndex > maxIndex) {
        maxRisk = pattern.riskContribution;
      }
    }
  }

  return maxRisk;
}

/**
 * Groups patterns by their type for organized display.
 *
 * @param patterns - Array of detected patterns
 * @returns Object with patterns grouped by type
 */
export function groupPatternsByType(
  patterns: DetectedPattern[]
): Record<PatternType, DetectedPattern[]> {
  const groups: Record<PatternType, DetectedPattern[]> = {
    hook: [],
    'browser-api': [],
    'node-api': [],
    directive: [],
    import: [],
    'event-handler': [],
    database: [],
    fetch: [],
    other: [],
  };

  for (const pattern of patterns) {
    groups[pattern.type].push(pattern);
  }

  return groups;
}

/**
 * Gets patterns by environment for filtering.
 *
 * @param patterns - Array of detected patterns
 * @param environment - Target environment
 * @returns Filtered patterns
 */
export function getPatternsByEnvironment(
  patterns: DetectedPattern[],
  environment: 'client' | 'server' | 'both'
): DetectedPattern[] {
  return patterns.filter((p) => p.environment === environment);
}
