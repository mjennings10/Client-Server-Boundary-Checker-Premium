// =============================================================================
// ANALYTICS SERVER ACTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains server actions for the analytics dashboard.
//
// KEY ACTIONS:
// - getAnalyticsSummary: Get aggregated statistics
// - getTimeSeriesData: Get data for charts
// - getTopPatterns: Get most common patterns
//
// ARCHITECTURE NOTES:
// - Analytics are derived from BoundaryCheck and AnalyticsEvent tables
// - Data is aggregated on-demand (no pre-computed metrics)
// - For production, consider caching or pre-aggregation for performance
// =============================================================================

'use server';

import { prisma, getAnalyticsSummary as getAnalyticsSummaryFromDb } from '@/lib/db';
import type { AnalyticsSummary, PatternType } from '@/types';

// =============================================================================
// ANALYTICS ACTIONS
// =============================================================================

/**
 * Gets the complete analytics summary for the dashboard.
 * Includes classification breakdown, risk distribution, top patterns, etc.
 *
 * @param days - Number of days to include (default: 30)
 * @returns Analytics summary object
 */
export async function getAnalyticsSummary(
  days: number = 30
): Promise<AnalyticsSummary> {
  return getAnalyticsSummaryFromDb(days);
}

/**
 * Gets time series data for the specified period.
 * Used for rendering charts showing trends over time.
 *
 * @param days - Number of days to include
 * @param granularity - Time granularity (day, week, month)
 * @returns Time series data points
 */
