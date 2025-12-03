// =============================================================================
// PRISMA DATABASE CLIENT - Client/Server Boundary Checker Premium
// =============================================================================
// This file provides the Prisma client instance for database operations.
// It uses a singleton pattern to ensure only one client is created.
//
// SINGLETON PATTERN EXPLANATION:
// In Next.js development mode, hot reloading can create multiple Prisma
// instances, exhausting database connections. We store the client on the
// global object to persist across hot reloads.
//
// VERCEL DEPLOYMENT NOTES:
// - SQLite is file-based, stored in the project directory
// - For Vercel, the database resets on each deployment
// - For persistent data, consider migrating to PostgreSQL/PlanetScale
// =============================================================================

import { PrismaClient } from '@prisma/client';

// =============================================================================
// GLOBAL TYPE DECLARATION
// =============================================================================
// Extend the global namespace to include our Prisma client.
// This is necessary for TypeScript to understand our singleton pattern.
// =============================================================================

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// =============================================================================
// PRISMA CLIENT SINGLETON
// =============================================================================
// Create or reuse the Prisma client instance.
//
// LOGIC:
// 1. In production: Always create a new client (no hot reload issues)
// 2. In development: Reuse existing global client if available
//    This prevents "too many connections" errors during hot reload
// =============================================================================

/**
 * Prisma client instance for database operations.
 *
 * USAGE:
 * import { prisma } from '@/lib/db';
 *
 * // Query example
 * const checks = await prisma.boundaryCheck.findMany();
 *
 * // Create example
 * const newCheck = await prisma.boundaryCheck.create({
 *   data: { code: '...', classification: '...', explanation: '...' }
 * });
 */
export const prisma: PrismaClient =
  // In production, always create a new client
  // In development, reuse the global client if it exists
  globalThis.prisma ??
  new PrismaClient({
    // ==========================================================================
    // CLIENT CONFIGURATION OPTIONS
    // ==========================================================================

    // Log queries in development for debugging
    // In production, only log errors to reduce noise
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// =============================================================================
// DEVELOPMENT MODE: PERSIST CLIENT ON GLOBAL
// =============================================================================
// Store the client on the global object in development to survive hot reloads.
// This ONLY happens in development - production creates a fresh client.
// =============================================================================

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// =============================================================================
// DATABASE HELPER FUNCTIONS
// =============================================================================
// Convenience functions that wrap common database operations.
// These provide a cleaner API and centralize error handling.
// =============================================================================

/**
 * Ensures the database is connected and ready.
 * Call this during app initialization to catch connection errors early.
 *
 * @returns Promise that resolves when database is ready
 * @throws Error if database connection fails
 */
export async function ensureDatabaseConnection(): Promise<void> {
  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Failed to connect to database. Check your DATABASE_URL.');
  }
}

/**
 * Gracefully disconnects from the database.
 * Call this during app shutdown or test cleanup.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// =============================================================================
// USER CONFIG HELPERS
// =============================================================================
// Helper functions for the singleton UserConfig pattern.
// =============================================================================

/**
 * Gets the current user configuration, creating default if needed.
 * Uses the singleton pattern - there's only ever one config row.
 *
 * DEFAULT VALUES:
 * - analysisDepth: "standard"
 * - frameworkMode: "app-router"
 * - strictnessLevel: "standard"
 *
 * @returns The current user configuration
 */
export async function getUserConfig() {
  // Try to find existing config
  let config = await prisma.userConfig.findUnique({
    where: { id: 'default' },
  });

  // Create default config if it doesn't exist
  if (!config) {
    config = await prisma.userConfig.create({
      data: {
        id: 'default',
        analysisDepth: 'standard',
        frameworkMode: 'app-router',
        strictnessLevel: 'standard',
      },
    });
  }

  return config;
}

/**
 * Updates the user configuration.
 * Uses upsert to handle both create and update cases.
 *
 * @param data - Partial config data to update
 * @returns The updated configuration
 */
export async function updateUserConfig(data: {
  analysisDepth?: string;
  frameworkMode?: string;
  strictnessLevel?: string;
}) {
  return prisma.userConfig.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      analysisDepth: data.analysisDepth ?? 'standard',
      frameworkMode: data.frameworkMode ?? 'app-router',
      strictnessLevel: data.strictnessLevel ?? 'standard',
    },
  });
}

// =============================================================================
// ANALYTICS HELPERS
// =============================================================================
// Helper functions for tracking analytics events.
// =============================================================================

/**
 * Records an analytics event.
 * Events are stored with their type and JSON data payload.
 *
 * @param eventType - Type of event (e.g., 'analysis', 'batch_start')
 * @param data - Event data as a JSON-serializable object
 */
export async function recordAnalyticsEvent(
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        data: JSON.stringify(data),
      },
    });
  } catch (error) {
    // Don't let analytics failures break the app
    console.error('Failed to record analytics event:', error);
  }
}

/**
 * Gets analytics summary for the dashboard.
 * Aggregates data from boundary checks and events.
 *
 * @param days - Number of days to include (default: 30)
 * @returns Analytics summary object
 */
export async function getAnalyticsSummary(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all checks in the time period
  const checks = await prisma.boundaryCheck.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate classification breakdown
  const classificationBreakdown = {
    clientOnly: checks.filter((c) => c.classification === 'client-only').length,
    serverOnly: checks.filter((c) => c.classification === 'server-only').length,
    both: checks.filter((c) => c.classification === 'both').length,
  };

  // Calculate risk breakdown
  const riskBreakdown = {
    low: checks.filter((c) => c.riskLevel === 'low').length,
    medium: checks.filter((c) => c.riskLevel === 'medium').length,
    high: checks.filter((c) => c.riskLevel === 'high').length,
    critical: checks.filter((c) => c.riskLevel === 'critical').length,
  };

  // Aggregate patterns across all checks
  const patternCounts: Record<string, { type: string; count: number }> = {};
  for (const check of checks) {
    if (check.patterns) {
      try {
        const patterns = JSON.parse(check.patterns) as Array<{
          type: string;
          name: string;
        }>;
        for (const pattern of patterns) {
          const key = pattern.name;
          if (patternCounts[key]) {
            patternCounts[key].count++;
          } else {
            patternCounts[key] = { type: pattern.type, count: 1 };
          }
        }
      } catch {
        // Skip invalid pattern data
      }
    }
  }

  // Get top patterns
  const topPatterns = Object.entries(patternCounts)
    .map(([name, data]) => ({ name, type: data.type, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Build time series data (group by date)
  const timeSeriesMap: Record<string, number> = {};
  for (const check of checks) {
    const dateKey = check.createdAt.toISOString().split('T')[0];
    timeSeriesMap[dateKey] = (timeSeriesMap[dateKey] || 0) + 1;
  }

  const timeSeriesData = Object.entries(timeSeriesMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate average analysis time from pipeline results
  let totalDuration = 0;
  let durationCount = 0;
  for (const check of checks) {
    if (check.pipelineResults) {
      try {
        const pipeline = JSON.parse(check.pipelineResults);
        if (pipeline.metadata?.totalDuration) {
          totalDuration += pipeline.metadata.totalDuration;
          durationCount++;
        }
      } catch {
        // Skip invalid pipeline data
      }
    }
  }

  return {
    totalAnalyses: checks.length,
    classificationBreakdown,
    riskBreakdown,
    topPatterns,
    timeSeriesData,
    averageAnalysisTime: durationCount > 0 ? totalDuration / durationCount : 0,
  };
}
