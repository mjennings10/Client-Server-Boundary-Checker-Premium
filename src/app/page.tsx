// =============================================================================
// MAIN PAGE - Client/Server Boundary Checker Premium
// =============================================================================
// The main application page with tabbed navigation for all premium features.
// This is a Server Component that fetches initial data and renders the layout.
//
// TABS:
// 1. Analyze: Single code snippet analysis with pipeline visualization
// 2. Batch: Analyze multiple code snippets at once
// 3. Analytics: View usage statistics and trends
// 4. Export: Export analysis history in various formats
//
// LAYOUT:
// - Header with branding and settings toggle
// - Main content area with tab navigation
// - Sidebar with history and configuration
// - Footer with version info
//
// IMPLEMENTATION NOTES:
// This is a hybrid page - Server Component wrapper with Client Components.
// Initial data is fetched server-side for fast first paint.
// =============================================================================

import { getHistory, getConfig, getAnalyticsSummary } from './actions';
import MainContent from '@/components/MainContent';

// =============================================================================
// PAGE CONFIGURATION
// =============================================================================

// Force dynamic rendering for fresh data on each request
export const dynamic = 'force-dynamic';

// Page metadata
export const metadata = {
  title: 'Boundary Checker Premium - Next.js Client/Server Analysis',
  description: 'Analyze Next.js code to determine client/server boundary compatibility with multi-step AI pipeline',
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

/**
 * Home - main application page.
 *
 * This Server Component fetches initial data and renders the layout.
 * Interactive features are delegated to Client Components.
 */
export default async function Home() {
  // ===========================================================================
  // DATA FETCHING
  // ===========================================================================

  // Fetch initial data in parallel for performance
  const [history, config, analytics] = await Promise.all([
    getHistory(),
    getConfig(),
    getAnalyticsSummary(30),
  ]);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* =====================================================================
          HEADER
          ===================================================================== */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              {/* Logo icon with gradient */}
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* Title and subtitle */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">Boundary Checker</h1>
                  {/* Premium badge */}
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                    Premium
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Next.js Client/Server Code Analysis
                </p>
              </div>
            </div>

            {/* Header right section - Quick stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{analytics?.totalAnalyses || 0} analyses</span>
              </div>

              {/* Settings indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded text-gray-400 text-xs">
                <svg
                  className="h-3.5 w-3.5"
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
                <span>{config?.analysisDepth || 'standard'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN CONTENT
          ===================================================================== */}
      <MainContent
        initialHistory={history}
        initialConfig={config}
        initialAnalytics={analytics}
      />

      {/* =====================================================================
          FOOTER
          ===================================================================== */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Version and credits */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                Boundary Checker Premium v2.0
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Built for Next.js App Router. Powered by AI.
              </p>
            </div>

            {/* Feature summary */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-green-500"
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
                Multi-Step Pipeline
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-green-500"
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
                Batch Analysis
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-green-500"
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
                Analytics
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
