// =============================================================================
// ANALYTICS DASHBOARD COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Displays analytics and metrics from analysis history.
// Provides visual insights into code patterns and trends.
//
// FEATURES:
// - Classification distribution chart
// - Risk level breakdown
// - Top patterns list
// - Recent activity feed
// - Time-based trends
//
// IMPLEMENTATION NOTES:
// Uses Recharts for visualizations. Data is fetched from server actions
// which aggregate information from the database.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { getAnalyticsSummary, getClassificationDistribution, getTopPatterns, getRecentActivity } from '@/app/actions';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/utils';
import type { AnalyticsSummary, Classification } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface AnalyticsDashboardProps {
  /** Number of days to show analytics for */
  days?: number;
}

// =============================================================================
// ANALYTICS DASHBOARD COMPONENT
// =============================================================================

export default function AnalyticsDashboard({ days = 30 }: AnalyticsDashboardProps) {
  // ===========================================================================
  // STATE
  // ===========================================================================

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [distribution, setDistribution] = useState<{
    clientOnly: { count: number; percentage: number };
    serverOnly: { count: number; percentage: number };
    both: { count: number; percentage: number };
    total: number;
  } | null>(null);
  const [topPatterns, setTopPatterns] = useState<
    Array<{ name: string; type: string; count: number; environment: string }>
  >([]);
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string;
      createdAt: Date;
      classification: string;
      riskLevel: string | null;
      codePreview: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // ===========================================================================
  // DATA FETCHING
  // ===========================================================================

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, distributionData, patternsData, activityData] = await Promise.all([
          getAnalyticsSummary(days),
          getClassificationDistribution(days),
          getTopPatterns(10, days),
          getRecentActivity(5),
        ]);

        setSummary(summaryData);
        setDistribution(distributionData);
        setTopPatterns(patternsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [days]);

  // ===========================================================================
  // LOADING STATE
  // ===========================================================================

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-800 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* =====================================================================
          SUMMARY STATS
          ===================================================================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Analyses */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Analyses</CardDescription>
            <CardTitle className="text-3xl">{summary?.totalAnalyses || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Last {days} days</p>
          </CardContent>
        </Card>

        {/* Client Only */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Client Only</CardDescription>
            <CardTitle className="text-3xl text-client-500">
              {distribution?.clientOnly.count || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {distribution?.clientOnly.percentage || 0}% of total
            </p>
          </CardContent>
        </Card>

        {/* Server Only */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Server Only</CardDescription>
            <CardTitle className="text-3xl text-server-500">
              {distribution?.serverOnly.count || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {distribution?.serverOnly.percentage || 0}% of total
            </p>
          </CardContent>
        </Card>

        {/* Both Safe */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Both Safe</CardDescription>
            <CardTitle className="text-3xl text-both-500">
              {distribution?.both.count || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {distribution?.both.percentage || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================================
          CHARTS ROW
          ===================================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Classification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Classification Distribution</CardTitle>
            <CardDescription>Breakdown of analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bar chart representation */}
              <DistributionBar
                label="Client Only"
                count={distribution?.clientOnly.count || 0}
                percentage={distribution?.clientOnly.percentage || 0}
                total={distribution?.total || 0}
                color="bg-client-500"
              />
              <DistributionBar
                label="Server Only"
                count={distribution?.serverOnly.count || 0}
                percentage={distribution?.serverOnly.percentage || 0}
                total={distribution?.total || 0}
                color="bg-server-500"
              />
              <DistributionBar
                label="Both Safe"
                count={distribution?.both.count || 0}
                percentage={distribution?.both.percentage || 0}
                total={distribution?.total || 0}
                color="bg-both-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Analysis by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RiskBar
                label="Low"
                count={summary?.riskBreakdown.low || 0}
                total={summary?.totalAnalyses || 0}
                color="bg-green-500"
              />
              <RiskBar
                label="Medium"
                count={summary?.riskBreakdown.medium || 0}
                total={summary?.totalAnalyses || 0}
                color="bg-yellow-500"
              />
              <RiskBar
                label="High"
                count={summary?.riskBreakdown.high || 0}
                total={summary?.totalAnalyses || 0}
                color="bg-orange-500"
              />
              <RiskBar
                label="Critical"
                count={summary?.riskBreakdown.critical || 0}
                total={summary?.totalAnalyses || 0}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================================
          PATTERNS AND ACTIVITY
          ===================================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Patterns</CardTitle>
            <CardDescription>Most frequently detected patterns</CardDescription>
          </CardHeader>
          <CardContent>
            {topPatterns.length === 0 ? (
              <p className="text-sm text-gray-500">No patterns detected yet</p>
            ) : (
              <div className="space-y-2">
                {topPatterns.slice(0, 8).map((pattern, index) => (
                  <div
                    key={`${pattern.name}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          pattern.environment === 'client'
                            ? 'bg-client-500'
                            : pattern.environment === 'server'
                            ? 'bg-server-500'
                            : 'bg-both-500'
                        )}
                      />
                      <span className="text-sm font-mono text-gray-300">
                        {pattern.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{pattern.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest analyses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 bg-gray-800/50 rounded"
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        activity.classification === 'client-only'
                          ? 'bg-client-500'
                          : activity.classification === 'server-only'
                          ? 'bg-server-500'
                          : 'bg-both-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate font-mono">
                        {activity.codePreview || 'No preview'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                    {activity.riskLevel && activity.riskLevel !== 'low' && (
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          activity.riskLevel === 'critical'
                            ? 'bg-red-500/20 text-red-400'
                            : activity.riskLevel === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        )}
                      >
                        {activity.riskLevel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function DistributionBar({
  label,
  count,
  percentage,
  total,
  color,
}: {
  label: string;
  count: number;
  percentage: number;
  total: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RiskBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
