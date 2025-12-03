// =============================================================================
// SERVER ACTIONS BARREL - Client/Server Boundary Checker Premium
// =============================================================================
// This file re-exports all server actions from the modular actions directory.
// This provides a single import point for all server actions.
//
// USAGE:
// import { classifyBoundary, getHistory, getConfig } from '@/app/actions';
// =============================================================================

'use server';

// Re-export everything from the modular actions
export * from './actions/index';
