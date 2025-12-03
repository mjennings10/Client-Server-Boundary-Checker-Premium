import { getHistory } from './actions';
import CodeEditor from '@/components/CodeEditor';
import History from '@/components/History';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const history = await getHistory();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
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
            <div>
              <h1 className="text-xl font-bold text-white">Boundary Checker</h1>
              <p className="text-xs text-gray-400">Next.js Client/Server Code Analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main Editor Area */}
          <div className="flex-1 min-w-0">
            <CodeEditor />
          </div>

          {/* History Sidebar */}
          <aside className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-200">History</h2>
                  <span className="text-xs text-gray-500">{history.length} checks</span>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <History items={history} />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Classification Legend</h3>
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
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-500">
            Built for Next.js App Router analysis. Classification powered by AI.
          </p>
        </div>
      </footer>
    </main>
  );
}
