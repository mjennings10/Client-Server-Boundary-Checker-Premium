// =============================================================================
// CONFIGURATION PANEL COMPONENT - Client/Server Boundary Checker Premium
// =============================================================================
// This component provides the user interface for configuring analysis settings.
// Users can adjust analysis depth, framework mode, and strictness level.
//
// FEATURES:
// - Real-time configuration updates
// - Visual feedback for changes
// - Reset to defaults option
// - Persistent storage via server actions
//
// SETTINGS:
// 1. Analysis Depth: How thorough the analysis should be
//    - Quick: Basic classification only
//    - Standard: Full pipeline with suggestions
//    - Comprehensive: Maximum detail with examples
//
// 2. Framework Mode: Target Next.js framework
//    - App Router: Next.js 13+ with RSC
//    - Pages Router: Traditional SSR/SSG
//
// 3. Strictness Level: How aggressively to flag issues
//    - Lenient: Only definite violations
//    - Standard: Violations and warnings
//    - Strict: Any potential issues
// =============================================================================

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  getConfig,
  updateConfig,
  resetConfig,
  ANALYSIS_DEPTH_OPTIONS,
  FRAMEWORK_MODE_OPTIONS,
  STRICTNESS_LEVEL_OPTIONS,
} from '@/app/actions';
import type { AnalysisDepth, FrameworkMode, StrictnessLevel, UserConfig } from '@/types';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

interface ConfigPanelProps {
  /** Whether the panel is in a collapsed state */
  collapsed?: boolean;
  /** Callback when config changes (for parent component awareness) */
  onConfigChange?: (config: UserConfig) => void;
}

// =============================================================================
// CONFIGURATION PANEL COMPONENT
// =============================================================================

/**
 * ConfigPanel - user settings configuration interface.
 *
 * USAGE:
 * <ConfigPanel />
 * <ConfigPanel collapsed={true} />
 * <ConfigPanel onConfigChange={(config) => console.log(config)} />
 */
export default function ConfigPanel({
  collapsed = false,
  onConfigChange,
}: ConfigPanelProps) {
  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  // Current configuration values
  const [config, setConfig] = useState<UserConfig | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Track if there are unsaved changes (for visual feedback)
  const [hasChanges, setHasChanges] = useState(false);

  // ===========================================================================
  // LOAD INITIAL CONFIG
  // ===========================================================================

  useEffect(() => {
    async function loadConfig() {
      try {
        const loadedConfig = await getConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, []);

  // ===========================================================================
  // UPDATE HANDLERS
  // ===========================================================================

  /**
   * Handles changes to the analysis depth setting.
   * Updates both local state and server state.
   */
  const handleAnalysisDepthChange = (value: AnalysisDepth) => {
    if (!config) return;

    startTransition(async () => {
      try {
        const updated = await updateConfig({ analysisDepth: value });
        setConfig(updated);
        onConfigChange?.(updated);
      } catch (error) {
        console.error('Failed to update analysis depth:', error);
      }
    });
  };

  /**
   * Handles changes to the framework mode setting.
   */
  const handleFrameworkModeChange = (value: FrameworkMode) => {
    if (!config) return;

    startTransition(async () => {
      try {
        const updated = await updateConfig({ frameworkMode: value });
        setConfig(updated);
        onConfigChange?.(updated);
      } catch (error) {
        console.error('Failed to update framework mode:', error);
      }
    });
  };

  /**
   * Handles changes to the strictness level setting.
   */
  const handleStrictnessLevelChange = (value: StrictnessLevel) => {
    if (!config) return;

    startTransition(async () => {
      try {
        const updated = await updateConfig({ strictnessLevel: value });
        setConfig(updated);
        onConfigChange?.(updated);
      } catch (error) {
        console.error('Failed to update strictness level:', error);
      }
    });
  };

  /**
   * Resets configuration to default values.
   */
  const handleReset = () => {
    startTransition(async () => {
      try {
        const reset = await resetConfig();
        setConfig(reset);
        onConfigChange?.(reset);
      } catch (error) {
        console.error('Failed to reset config:', error);
      }
    });
  };

  // ===========================================================================
  // RENDER - LOADING STATE
  // ===========================================================================

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded" />
            <div className="h-10 bg-gray-800 rounded" />
            <div className="h-10 bg-gray-800 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===========================================================================
  // RENDER - COLLAPSED STATE
  // ===========================================================================

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {/* Settings icon */}
        <svg
          className="h-4 w-4"
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
        <span>
          {config?.analysisDepth} | {config?.frameworkMode} | {config?.strictnessLevel}
        </span>
      </div>
    );
  }

  // ===========================================================================
  // RENDER - FULL PANEL
  // ===========================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {/* Settings icon */}
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
              Analysis Settings
            </CardTitle>
            <CardDescription>
              Configure how code is analyzed
            </CardDescription>
          </div>

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ===================================================================
            ANALYSIS DEPTH SETTING
            =================================================================== */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Analysis Depth
          </label>
          <Select
            value={config?.analysisDepth}
            onValueChange={handleAnalysisDepthChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select depth" />
            </SelectTrigger>
            <SelectContent>
              {ANALYSIS_DEPTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {ANALYSIS_DEPTH_OPTIONS.find(
              (o) => o.value === config?.analysisDepth
            )?.description}
          </p>
        </div>

        {/* ===================================================================
            FRAMEWORK MODE SETTING
            =================================================================== */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Framework Mode
          </label>
          <Select
            value={config?.frameworkMode}
            onValueChange={handleFrameworkModeChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              {FRAMEWORK_MODE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {FRAMEWORK_MODE_OPTIONS.find(
              (o) => o.value === config?.frameworkMode
            )?.description}
          </p>
        </div>

        {/* ===================================================================
            STRICTNESS LEVEL SETTING
            =================================================================== */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Strictness Level
          </label>
          <Select
            value={config?.strictnessLevel}
            onValueChange={handleStrictnessLevelChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select strictness" />
            </SelectTrigger>
            <SelectContent>
              {STRICTNESS_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {STRICTNESS_LEVEL_OPTIONS.find(
              (o) => o.value === config?.strictnessLevel
            )?.description}
          </p>
        </div>

        {/* ===================================================================
            LOADING INDICATOR
            =================================================================== */}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
