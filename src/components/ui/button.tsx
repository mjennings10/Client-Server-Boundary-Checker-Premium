// =============================================================================
// BUTTON COMPONENT - Shadcn UI Style
// =============================================================================
// A versatile button component with multiple variants and sizes.
// Built following Shadcn UI patterns for consistency.
//
// VARIANTS:
// - default: Primary blue button for main actions
// - secondary: Gray button for secondary actions
// - outline: Bordered button with transparent background
// - ghost: Minimal button for subtle actions
// - destructive: Red button for dangerous actions
//
// SIZES:
// - sm: Small button (h-8, text-xs)
// - default: Standard button (h-10, text-sm)
// - lg: Large button (h-12, text-base)
// - icon: Square button for icons only (h-10 w-10)
// =============================================================================

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// =============================================================================
// BUTTON VARIANTS
// =============================================================================
// Using class-variance-authority for type-safe variant handling.
// This creates a function that returns the appropriate classes.
// =============================================================================

const buttonVariants = cva(
  // Base classes applied to all buttons
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // Visual style variants
      variant: {
        // Primary action button - blue background
        default:
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',

        // Secondary action button - gray background
        secondary:
          'bg-gray-700 text-gray-100 hover:bg-gray-600 focus-visible:ring-gray-500',

        // Outlined button - transparent with border
        outline:
          'border border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white focus-visible:ring-gray-500',

        // Ghost button - no background until hover
        ghost:
          'bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white focus-visible:ring-gray-500',

        // Destructive action button - red for dangerous actions
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',

        // Link style button - looks like a link
        link: 'text-blue-400 underline-offset-4 hover:underline focus-visible:ring-blue-500',
      },

      // Size variants
      size: {
        // Small button
        sm: 'h-8 px-3 text-xs',

        // Default/medium button
        default: 'h-10 px-4',

        // Large button
        lg: 'h-12 px-6 text-base',

        // Icon-only button (square)
        icon: 'h-10 w-10',
      },
    },

    // Default values if not specified
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

/**
 * Button component props.
 * Extends native button props with variant options.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

/**
 * Button component.
 *
 * USAGE:
 * <Button>Click me</Button>
 * <Button variant="secondary">Cancel</Button>
 * <Button variant="destructive" size="sm">Delete</Button>
 * <Button isLoading>Saving...</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner - shown when isLoading is true */}
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {children}
      </button>
    );
  }
);

// Display name for React DevTools
Button.displayName = 'Button';

// Export component and variants helper
export { Button, buttonVariants };
