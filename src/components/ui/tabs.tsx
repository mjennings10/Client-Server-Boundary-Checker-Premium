// =============================================================================
// TABS COMPONENT - Shadcn UI Style
// =============================================================================
// A tabs component built on Radix UI primitives.
// Provides accessible, keyboard-navigable tab interfaces.
//
// COMPONENTS:
// - Tabs: Root container managing tab state
// - TabsList: Container for tab triggers
// - TabsTrigger: Clickable tab button
// - TabsContent: Content panel for each tab
//
// ACCESSIBILITY:
// - Full keyboard navigation (Arrow keys, Home, End)
// - ARIA attributes for screen readers
// - Focus management
// =============================================================================

'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

// =============================================================================
// TABS ROOT
// =============================================================================

/**
 * Tabs root component.
 * Manages the active tab state.
 *
 * USAGE:
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 */
const Tabs = TabsPrimitive.Root;

// =============================================================================
// TABS LIST
// =============================================================================

/**
 * TabsList component - container for tab triggers.
 * Styled as a horizontal button group.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Container styling - inline flex with gap
      'inline-flex h-10 items-center justify-center rounded-md bg-gray-800 p-1 text-gray-400',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// =============================================================================
// TABS TRIGGER
// =============================================================================

/**
 * TabsTrigger component - clickable tab button.
 * Shows active state when its tab is selected.
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base trigger styling
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-gray-900 transition-all',
      // Focus styling
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      // Disabled styling
      'disabled:pointer-events-none disabled:opacity-50',
      // Active state styling
      'data-[state=active]:bg-gray-900 data-[state=active]:text-gray-100 data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// =============================================================================
// TABS CONTENT
// =============================================================================

/**
 * TabsContent component - content panel for each tab.
 * Only visible when its associated tab is active.
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Content panel styling
      'mt-2 ring-offset-gray-900',
      // Focus styling
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// =============================================================================
// EXPORTS
// =============================================================================

export { Tabs, TabsList, TabsTrigger, TabsContent };
