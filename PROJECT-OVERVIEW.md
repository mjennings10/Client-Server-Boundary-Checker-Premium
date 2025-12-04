# Project Overview: Client/Server Boundary Checker Premium

---

## 1. PROJECT OVERVIEW

The Client/Server Boundary Checker Premium is a developer tool that analyzes JavaScript and TypeScript code to determine whether it should execute on the client (browser), server (Node.js), or safely in both environments. This distinction is critical in Next.js App Router applications where React Server Components create a hard boundary between execution contexts. Code that crosses this boundary incorrectly will fail at runtime, expose security vulnerabilities, or degrade performance.

The system works by accepting code snippets through a syntax-highlighted editor and running them through a five-step AI-powered analysis pipeline. The first step classifies the code into one of three categories: client-only, server-only, or both. Subsequent steps detect specific patterns (hooks, browser APIs, Node.js modules), assess risk levels, generate refactoring suggestions, and provide code examples. All analysis results are persisted to a SQLite database via Prisma, enabling history tracking, batch processing, and analytics visualization.

This premium version extends the base application with seven production-grade features: database persistence, multi-step pipeline analysis, Prism.js syntax highlighting, a configuration panel, batch analysis mode, an analytics dashboard, and multi-format export. Each feature is designed both for practical use and as a learning exercise in modern Next.js architecture. The codebase is heavily documented with inline comments explaining every architectural decision.

---

## 2. WHAT A DEVELOPER WILL LEARN

### Backend Engineering
- Implementing modular Server Actions with barrel exports
- Building multi-step analysis pipelines with error recovery
- Creating batch processing systems with in-memory state caching
- Designing singleton configuration patterns for user settings
- Structuring server-side validation and error handling

### Frontend Engineering
- Building dual-layer code editors (invisible textarea + visible overlay)
- Integrating Prism.js for real-time syntax highlighting
- Implementing tab-based navigation with Radix UI primitives
- Creating accessible UI components following Shadcn patterns
- Managing complex client state with React hooks and transitions
- Building responsive layouts with Tailwind CSS

### AI / OpenAI Integration
- Structuring prompts for deterministic classification tasks
- Parsing JSON responses from GPT-4o-mini
- Handling API errors, rate limits, and fallback strategies
- Designing multi-step AI pipelines where each step builds on previous results
- Balancing analysis depth with API cost and latency

### Database and ORM
- Designing Prisma schemas for SQLite databases
- Implementing singleton patterns for configuration storage
- Storing JSON data in relational columns
- Writing aggregation queries for analytics dashboards
- Managing database migrations and seeding

### Architecture and Patterns
- Separating concerns with modular action files
- Creating comprehensive TypeScript type definitions
- Building pattern detection engines with regex
- Implementing progress tracking for long-running operations
- Designing extensible pipeline architectures

### Performance and Optimizations
- Using React transitions for non-blocking UI updates
- Implementing parallel data fetching with Promise.all
- Memoizing expensive computations with useMemo
- Optimizing re-renders with proper state management

### Developer Experience
- Writing self-documenting code with inline comments
- Creating field notes for architectural decisions
- Building configuration panels for customizable behavior
- Implementing export functionality for data portability

---

## 3. KEY FEATURES

### Core Functionality
- Three-way code classification: client-only, server-only, or both
- AI-powered analysis using OpenAI GPT-4o-mini
- Detailed explanations for every classification decision
- Pattern-based static analysis with 60+ pattern definitions

### Multi-Step Pipeline
- Five-stage analysis: Classification, Pattern Detection, Risk Assessment, Suggestions, Examples
- Configurable analysis depth: quick, standard, comprehensive
- Per-step timing and error tracking
- Visual progress indicator with step status

### Code Editor
- Prism.js syntax highlighting for TypeScript/JSX
- Line numbers in editor gutter
- Tab key indentation support
- Keyboard shortcut for analysis (Ctrl+Enter)
- Scroll synchronization between textarea and highlight overlay

### Configuration System
- Analysis depth selection (quick/standard/comprehensive)
- Framework mode toggle (App Router/Pages Router)
- Strictness level adjustment (lenient/standard/strict)
- Persistent settings stored in database

### Batch Analysis
- Analyze multiple code snippets in one operation
- Delimiter-based snippet parsing
- Progress tracking per snippet
- Aggregated results display

### History Management
- Searchable analysis history
- Filter by classification type
- Sort by date or risk level
- Click-to-reload previous analyses
- Expandable detail view per item

### Analytics Dashboard
- Classification distribution visualization
- Risk level breakdown chart
- Top detected patterns list
- Recent activity feed
- Time-series trend data

### Export System
- Export to Markdown, JSON, or CSV formats
- Configurable content inclusion (code, details, suggestions)
- Download file or copy to clipboard
- Batch export of filtered history

### UI Components (Shadcn-style)
- Accessible tabs, selects, accordions, switches
- Progress bars with animation
- Tooltips for contextual help
- Cards for content grouping
- Buttons with loading states and variants

### Database Layer
- Prisma ORM with SQLite backend
- Three models: BoundaryCheck, AnalyticsEvent, UserConfig
- JSON columns for structured data storage
- Query utilities for aggregation

---

## 4. TECH STACK

### Framework
- Next.js 14 (App Router)
- React 18 (Server Components)

### Language
- TypeScript 5.3
- JavaScript ES2022

