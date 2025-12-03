'use server';

import { db } from '@/lib/db';
import { getOpenAI } from '@/lib/openai';
import { revalidatePath } from 'next/cache';

export type Classification = 'client-only' | 'server-only' | 'both';

export interface ClassificationResult {
  id: string;
  classification: Classification;
  explanation: string;
  code: string;
  createdAt: Date;
}

export interface ClassificationError {
  error: string;
}

const SYSTEM_PROMPT = `You are an expert at analyzing JavaScript/TypeScript code for Next.js App Router applications. Your job is to classify code snippets based on where they can safely run: on the client, on the server, or both.

## Next.js App Router Rules

### Server Components (Default)
- In Next.js App Router, components are Server Components by default
- They run only on the server during rendering
- They can directly access server-side resources (databases, file system, environment variables)
- They CANNOT use browser APIs, React hooks (useState, useEffect, etc.), or event handlers

### Client Components
- Must be explicitly marked with "use client" directive at the top of the file
- Run in the browser (and during server-side rendering for hydration)
- Can use browser APIs, React hooks, and event handlers
- CANNOT directly access server-side resources

### Server Actions
- Functions marked with "use server" directive
- Can be defined in Server Components or in separate files
- Execute on the server but can be called from Client Components
- Used for mutations, form handling, and server-side operations

## Forbidden APIs by Environment

### Server-Only APIs (NOT available in browser):
- Node.js modules: fs, path, crypto (Node version), os, child_process, etc.
- process.env (server-side environment variables)
- Direct database access (Prisma, Drizzle, etc.)
- Server-only imports from packages like 'server-only'
- Headers, cookies manipulation (next/headers)

### Client-Only APIs (NOT available on server):
- window, document, navigator, location
- localStorage, sessionStorage, indexedDB
- Web APIs: fetch with credentials, WebSocket, WebRTC, etc.
- DOM manipulation
- Browser events (onClick, onChange, etc.)
- React hooks: useState, useEffect, useReducer, useContext, etc.

## Classification Rules

Classify as "client-only" when the code:
- Uses window, document, localStorage, sessionStorage, or other browser globals
- Uses React hooks (useState, useEffect, useReducer, useRef, useContext, etc.)
- Has "use client" directive
- Uses browser event handlers (onClick, onChange, onSubmit, etc.)
- Uses browser-specific APIs (navigator, geolocation, etc.)

Classify as "server-only" when the code:
- Uses fs, path, process.env, or other Node.js modules
- Imports from 'server-only' package
- Uses "use server" directive
- Directly accesses databases
- Uses next/headers (headers, cookies)
- Contains sensitive logic that should never reach the client

Classify as "both" (safe for both environments) when the code:
- Contains only pure functions with no side effects
- Only uses type definitions or interfaces
- Uses utilities that don't depend on environment-specific globals
- Is a React component that doesn't use hooks or event handlers AND doesn't access server resources
- Uses only cross-environment APIs (basic fetch, Promise, Array methods, etc.)

## Output Format

You MUST respond with ONLY a valid JSON object, no additional text:
{
  "classification": "client-only" | "server-only" | "both",
  "explanation": "Clear explanation of why this classification was chosen, referencing specific APIs or patterns found in the code."
}

If the code is ambiguous or could work in multiple environments with minor changes, classify as "both" and explain the conditions in your explanation.`;

export async function classifyBoundary(
  code: string
): Promise<ClassificationResult | ClassificationError> {
  // Validate input
  if (!code || code.trim().length === 0) {
    return { error: 'Please provide code to analyze.' };
  }

  if (code.length > 50000) {
    return { error: 'Code snippet is too large. Please limit to 50,000 characters.' };
  }

  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      return { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.' };
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this code and classify it:\n\n\`\`\`\n${code}\n\`\`\`\n\nClassify based on the rules above.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return { error: 'No response received from the AI model.' };
    }

    // Parse the JSON response
    let parsed: { classification: string; explanation: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      return { error: 'Failed to parse AI response. Please try again.' };
    }

    // Validate the classification
    const validClassifications = ['client-only', 'server-only', 'both'];
    if (!validClassifications.includes(parsed.classification)) {
      return { error: 'Invalid classification received. Please try again.' };
    }

    // Save to database
    const result = db.boundaryCheck.create({
      code,
      classification: parsed.classification,
      explanation: parsed.explanation,
    });

    // Revalidate the page to show updated history
    revalidatePath('/');

    return {
      id: result.id,
      classification: parsed.classification as Classification,
      explanation: parsed.explanation,
      code: result.code,
      createdAt: new Date(result.createdAt),
    };
  } catch (error) {
    console.error('Classification error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return { error: 'Invalid OpenAI API key. Please check your configuration.' };
      }
      if (error.message.includes('rate limit')) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      }
    }

    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getHistory(): Promise<ClassificationResult[]> {
  try {
    const results = db.boundaryCheck.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return results.map((r) => ({
      id: r.id,
      classification: r.classification as Classification,
      explanation: r.explanation,
      code: r.code,
      createdAt: new Date(r.createdAt),
    }));
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
}

export async function getCheckById(id: string): Promise<ClassificationResult | null> {
  try {
    const result = db.boundaryCheck.findUnique({
      where: { id },
    });

    if (!result) return null;

    return {
      id: result.id,
      classification: result.classification as Classification,
      explanation: result.explanation,
      code: result.code,
      createdAt: new Date(result.createdAt),
    };
  } catch (error) {
    console.error('Failed to fetch check:', error);
    return null;
  }
}
