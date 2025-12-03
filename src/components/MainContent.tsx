// =============================================================================
// MAIN CONTENT COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Client component that manages the main application layout and tab navigation.
// Integrates all premium features: Analysis, Batch, Analytics, Export.
//
// ARCHITECTURE:
// This is the primary client component that orchestrates the application.
// It receives initial data from the Server Component parent and manages
// local state for tabs, analysis results, and configuration.
//
// TABS:
// 1. Analyze: Single code analysis with pipeline progress
// 2. Batch: Multiple code snippet analysis
// 3. Analytics: Usage statistics and trends
// 4. Export: Export results in various formats
//
// STATE MANAGEMENT:
// - activeTab: Current tab selection
// - history: Analysis history (refreshed after each analysis)
// - currentResult: Latest analysis result for display
// - config: User configuration settings
// =============================================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import CodeEditor from './CodeEditor';
import ResultDisplay from './ResultDisplay';
import PipelineProgress from './PipelineProgress';
import History from './History';
import ConfigPanel from './ConfigPanel';
import BatchAnalysis from './BatchAnalysis';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportPanel from './ExportPanel';
import { getHistory } from '@/app/actions';
import type { ClassificationResult, UserConfig, AnalyticsSummary, PipelineResult } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface MainContentProps {
  /** Initial history data from server */
  initialHistory: ClassificationResult[];
  /** Initial user configuration */
  initialConfig: UserConfig | null;
  /** Initial analytics summary */
  initialAnalytics: AnalyticsSummary | null;
}

// =============================================================================
// MAIN CONTENT COMPONENT
// =============================================================================

/**
 * MainContent - orchestrates the main application UI.
 *
 * USAGE:
 * <MainContent
 *   initialHistory={history}
 *   initialConfig={config}
 *   initialAnalytics={analytics}
 * />
 */
