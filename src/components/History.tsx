// =============================================================================
// HISTORY COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// Displays the analysis history with enhanced filtering and visualization.
// Shows classification, risk levels, patterns, and batch grouping.
//
// PREMIUM FEATURES:
// - Search/filter functionality
// - Risk level indicators
// - Pattern count badges
// - Batch analysis grouping
// - Sort options (newest, oldest, risk)
// - Bulk selection and actions
// - Detailed expansion view
//
// IMPLEMENTATION NOTES:
// Uses client-side state for filtering/sorting to provide instant feedback.
// Data is fetched via server actions and passed as props.
// =============================================================================

'use client';

import { useState, useMemo } from 'react';
import { cn, truncateCode, formatTimeAgo, getClassificationColors, getRiskColors } from '@/lib/utils';
import type { ClassificationResult, RiskLevel } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface HistoryProps {
  /** Array of classification results to display */
  items: ClassificationResult[];
  /** Callback when an item is clicked to load it */
  onItemClick?: (item: ClassificationResult) => void;
  /** Callback when items are selected for batch actions */
  onSelectionChange?: (ids: string[]) => void;
  /** Enable multi-select mode */
  multiSelect?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Classification display labels
const CLASSIFICATION_LABELS = {
  'client-only': 'Client',
  'server-only': 'Server',
  both: 'Both',
} as const;

// Risk level display configuration
const RISK_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;

// Sort options for history display
type SortOption = 'newest' | 'oldest' | 'risk-high' | 'risk-low';

// =============================================================================
// HISTORY COMPONENT
// =============================================================================

/**
 * History - displays analysis history with filtering and actions.
 *
 * USAGE:
 * <History items={historyItems} onItemClick={handleLoad} />
 *
 * FEATURES:
 * - Search by code content
 * - Filter by classification
 * - Filter by risk level
 * - Sort by various criteria
 * - Multi-select for batch actions
 */
export default function History({
  items,
  onItemClick,
  onSelectionChange,
  multiSelect = false,
}: HistoryProps) {
  // ===========================================================================
  // STATE
  // ===========================================================================

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Selection state for multi-select mode
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Expanded item state for detail view
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ===========================================================================
  // FILTERED AND SORTED ITEMS
  // ===========================================================================

  /**
   * Applies filters and sorting to the items list.
   * Uses useMemo for performance optimization.
   */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(query) ||
          item.explanation.toLowerCase().includes(query)
      );
    }

    // Apply classification filter
    if (classificationFilter) {
      result = result.filter((item) => item.classification === classificationFilter);
    }

    // Apply risk filter
    if (riskFilter) {
      result = result.filter((item) => item.riskLevel === riskFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'risk-high':
        // Sort by risk level: critical > high > medium > low
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        result.sort((a, b) => {
          const aRisk = a.riskLevel ? riskOrder[a.riskLevel] : 0;
          const bRisk = b.riskLevel ? riskOrder[b.riskLevel] : 0;
          return bRisk - aRisk;
        });
        break;
      case 'risk-low':
        const riskOrderReverse = { critical: 4, high: 3, medium: 2, low: 1 };
        result.sort((a, b) => {
          const aRisk = a.riskLevel ? riskOrderReverse[a.riskLevel] : 0;
          const bRisk = b.riskLevel ? riskOrderReverse[b.riskLevel] : 0;
          return aRisk - bRisk;
        });
        break;
    }

    return result;
  }, [items, searchQuery, classificationFilter, riskFilter, sortBy]);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  /**
   * Handles clicking on a history item.
   * In multi-select mode, toggles selection.
   * Otherwise, loads the item into the editor.
   */
  const handleItemClick = (item: ClassificationResult) => {
    if (multiSelect) {
      // Toggle selection in multi-select mode
      const newSelected = new Set(selectedIds);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedIds(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    } else {
      // Load the item in regular mode
      onItemClick?.(item);
      // Scroll to top on mobile for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Toggles the expanded detail view for an item.
   */
  const handleToggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent item click
    setExpandedId(expandedId === id ? null : id);
  };

  /**
   * Clears all active filters.
   */
  const handleClearFilters = () => {
    setSearchQuery('');
    setClassificationFilter(null);
    setRiskFilter(null);
    setSortBy('newest');
  };

  /**
   * Selects or deselects all visible items.
   */
  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      // Deselect all
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      // Select all
      const allIds = new Set(filteredItems.map((item) => item.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  };

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================

  // Check if any filters are active
  const hasActiveFilters = searchQuery || classificationFilter || riskFilter || sortBy !== 'newest';

  // ===========================================================================
  // RENDER - EMPTY STATE
  // ===========================================================================

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {/* Clock icon for empty history */}
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
        <p className="text-sm font-medium">No history yet</p>
        <p className="text-xs mt-1 text-gray-600">
          Your analyzed code snippets will appear here
        </p>
      </div>
    );
  }

  // ===========================================================================
  // RENDER - MAIN COMPONENT
  // ===========================================================================

  return (
    <div className="flex flex-col h-full">
      {/* =====================================================================
          FILTER CONTROLS
          ===================================================================== */}
      <div className="p-3 border-b border-gray-700 space-y-3">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter buttons row */}
        <div className="flex flex-wrap gap-2">
          {/* Classification filter buttons */}
          <button
            onClick={() => setClassificationFilter(classificationFilter === 'client-only' ? null : 'client-only')}
            className={cn(
              'px-2 py-1 text-xs rounded-full border transition-colors',
              classificationFilter === 'client-only'
                ? 'bg-client-500/20 border-client-500 text-client-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500'
            )}
          >
            Client
          </button>
          <button
            onClick={() => setClassificationFilter(classificationFilter === 'server-only' ? null : 'server-only')}
            className={cn(
              'px-2 py-1 text-xs rounded-full border transition-colors',
              classificationFilter === 'server-only'
                ? 'bg-server-500/20 border-server-500 text-server-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500'
            )}
          >
            Server
          </button>
          <button
            onClick={() => setClassificationFilter(classificationFilter === 'both' ? null : 'both')}
            className={cn(
              'px-2 py-1 text-xs rounded-full border transition-colors',
              classificationFilter === 'both'
                ? 'bg-both-500/20 border-both-500 text-both-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500'
            )}
          >
            Both
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-700 self-center" />

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="risk-high">Risk: High</option>
            <option value="risk-low">Risk: Low</option>
          </select>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Multi-select controls */}
        {multiSelect && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <button
              onClick={handleSelectAll}
              className="hover:text-gray-300 transition-colors"
            >
              {selectedIds.size === filteredItems.length ? 'Deselect All' : 'Select All'}
            </button>
            <span>{selectedIds.size} selected</span>
          </div>
        )}
      </div>

      {/* =====================================================================
          RESULTS COUNT
          ===================================================================== */}
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-800">
        {filteredItems.length} of {items.length} analyses
      </div>

      {/* =====================================================================
          HISTORY LIST
          ===================================================================== */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        {filteredItems.length === 0 ? (
          // No results after filtering
          <div className="p-4 text-center text-gray-500 text-sm">
            No matches found
          </div>
        ) : (
          // Render filtered items
          filteredItems.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              isExpanded={expandedId === item.id}
              multiSelect={multiSelect}
              onClick={() => handleItemClick(item)}
              onToggleExpand={(e) => handleToggleExpand(e, item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HISTORY ITEM SUB-COMPONENT
// =============================================================================

interface HistoryItemProps {
  item: ClassificationResult;
  isSelected: boolean;
  isExpanded: boolean;
  multiSelect: boolean;
  onClick: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}

/**
 * HistoryItem - individual history entry with expandable details.
 */
function HistoryItem({
  item,
  isSelected,
  isExpanded,
  multiSelect,
  onClick,
  onToggleExpand,
}: HistoryItemProps) {
  // Get color classes for classification and risk
  const classColors = getClassificationColors(item.classification);
  const riskColors = item.riskLevel ? getRiskColors(item.riskLevel) : null;

  // Count patterns if available
  const patternCount = item.patterns?.length || 0;

  return (
    <div
      className={cn(
        'transition-colors duration-150',
        isSelected && 'bg-blue-900/20'
      )}
    >
      {/* Main clickable area */}
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 text-left hover:bg-gray-800/50 focus:outline-none focus:bg-gray-800/50 transition-colors',
          isSelected && 'hover:bg-blue-900/30'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Multi-select checkbox or classification dot */}
          {multiSelect ? (
            <div
              className={cn(
                'w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center',
                isSelected
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-600'
              )}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
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
              )}
            </div>
          ) : (
            <div
              className={cn(
                'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                classColors.bg
              )}
              title={CLASSIFICATION_LABELS[item.classification]}
            />
          )}

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Code preview */}
            <p className="text-sm text-gray-300 font-mono truncate">
              {truncateCode(item.code, 50)}
            </p>

            {/* Meta info row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Classification badge */}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  classColors.bgLight,
                  classColors.text
                )}
              >
                {CLASSIFICATION_LABELS[item.classification]}
              </span>

              {/* Risk level badge (if available) */}
              {riskColors && item.riskLevel !== 'low' && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    riskColors.bgLight,
                    riskColors.text
                  )}
                >
                  {RISK_LABELS[item.riskLevel!]}
                </span>
              )}

              {/* Pattern count (if patterns detected) */}
              {patternCount > 0 && (
                <span className="text-xs text-gray-500">
                  {patternCount} pattern{patternCount !== 1 ? 's' : ''}
                </span>
              )}

              {/* Batch indicator */}
              {item.batchId && (
                <span className="text-xs text-purple-400">
                  batch
                </span>
              )}

              {/* Timestamp */}
              <span className="text-xs text-gray-500 ml-auto">
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={onToggleExpand}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
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
        </div>
      </button>

      {/* Expanded details panel */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-800 bg-gray-800/30">
          {/* Explanation */}
          <div className="pt-3">
            <p className="text-xs text-gray-500 mb-1">Explanation</p>
            <p className="text-sm text-gray-300">{item.explanation}</p>
          </div>

          {/* Detected patterns */}
          {patternCount > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Detected Patterns</p>
              <div className="flex flex-wrap gap-1">
                {item.patterns!.slice(0, 5).map((pattern, index) => (
                  <span
                    key={`${pattern.name}-${index}`}
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-mono',
                      pattern.environment === 'client'
                        ? 'bg-client-500/20 text-client-400'
                        : pattern.environment === 'server'
                        ? 'bg-server-500/20 text-server-400'
                        : 'bg-gray-700 text-gray-300'
                    )}
                  >
                    {pattern.name}
                  </span>
                ))}
                {patternCount > 5 && (
                  <span className="text-xs text-gray-500">
                    +{patternCount - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Suggestions preview */}
          {item.suggestions && item.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {item.suggestions.length} Suggestion{item.suggestions.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400">
                {item.suggestions[0].title}
                {item.suggestions.length > 1 && ` (+${item.suggestions.length - 1} more)`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
