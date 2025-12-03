// =============================================================================
// PROGRESS COMPONENT - Shadcn UI Style
// =============================================================================
// A progress bar component built on Radix UI primitives.
// Shows visual indication of task completion.
//
// FEATURES:
// - Animated fill based on value prop
// - Customizable colors
// - Accessible with ARIA attributes
// =============================================================================

'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

// =============================================================================
// PROGRESS COMPONENT
// =============================================================================

/**
 * Progress bar component.
 * Shows a horizontal bar that fills based on the value prop.
 *
 * USAGE:
 * <Progress value={50} />  // 50% complete
 * <Progress value={100} /> // 100% complete
 * <Progress value={0} />   // 0% complete (empty)
 *
 * The value prop should be between 0 and 100.
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // Container styling - the track
      'relative h-2 w-full overflow-hidden rounded-full bg-gray-700',
      className
    )}
    {...props}
  >
    {/* The fill indicator */}
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-blue-500 transition-all duration-300 ease-in-out"
      // Transform based on value - moves from left (hidden) to visible
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// =============================================================================
// PROGRESS VARIANTS
// =============================================================================

/**
 * Progress bar with different color variants.
 * Useful for showing different states (success, warning, error).
 */
interface ColoredProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Color variant for the progress bar */
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ColoredProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ColoredProgressProps
>(({ className, value, variant = 'default', ...props }, ref) => {
  // Map variants to Tailwind color classes
  const variantColors = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-700',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-all duration-300 ease-in-out',
          variantColors[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
ColoredProgress.displayName = 'ColoredProgress';

// =============================================================================
// PROGRESS WITH LABEL
// =============================================================================

/**
 * Progress bar with an integrated label.
 * Shows the percentage or custom label text.
 */
interface LabeledProgressProps extends ColoredProgressProps {
  /** Label text to display (defaults to percentage) */
  label?: string;
  /** Whether to show the percentage value */
  showPercentage?: boolean;
}

const LabeledProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  LabeledProgressProps
>(({ value, label, showPercentage = true, variant = 'default', className, ...props }, ref) => {
  const displayLabel = label || (showPercentage ? `${value || 0}%` : '');

  return (
    <div className="space-y-1">
      {/* Label row */}
      {displayLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{displayLabel}</span>
        </div>
      )}
      {/* Progress bar */}
      <ColoredProgress
        ref={ref}
        value={value}
        variant={variant}
        className={className}
        {...props}
      />
    </div>
  );
});
LabeledProgress.displayName = 'LabeledProgress';

// =============================================================================
// EXPORTS
// =============================================================================

export { Progress, ColoredProgress, LabeledProgress };