export default function MainContent({
  initialHistory,
  initialConfig,
  initialAnalytics,
}: MainContentProps) {
  // ===========================================================================
  // STATE
  // ===========================================================================

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('analyze');

  // Analysis state
  const [history, setHistory] = useState<ClassificationResult[]>(initialHistory);
  const [currentResult, setCurrentResult] = useState<ClassificationResult | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Configuration state
  const [config, setConfig] = useState<UserConfig | null>(initialConfig);
  const [showSettings, setShowSettings] = useState(false);

  // ===========================================================================
  // CALLBACKS
  // ===========================================================================

  /**
   * Refreshes the history list from the server.
   * Called after each analysis completes.
   */
  const refreshHistory = useCallback(async () => {
    try {
      const updatedHistory = await getHistory();
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to refresh history:', error);
    }
  }, []);

  /**
   * Handles analysis start event.
   * Clears previous results and shows pipeline progress.
   */
  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
    setCurrentResult(null);
    setPipelineResult(null);
  }, []);

  /**
   * Handles analysis completion.
   * Updates the current result and refreshes history.
   */
  const handleAnalysisComplete = useCallback(
    (result: ClassificationResult, pipeline: PipelineResult) => {
      setCurrentResult(result);
      setPipelineResult(pipeline);
      setIsAnalyzing(false);
      refreshHistory();
    },
    [refreshHistory]
  );

  /**
   * Handles loading a history item into the editor.
   */
  const handleHistoryItemClick = useCallback((item: ClassificationResult) => {
    setCurrentResult(item);
    // Reconstruct pipeline result from saved data if available
    if (item.pipelineResults) {
      setPipelineResult({
        steps: item.pipelineResults,
        totalDuration: item.pipelineResults.reduce((sum, step) => sum + (step.duration || 0), 0),
        finalClassification: item.classification,
        finalExplanation: item.explanation,
      });
    }
    // Switch to analyze tab to show the result
    setActiveTab('analyze');
  }, []);

  /**
   * Handles configuration changes.
   */
  const handleConfigChange = useCallback((newConfig: UserConfig) => {
    setConfig(newConfig);
  }, []);

  /**
   * Handles batch analysis completion.
   */
  const handleBatchComplete = useCallback(() => {
    refreshHistory();
    // Optionally switch to analytics to see results
  }, [refreshHistory]);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ===================================================================
            MAIN CONTENT AREA
            =================================================================== */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation */}
            <TabsList className="mb-6">
              {/* Analyze Tab */}
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Analyze
              </TabsTrigger>

              {/* Batch Tab */}
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Batch
              </TabsTrigger>

              {/* Analytics Tab */}
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Analytics
              </TabsTrigger>

              {/* Export Tab */}
              <TabsTrigger value="export" className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
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
                Export
              </TabsTrigger>
            </TabsList>

            {/* =================================================================
                ANALYZE TAB CONTENT
                ================================================================= */}
            <TabsContent value="analyze" className="space-y-6">
              {/* Code Editor */}
              <CodeEditor
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                config={config}
              />

              {/* Pipeline Progress (shown during analysis) */}
              {isAnalyzing && (
                <PipelineProgress
                  steps={[
                    { id: 'classification', name: 'Classification', status: 'in-progress' },
                    { id: 'patterns', name: 'Pattern Detection', status: 'pending' },
                    { id: 'risk', name: 'Risk Assessment', status: 'pending' },
                    { id: 'suggestions', name: 'Suggestions', status: 'pending' },
                    { id: 'examples', name: 'Examples', status: 'pending' },
                  ]}
                />
              )}

              {/* Pipeline Progress (shown after analysis with results) */}
              {pipelineResult && !isAnalyzing && (
                <PipelineProgress
                  steps={pipelineResult.steps.map((step) => ({
                    id: step.stepName,
                    name: formatStepName(step.stepName),
                    status: step.error ? 'error' : 'complete',
                    duration: step.duration,
                  }))}
                  totalDuration={pipelineResult.totalDuration}
                />
              )}

              {/* Result Display */}
              {currentResult && (
                <ResultDisplay
                  result={currentResult}
                  pipelineResult={pipelineResult}
                />
              )}
            </TabsContent>

            {/* =================================================================
                BATCH TAB CONTENT
                ================================================================= */}
            <TabsContent value="batch">
              <BatchAnalysis onBatchComplete={handleBatchComplete} />
            </TabsContent>

            {/* =================================================================
                ANALYTICS TAB CONTENT
                ================================================================= */}
            <TabsContent value="analytics">
              <AnalyticsDashboard days={30} />
            </TabsContent>

            {/* =================================================================
                EXPORT TAB CONTENT
                ================================================================= */}
            <TabsContent value="export">
              <ExportPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* ===================================================================
            SIDEBAR
            =================================================================== */}
        <aside className="w-full xl:w-80 flex-shrink-0 space-y-4">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-200">Settings</span>
            </div>
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${
                showSettings ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Settings Panel (Collapsible) */}
          {showSettings && (
            <ConfigPanel onConfigChange={handleConfigChange} />
          )}

          {/* History Panel */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-200">History</h2>
                <span className="text-xs text-gray-500">
                  {history.length} {history.length === 1 ? 'check' : 'checks'}
                </span>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <History items={history} onItemClick={handleHistoryItemClick} />
            </div>
          </div>

          {/* Legend Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Classification Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-client-500" />
                  <span className="text-gray-300">Client Only</span>
                  <span className="text-gray-500 text-xs ml-auto">Browser APIs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-server-500" />
                  <span className="text-gray-300">Server Only</span>
                  <span className="text-gray-500 text-xs ml-auto">Node.js/DB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-both-500" />
                  <span className="text-gray-300">Both Safe</span>
                  <span className="text-gray-500 text-xs ml-auto">Isomorphic</span>
                </div>
              </div>

              {/* Risk levels */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Risk Levels</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-400">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-gray-400">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-gray-400">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-gray-400">Critical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Formats a step name for display.
 * Converts camelCase/snake_case to Title Case.
 */
function formatStepName(stepName: string): string {
  return stepName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
