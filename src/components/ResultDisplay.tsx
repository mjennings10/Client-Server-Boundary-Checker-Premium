import { ClassificationResult, Classification } from '@/app/actions';

interface ResultDisplayProps {
  result: ClassificationResult;
}

const classificationConfig: Record<
  Classification,
  { label: string; bgColor: string; textColor: string; borderColor: string; icon: string }
> = {
  'client-only': {
    label: 'Client Only',
    bgColor: 'bg-client-100',
    textColor: 'text-client-600',
    borderColor: 'border-client-500',
    icon: '🖥️',
  },
  'server-only': {
    label: 'Server Only',
    bgColor: 'bg-server-100',
    textColor: 'text-server-600',
    borderColor: 'border-server-500',
    icon: '🖧',
  },
  both: {
    label: 'Both Safe',
    bgColor: 'bg-both-100',
    textColor: 'text-both-600',
    borderColor: 'border-both-500',
    icon: '✓',
  },
};

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const config = classificationConfig[result.classification];

  return (
    <div className="space-y-4">
      {/* Classification Badge */}
      <div className="flex items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${config.bgColor} ${config.textColor} border-2 ${config.borderColor}`}
        >
          <span className="text-base">{config.icon}</span>
          {config.label}
        </div>
      </div>

      {/* Environment Indicators */}
      <div className="flex gap-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
            result.classification === 'client-only' || result.classification === 'both'
              ? 'bg-client-50 text-client-600 border border-client-500'
              : 'bg-gray-800 text-gray-500 border border-gray-700'
          }`}
        >
          <span>Client</span>
          {(result.classification === 'client-only' || result.classification === 'both') && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
            result.classification === 'server-only' || result.classification === 'both'
              ? 'bg-server-50 text-server-600 border border-server-500'
              : 'bg-gray-800 text-gray-500 border border-gray-700'
          }`}
        >
          <span>Server</span>
          {(result.classification === 'server-only' || result.classification === 'both') && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Explanation</h3>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Analyzed on {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