export async function getTimeSeriesData(
  days: number = 30,
  granularity: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ date: string; count: number; breakdown: Record<string, number> }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const checks = await prisma.boundaryCheck.findMany({
    where: { createdAt: { gte: startDate } },
    orderBy: { createdAt: 'asc' },
    select: {
      createdAt: true,
      classification: true,
    },
  });

  // Group by date based on granularity
  const groups = new Map<
    string,
    { count: number; breakdown: Record<string, number> }
  >();

  for (const check of checks) {
    const dateKey = formatDateForGranularity(check.createdAt, granularity);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        count: 0,
        breakdown: { 'client-only': 0, 'server-only': 0, both: 0 },
      });
    }

    const group = groups.get(dateKey)!;
    group.count++;
    group.breakdown[check.classification] =
      (group.breakdown[check.classification] || 0) + 1;
  }

  // Convert to array and sort
  return Array.from(groups.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Formats a date according to the specified granularity.
 *
 * @param date - The date to format
 * @param granularity - The granularity level
 * @returns Formatted date string
 */
function formatDateForGranularity(
  date: Date,
  granularity: 'day' | 'week' | 'month'
): string {
  switch (granularity) {
    case 'day':
      return date.toISOString().split('T')[0];

    case 'week': {
      // Get the Monday of the week
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return `Week of ${d.toISOString().split('T')[0]}`;
    }

    case 'month':
      return date.toISOString().slice(0, 7); // YYYY-MM
  }
}

/**
 * Gets the top patterns detected across all analyses.
 * Useful for understanding common code patterns in the codebase.
 *
 * @param limit - Maximum number of patterns to return
 * @param days - Number of days to include
 * @returns Array of patterns with counts
 */
export async function getTopPatterns(
  limit: number = 10,
  days: number = 30
): Promise<
  Array<{ name: string; type: PatternType; count: number; environment: string }>
> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const checks = await prisma.boundaryCheck.findMany({
    where: {
      createdAt: { gte: startDate },
      patterns: { not: null },
    },
    select: { patterns: true },
  });

  // Aggregate patterns
  const patternCounts = new Map<
    string,
    { type: PatternType; count: number; environment: string }
  >();

  for (const check of checks) {
    if (!check.patterns) continue;

    try {
      const patterns = JSON.parse(check.patterns) as Array<{
        name: string;
        type: PatternType;
        environment: string;
      }>;

      for (const pattern of patterns) {
        const key = pattern.name;
        const existing = patternCounts.get(key);

        if (existing) {
          existing.count++;
        } else {
          patternCounts.set(key, {
            type: pattern.type,
            count: 1,
            environment: pattern.environment,
          });
        }
      }
    } catch {
      // Skip invalid pattern data
    }
  }

  // Sort by count and limit
  return Array.from(patternCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Gets classification distribution for the specified period.
 * Returns percentages for pie chart display.
 *
 * @param days - Number of days to include
 * @returns Classification distribution with percentages
 */
export async function getClassificationDistribution(
  days: number = 30
): Promise<{
  clientOnly: { count: number; percentage: number };
  serverOnly: { count: number; percentage: number };
  both: { count: number; percentage: number };
  total: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const classifications = await prisma.boundaryCheck.groupBy({
    by: ['classification'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
  });

  const total = classifications.reduce((sum, c) => sum + c._count.id, 0);

  const getCount = (classification: string) =>
    classifications.find((c) => c.classification === classification)?._count.id || 0;

  const clientOnlyCount = getCount('client-only');
  const serverOnlyCount = getCount('server-only');
  const bothCount = getCount('both');

  return {
    clientOnly: {
      count: clientOnlyCount,
      percentage: total > 0 ? Math.round((clientOnlyCount / total) * 100) : 0,
    },
    serverOnly: {
      count: serverOnlyCount,
      percentage: total > 0 ? Math.round((serverOnlyCount / total) * 100) : 0,
    },
    both: {
      count: bothCount,
      percentage: total > 0 ? Math.round((bothCount / total) * 100) : 0,
    },
    total,
  };
}

/**
 * Gets risk level distribution for the specified period.
 *
 * @param days - Number of days to include
 * @returns Risk distribution data
 */
export async function getRiskDistribution(
  days: number = 30
): Promise<{
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const risks = await prisma.boundaryCheck.groupBy({
    by: ['riskLevel'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
  });

  const getCount = (level: string) =>
    risks.find((r) => r.riskLevel === level)?._count.id || 0;

  return {
    low: getCount('low'),
    medium: getCount('medium'),
    high: getCount('high'),
    critical: getCount('critical'),
    total: risks.reduce((sum, r) => sum + r._count.id, 0),
  };
}

/**
 * Gets recent activity for the dashboard.
 * Shows the most recent analyses with key information.
 *
 * @param limit - Maximum number of items to return
 * @returns Recent analyses
 */
export async function getRecentActivity(
  limit: number = 5
): Promise<
  Array<{
    id: string;
    createdAt: Date;
    classification: string;
    riskLevel: string | null;
    codePreview: string;
  }>
> {
  const checks = await prisma.boundaryCheck.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      classification: true,
      riskLevel: true,
      code: true,
    },
  });

  return checks.map((check) => ({
    id: check.id,
    createdAt: check.createdAt,
    classification: check.classification,
    riskLevel: check.riskLevel,
    codePreview: check.code.split('\n')[0]?.slice(0, 60) || '',
  }));
}

/**
 * Gets analysis trends comparing current period to previous period.
 *
 * @param days - Number of days for the current period
 * @returns Trend data with comparisons
 */
export async function getTrends(
  days: number = 7
): Promise<{
  currentPeriod: { count: number; avgRisk: number };
  previousPeriod: { count: number; avgRisk: number };
  changePercent: number;
}> {
  const now = new Date();
  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

  // Get current period data
  const currentChecks = await prisma.boundaryCheck.findMany({
    where: { createdAt: { gte: currentStart, lt: now } },
    select: { riskLevel: true },
  });

  // Get previous period data
  const previousChecks = await prisma.boundaryCheck.findMany({
    where: { createdAt: { gte: previousStart, lt: currentStart } },
    select: { riskLevel: true },
  });

  const riskScores: Record<string, number> = {
    low: 20,
    medium: 50,
    high: 75,
    critical: 95,
  };

  const calcAvgRisk = (checks: Array<{ riskLevel: string | null }>) => {
    const scores = checks
      .filter((c) => c.riskLevel)
      .map((c) => riskScores[c.riskLevel!] || 0);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  };

  const currentCount = currentChecks.length;
  const previousCount = previousChecks.length;
  const changePercent =
    previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0
      ? 100
      : 0;

  return {
    currentPeriod: {
      count: currentCount,
      avgRisk: calcAvgRisk(currentChecks),
    },
    previousPeriod: {
      count: previousCount,
      avgRisk: calcAvgRisk(previousChecks),
    },
    changePercent,
  };
}
