// =============================================================================
// CONFIGURATION SERVER ACTIONS - Client/Server Boundary Checker Premium
// =============================================================================
// This file contains server actions for managing user configuration.
//
// KEY ACTIONS:
// - getConfig: Get current user configuration
// - updateConfig: Update user configuration
// - resetConfig: Reset to default settings
//
// ARCHITECTURE NOTES:
// - Configuration is stored as a singleton in the database
// - Only one config row exists with id="default"
// - Config changes are tracked in analytics
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { prisma, getUserConfig, updateUserConfig, recordAnalyticsEvent } from '@/lib/db';
import type {
  UserConfig,
  UserConfigUpdate,
  AnalysisDepth,
  FrameworkMode,
  StrictnessLevel,
} from '@/types';

// =============================================================================
// CONFIGURATION ACTIONS
// =============================================================================

/**
 * Gets the current user configuration.
 * Creates default config if none exists.
 *
 * DEFAULT VALUES:
 * - analysisDepth: "standard"
 * - frameworkMode: "app-router"
 * - strictnessLevel: "standard"
 *
 * @returns Current user configuration
 */
export async function getConfig(): Promise<UserConfig> {
  const config = await getUserConfig();

  return {
    id: config.id,
    analysisDepth: config.analysisDepth as AnalysisDepth,
    frameworkMode: config.frameworkMode as FrameworkMode,
    strictnessLevel: config.strictnessLevel as StrictnessLevel,
    updatedAt: config.updatedAt,
  };
}

/**
 * Updates the user configuration.
 * Only specified fields are updated - others remain unchanged.
 *
 * @param updates - Partial configuration to update
 * @returns Updated configuration
 */
export async function updateConfig(
  updates: UserConfigUpdate
): Promise<UserConfig> {
  // Validate inputs
  if (updates.analysisDepth) {
    const validDepths: AnalysisDepth[] = ['quick', 'standard', 'comprehensive'];
    if (!validDepths.includes(updates.analysisDepth)) {
      throw new Error(`Invalid analysis depth: ${updates.analysisDepth}`);
    }
  }

  if (updates.frameworkMode) {
    const validModes: FrameworkMode[] = ['app-router', 'pages-router'];
    if (!validModes.includes(updates.frameworkMode)) {
      throw new Error(`Invalid framework mode: ${updates.frameworkMode}`);
    }
  }

  if (updates.strictnessLevel) {
    const validLevels: StrictnessLevel[] = ['lenient', 'standard', 'strict'];
    if (!validLevels.includes(updates.strictnessLevel)) {
      throw new Error(`Invalid strictness level: ${updates.strictnessLevel}`);
    }
  }

  // Perform update
  const updated = await updateUserConfig(updates);

  // Record analytics event
  await recordAnalyticsEvent('config_change', {
    changes: updates,
  });

  // Revalidate pages that depend on config
  revalidatePath('/');

  return {
    id: updated.id,
    analysisDepth: updated.analysisDepth as AnalysisDepth,
    frameworkMode: updated.frameworkMode as FrameworkMode,
    strictnessLevel: updated.strictnessLevel as StrictnessLevel,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Resets configuration to default values.
 *
 * @returns Reset configuration
 */
export async function resetConfig(): Promise<UserConfig> {
  const defaultConfig = {
    analysisDepth: 'standard' as const,
    frameworkMode: 'app-router' as const,
    strictnessLevel: 'standard' as const,
  };

  const updated = await updateUserConfig(defaultConfig);

  // Record analytics event
  await recordAnalyticsEvent('config_change', {
    action: 'reset',
    changes: defaultConfig,
  });

  revalidatePath('/');

  return {
    id: updated.id,
    analysisDepth: updated.analysisDepth as AnalysisDepth,
    frameworkMode: updated.frameworkMode as FrameworkMode,
    strictnessLevel: updated.strictnessLevel as StrictnessLevel,
    updatedAt: updated.updatedAt,
  };
}

// =============================================================================
// CONFIGURATION OPTIONS
// =============================================================================
// These constants define the available options for each setting.
// Used by the UI to render option lists.
// =============================================================================

/**
 * Available analysis depth options with descriptions.
 */
export const ANALYSIS_DEPTH_OPTIONS = [
  {
    value: 'quick' as const,
    label: 'Quick',
    description: 'Basic classification only. Fastest option.',
  },
  {
    value: 'standard' as const,
    label: 'Standard',
    description: 'Full pipeline with patterns, risk, and suggestions.',
  },
  {
    value: 'comprehensive' as const,
    label: 'Comprehensive',
    description: 'Maximum detail with code examples. Uses more API calls.',
  },
];

/**
 * Available framework mode options with descriptions.
 */
export const FRAMEWORK_MODE_OPTIONS = [
  {
    value: 'app-router' as const,
    label: 'App Router',
    description: 'Next.js 13+ with Server Components.',
  },
  {
    value: 'pages-router' as const,
    label: 'Pages Router',
    description: 'Traditional Next.js with SSR/SSG.',
  },
];

/**
 * Available strictness level options with descriptions.
 */
export const STRICTNESS_LEVEL_OPTIONS = [
  {
    value: 'lenient' as const,
    label: 'Lenient',
    description: 'Only flag definite violations.',
  },
  {
    value: 'standard' as const,
    label: 'Standard',
    description: 'Flag violations and warnings.',
  },
  {
    value: 'strict' as const,
    label: 'Strict',
    description: 'Flag any potential issues.',
  },
];
