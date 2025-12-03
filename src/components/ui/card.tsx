// =============================================================================
// CARD COMPONENT - Shadcn UI Style
// =============================================================================
// A flexible card component for grouping related content.
// Composed of multiple sub-components for flexibility.
//
// COMPONENTS:
// - Card: The main container
// - CardHeader: Top section with title and description
// - CardTitle: The card's title
// - CardDescription: Subtitle or description text
// - CardContent: Main content area
// - CardFooter: Bottom section for actions
// =============================================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// CARD CONTAINER
// =============================================================================

/**
 * Card component - the main container.
 * Provides a bordered, rounded container with dark theme styling.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base card styles
      'rounded-lg border border-gray-700 bg-gray-900 text-gray-100 shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

// =============================================================================
// CARD HEADER
// =============================================================================

/**
 * CardHeader component - top section of the card.
 * Contains the title and optional description.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Spacing and flex layout for header
      'flex flex-col space-y-1.5 p-6',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// =============================================================================
// CARD TITLE
// =============================================================================

/**
 * CardTitle component - the main heading of the card.
 * Rendered as an h3 for semantic HTML.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // Title typography
      'text-lg font-semibold leading-none tracking-tight text-gray-100',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// =============================================================================
// CARD DESCRIPTION
// =============================================================================

/**
 * CardDescription component - subtitle or description text.
 * Muted styling to differentiate from the title.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      // Muted description styling
      'text-sm text-gray-400',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// =============================================================================
// CARD CONTENT
// =============================================================================

/**
 * CardContent component - main content area of the card.
 * Padding but no top padding (header handles spacing).
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Content padding (no top padding - header has bottom padding)
      'p-6 pt-0',
      className
    )}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

// =============================================================================
// CARD FOOTER
// =============================================================================

/**
 * CardFooter component - bottom section for actions.
 * Flexbox layout for button alignment.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Footer with flex layout for actions
      'flex items-center p-6 pt-0',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
