'use client';

import { ClassificationResult, Classification } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface HistoryProps {
  items: ClassificationResult[];
}

const classificationColors: Record<Classification, string> = {
  'client-only': 'bg-client-500',
  'server-only': 'bg-server-500',
  both: 'bg-both-500',
};

const classificationLabels: Record<Classification, string> = {
  'client-only': 'Client',
  'server-only': 'Server',
  both: 'Both',
};

function truncateCode(code: string, maxLength: number = 60): string {
  const firstLine = code.split('\n')[0] || code;
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength) + '...';
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function History({ items }: HistoryProps) {
  const router = useRouter();

  const handleItemClick = (item: ClassificationResult) => {
    // Use the global loadCode function from CodeEditor
    const loadCode = (window as unknown as { loadCode?: (code: string, result: ClassificationResult) => void }).loadCode;
    if (loadCode) {
      loadCode(item.code, item);
    }
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-3 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">No history yet</p>
        <p className="text-xs mt-1">Your analyzed code snippets will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          className="w-full p-3 text-left hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:bg-gray-800"
        >
          <div className="flex items-start gap-3">
            {/* Classification indicator */}
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${classificationColors[item.classification]}`}
              title={classificationLabels[item.classification]}
            />

            <div className="flex-1 min-w-0">
              {/* Code preview */}
              <p className="text-sm text-gray-300 font-mono truncate">{truncateCode(item.code)}</p>

              {/* Meta info */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    item.classification === 'client-only'
                      ? 'bg-client-500/20 text-client-500'
                      : item.classification === 'server-only'
                      ? 'bg-server-500/20 text-server-500'
                      : 'bg-both-500/20 text-both-500'
                  }`}
                >
                  {classificationLabels[item.classification]}
                </span>
                <span className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
