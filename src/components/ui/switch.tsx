// =============================================================================
// SWITCH COMPONENT - Shadcn UI Style
// =============================================================================
// A toggle switch component built on Radix UI primitives.
// Provides a boolean on/off control.
//
// FEATURES:
// - Accessible with keyboard navigation
// - Smooth animation between states
// - ARIA attributes for screen readers
// - Controllable and uncontrolled modes
// =============================================================================

'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

// =============================================================================
// SWITCH COMPONENT
// =============================================================================

/**
 * Switch component - a toggle control.
 *
 * USAGE (Uncontrolled):
 * <Switch defaultChecked={true} />
 *
 * USAGE (Controlled):
 * <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
 *
 * USAGE (With label):
 * <label className="flex items-center gap-2">
 *   <Switch />
 *   <span>Enable feature</span>
 * </label>
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      // Base switch track styling
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
      // Focus styling
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
      // Disabled styling
      'disabled:cursor-not-allowed disabled:opacity-50',
      // State-based colors
      'data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600',
      className
    )}
    {...props}
    ref={ref}
  >
    {/* The thumb - the circular toggle button */}
    <SwitchPrimitive.Thumb
      className={cn(
        // Thumb styling
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
        // Position based on state
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

// =============================================================================
// LABELED SWITCH
// =============================================================================

/**
 * LabeledSwitch - switch with integrated label.
 * Provides a more complete control with label and description.
 */
interface LabeledSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Label text */
  label: string;
  /** Optional description text */
  description?: string;
}

const LabeledSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  LabeledSwitchProps
>(({ label, description, className, id, ...props }, ref) => {
  // Generate ID if not provided
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <div className="flex items-start gap-3">
      <Switch ref={ref} id={switchId} className={className} {...props} />
      <div className="space-y-0.5">
        <label
          htmlFor={switchId}
          className="text-sm font-medium text-gray-200 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
});
LabeledSwitch.displayName = 'LabeledSwitch';

// =============================================================================
// EXPORTS
// =============================================================================

export { Switch, LabeledSwitch };