### Styling
- Tailwind CSS 3.4
- PostCSS / Autoprefixer
- Custom CSS for Prism.js theme

### State and Data
- React useState/useTransition
- Server Actions for mutations
- useMemo for derived state

### AI Integration
- OpenAI SDK 4.28
- GPT-4o-mini model
- JSON response format

### Database
- Prisma 5.10 ORM
- SQLite (file-based)
- JSON column support

### UI Primitives
- Radix UI (Tabs, Select, Accordion, Switch, Tooltip, Progress, Slider)
- class-variance-authority (component variants)
- clsx / tailwind-merge (class utilities)

### Utilities
- Prism.js 1.29 (syntax highlighting)
- Recharts 2.12 (analytics charts)

### Build and Deployment
- Vercel-compatible configuration
- ESLint with Next.js config
- Prisma generate in build step

---

## 5. WHAT A DEVELOPER WILL BUILD (STEP-BY-STEP)

### Phase 1: Foundation
1. Initialize Next.js 14 project with App Router and TypeScript
2. Configure Tailwind CSS with custom color palette (client/server/both)
3. Set up Prisma with SQLite and define database schema
4. Create comprehensive TypeScript type definitions in `src/types/index.ts`
5. Build utility functions library (`cn`, `formatTimeAgo`, `truncate`, color helpers)

### Phase 2: Core Analysis
6. Create OpenAI client wrapper with error handling
7. Build the main `classifyBoundary` server action with system prompt
8. Implement JSON response parsing and validation
9. Create basic code editor component with textarea
10. Build result display component with classification badges

### Phase 3: Premium Pipeline
11. Create pattern detection engine with 60+ regex patterns
12. Build five-step analysis pipeline orchestrator
13. Implement pipeline progress visualization component
14. Add premium analysis action with pipeline integration
15. Create risk assessment logic based on pattern severity

### Phase 4: Syntax Highlighting
16. Integrate Prism.js with TypeScript/JSX language support
17. Build dual-layer editor (invisible textarea + visible pre)
18. Implement scroll synchronization between layers
19. Add line numbers gutter component
20. Create custom Prism theme matching application colors

### Phase 5: UI Components
21. Build Button component with variants and loading state
22. Create Card component for content containers
23. Implement Tabs component with Radix UI
24. Build Select dropdown with Radix primitives
25. Create Progress bar component
26. Implement Accordion for collapsible content
27. Build Switch toggle component
28. Add Tooltip component for help text

### Phase 6: Configuration
29. Create UserConfig database model with singleton pattern
30. Build getConfig/updateConfig/resetConfig server actions
31. Create ConfigPanel component with dropdowns
32. Implement settings persistence and loading

### Phase 7: History and Filtering
33. Build enhanced History component with search
34. Add classification filter buttons
35. Implement sort options (newest, oldest, risk)
36. Create expandable detail view for history items
37. Add click-to-reload functionality

### Phase 8: Batch Processing
38. Create batch analysis server actions with state caching
39. Build BatchAnalysis component with multi-snippet input
40. Implement delimiter parsing for snippet separation
41. Add progress tracking with polling
42. Create batch results display

### Phase 9: Analytics
43. Build analytics aggregation queries
44. Create AnalyticsDashboard component
45. Implement classification distribution visualization
46. Add risk breakdown chart
47. Build top patterns list
48. Create recent activity feed

### Phase 10: Export
49. Implement Markdown export formatter
50. Create JSON export with full data
51. Build CSV export for spreadsheet compatibility
52. Create ExportPanel component with format selection
53. Add download and clipboard copy functionality

### Phase 11: Integration
54. Build MainContent orchestrator component with tabs
55. Update main page with Server Component data fetching
56. Connect all components with proper prop passing
57. Add Premium badge and header stats
58. Create classification legend in sidebar

### Phase 12: Documentation
59. Write field-notes.md with architectural decisions
60. Create FILMING-GUIDE.md for demo recordings
61. Add inline comments throughout codebase
62. Document all TypeScript types and interfaces

---

## 6. PROJECT STATS

**Lines of Code** — 10,229

**TypeScript Files** — 32

**React Components** — 17

**Server Action Modules** — 6

**Database Models** — 3

**Pattern Definitions** — 66

**Documentation Lines** — 1,922 (field-notes.md + FILMING-GUIDE.md)

---

## Additional Context

### File Structure
```
src/
├── app/
│   ├── actions/          # 6 modular server action files
│   ├── globals.css       # Tailwind + Prism theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page (Server Component)
├── components/
│   ├── ui/               # 8 Shadcn-style primitives
│   └── [features]        # 9 feature components
├── lib/
│   ├── db.ts             # Prisma client
│   ├── openai.ts         # OpenAI wrapper
│   ├── patterns.ts       # Pattern detection
│   ├── pipeline.ts       # Multi-step pipeline
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript definitions
```

### Premium Features Summary
1. Prisma + SQLite Database Migration
2. Multi-Step Analysis Pipeline (5 steps)
3. Prism.js Syntax Highlighting
4. Configuration Panel
5. Batch Analysis Mode
6. Analytics Dashboard
7. Multi-Format Export

### Target Audience
- Next.js developers learning App Router architecture
- Developers transitioning from Pages Router to App Router
- Teams conducting code reviews for boundary compliance
- Educators teaching React Server Components

---

*This overview is designed for The Apex Room ecosystem. The project serves as both a practical tool and a comprehensive learning resource for modern Next.js development patterns.*
