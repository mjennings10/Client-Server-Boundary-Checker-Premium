// =============================================================================
// TOOLTIP COMPONENT - Shadcn UI Style
// =============================================================================
// A tooltip component built on Radix UI primitives.
// Shows additional information on hover.
//
// COMPONENTS:
// - TooltipProvider: Context provider for tooltips
// - Tooltip: Root container for a single tooltip
// - TooltipTrigger: Element that triggers the tooltip
// - TooltipContent: The tooltip popup content
//
// FEATURES:
// - Delayed show/hide for better UX
// - Keyboard accessible (focus shows tooltip)
// - Customizable positioning
// - Portal rendering to avoid overflow issues
// =============================================================================

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// =============================================================================
// TOOLTIP PROVIDER
// =============================================================================

/**
 * TooltipProvider - wraps the app to enable tooltips.
 * Should be placed near the root of your app.
 *
 * USAGE:
 * <TooltipProvider>
 *   <App />
 * </TooltipProvider>
 *
 * Props:
 * - delayDuration: Time before tooltip shows (default: 400ms)
 * - skipDelayDuration: Time to skip delay after recent show (default: 300ms)
 */
const TooltipProvider = TooltipPrimitive.Provider;

// =============================================================================
// TOOLTIP ROOT
// =============================================================================

/**
 * Tooltip root component.
 * Wraps trigger and content pair.
 */
const Tooltip = TooltipPrimitive.Root;

// =============================================================================
// TOOLTIP TRIGGER
// =============================================================================

/**
 * TooltipTrigger - element that shows the tooltip on hover/focus.
 * Usually wraps a button or icon.
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

// =============================================================================
// TOOLTIP CONTENT
// =============================================================================

/**
 * TooltipContent - the popup content of the tooltip.
 * Rendered in a portal to avoid overflow issues.
 *
 * USAGE:
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Base tooltip styling
        'z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-gray-100 shadow-md border border-gray-700',
        // Animation classes
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        // Position-based slide animations
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// =============================================================================
// EXPORTS
// =============================================================================

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
