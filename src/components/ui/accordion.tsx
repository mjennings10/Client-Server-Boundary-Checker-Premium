// =============================================================================
// ACCORDION COMPONENT - Shadcn UI Style
// =============================================================================
// A collapsible accordion component built on Radix UI primitives.
// Allows users to expand/collapse sections of content.
//
// COMPONENTS:
// - Accordion: Root container (single or multiple items)
// - AccordionItem: Individual collapsible section
// - AccordionTrigger: Clickable header to toggle content
// - AccordionContent: The collapsible content panel
//
// FEATURES:
// - Single or multiple items can be open
// - Smooth animation on expand/collapse
// - Full keyboard navigation
// - Accessible with ARIA attributes
// =============================================================================

'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

// =============================================================================
// ACCORDION ROOT
// =============================================================================

/**
 * Accordion root component.
 * Can be configured for single or multiple open items.
 *
 * USAGE (Single - only one open at a time):
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">...</AccordionItem>
 * </Accordion>
 *
 * USAGE (Multiple - any number open):
 * <Accordion type="multiple">
 *   <AccordionItem value="item-1">...</AccordionItem>
 * </Accordion>
 */
const Accordion = AccordionPrimitive.Root;

// =============================================================================
// ACCORDION ITEM
// =============================================================================

/**
 * AccordionItem component - individual collapsible section.
 * Wraps a trigger and content pair.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      // Item styling - border between items
      'border-b border-gray-700',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

// =============================================================================
// ACCORDION TRIGGER
// =============================================================================

/**
 * AccordionTrigger component - the clickable header.
 * Includes a chevron icon that rotates on expand.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // Base trigger styling
        'flex flex-1 items-center justify-between py-4 font-medium text-gray-200 transition-all hover:text-white',
        // Focus styling
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
        // Chevron rotation on open
        '[&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      {/* Chevron icon - rotates when open */}
      <svg
        className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200"
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
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// =============================================================================
// ACCORDION CONTENT
// =============================================================================

/**
 * AccordionContent component - the collapsible content panel.
 * Animates smoothly when expanding/collapsing.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      // Animation classes for expand/collapse
      'overflow-hidden text-sm text-gray-300 transition-all',
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className
    )}
    {...props}
  >
    {/* Content wrapper with padding */}
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// =============================================================================
// EXPORTS
// =============================================================================

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
