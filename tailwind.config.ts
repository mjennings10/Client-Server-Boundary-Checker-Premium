// =============================================================================
// TAILWIND CSS CONFIGURATION - Client/Server Boundary Checker Premium
// =============================================================================
// Extended Tailwind configuration with custom colors, animations, and utilities.
//
// CUSTOM COLORS:
// - client: Red palette for client-only code
// - server: Blue palette for server-only code
// - both: Green palette for isomorphic code
//
// ANIMATIONS:
// - accordion-down/up: For collapsible accordion panels
// - fade-in: For smooth element appearance
// - slide-in: For panel sliding animations
// =============================================================================

import type { Config } from 'tailwindcss';

const config: Config = {
  // ===========================================================================
  // CONTENT PATHS
  // ===========================================================================
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ===========================================================================
  // THEME EXTENSIONS
  // ===========================================================================
  theme: {
    extend: {
      // =========================================================================
      // CUSTOM COLORS
      // =========================================================================
      colors: {
        // Client-only code color palette (red tones)
        client: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Server-only code color palette (blue tones)
        server: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Both/isomorphic code color palette (green tones)
        both: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },

      // =========================================================================
      // CUSTOM ANIMATIONS
      // =========================================================================
      keyframes: {
        // Accordion expand animation
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        // Accordion collapse animation
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Fade in animation
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Fade out animation
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        // Slide in from top
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        // Slide in from bottom
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        // Pulse animation for loading states
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        // Progress bar shimmer
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },

      // =========================================================================
      // TYPOGRAPHY
      // =========================================================================
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
      },

      // =========================================================================
      // SPACING & SIZING
      // =========================================================================
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },

  // ===========================================================================
  // PLUGINS
  // ===========================================================================
  plugins: [],
};

export default config;
