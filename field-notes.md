# Field Notes: Client/Server Boundary Checker Premium

> A comprehensive technical document for deep learning. This file documents the evolution from the base application to the premium version, explaining architectural decisions, implementation patterns, and developer insights.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [What Changed From Base](#what-changed-from-base)
3. [Premium Features Deep Dive](#premium-features-deep-dive)
4. [Architectural Decisions](#architectural-decisions)
5. [Implementation Patterns](#implementation-patterns)
6. [Developer Learning Insights](#developer-learning-insights)
7. [File Structure](#file-structure)
8. [Technical Stack](#technical-stack)

---

## Project Overview

The Client/Server Boundary Checker Premium is an advanced code analysis tool for Next.js developers. It analyzes JavaScript/TypeScript code to determine whether it should run on the client (browser), server (Node.js), or both environments safely.

### Core Purpose

Next.js App Router introduced React Server Components (RSC), creating a clear boundary between client and server code. Developers must carefully consider which code runs where because:

- **Client code** uses browser APIs (`window`, `document`, hooks like `useState`)
- **Server code** accesses databases, file systems, and secrets
- **Violations** cause runtime errors or security vulnerabilities

This tool automates the detection of boundary issues.

---

## What Changed From Base

### Base Version Features

The original application provided:

- Simple textarea for code input
- Basic AI classification (client-only, server-only, both)
- JSON file storage for history
- Minimal UI with classification display

### Premium Version Additions

| Feature | Base | Premium |
|---------|------|---------|
| Database | JSON files | Prisma + SQLite |
| Analysis | Single-step | 5-step pipeline |
| Code Editor | Plain textarea | Prism.js syntax highlighting |
| Configuration | None | Full settings panel |
| Batch Analysis | No | Yes (multiple snippets) |
| Analytics | No | Dashboard with trends |
| Export | No | MD/JSON/CSV formats |
| Pattern Detection | No | 60+ patterns |
| Risk Assessment | No | Low/Medium/High/Critical |
| Suggestions | No | AI-generated refactoring tips |

### Files Modified

```
prisma/
  schema.prisma           # NEW - Database schema

src/
  types/
    index.ts              # NEW - Comprehensive TypeScript types

  lib/
    db.ts                 # MODIFIED - Prisma integration
    utils.ts              # NEW - Utility functions
    patterns.ts           # NEW - Pattern detection engine
    pipeline.ts           # NEW - Multi-step analysis

  app/
    actions/
      index.ts            # MODIFIED - Action exports
      analysis.ts         # MODIFIED - Premium analysis
      history.ts          # MODIFIED - Export support
      batch.ts            # NEW - Batch operations
      config.ts           # NEW - Configuration
      analytics.ts        # NEW - Analytics queries

  components/
    ui/                   # NEW - Shadcn UI components
      button.tsx
      card.tsx
      tabs.tsx
      select.tsx
      progress.tsx
      accordion.tsx
      switch.tsx
      tooltip.tsx
    CodeEditor.tsx        # MODIFIED - Syntax highlighting
    ResultDisplay.tsx     # MODIFIED - Pipeline results
    History.tsx           # MODIFIED - Filtering/search
    MainContent.tsx       # NEW - Tab navigation
    ConfigPanel.tsx       # NEW - Settings UI
    PipelineProgress.tsx  # NEW - Step visualization
    BatchAnalysis.tsx     # NEW - Multi-snippet analysis
    AnalyticsDashboard.tsx # NEW - Usage metrics
    ExportPanel.tsx       # NEW - Export UI

  app/
    page.tsx              # MODIFIED - Premium layout
    globals.css           # MODIFIED - Prism theme

tailwind.config.ts        # MODIFIED - Animations, colors
package.json              # MODIFIED - New dependencies
```

---

## Premium Features Deep Dive

### 1. Prisma + SQLite Database Migration

**Why this feature exists:**

The base version used JSON file storage, which is:
- Not suitable for production
- Lacks query capabilities
- No data integrity guarantees
- Difficult to extend

**Implementation:**

```prisma
// prisma/schema.prisma
model BoundaryCheck {
  id              String    @id @default(cuid())
  code            String
  classification  String
  explanation     String
  pipelineResults Json?     // Premium: step-by-step data
  patterns        Json?     // Premium: detected patterns
  riskLevel       String?   // Premium: risk assessment
  suggestions     Json?     // Premium: AI suggestions
  batchId         String?   // Premium: batch grouping
  createdAt       DateTime  @default(now())
}
```

**Learning insight:** Prisma's `Json` field type is perfect for storing structured analysis data without schema rigidity.

### 2. Multi-Step Analysis Pipeline

**Why this feature exists:**

Single-step analysis provides limited insight. A pipeline approach:
- Shows progress during analysis
- Provides granular error recovery
- Enables depth configuration
- Produces richer results

**The 5 Steps:**

1. **Classification** - Determine client/server/both
2. **Pattern Detection** - Find API usage patterns
3. **Risk Assessment** - Evaluate security implications
4. **Suggestions** - Generate refactoring recommendations
5. **Code Examples** - Provide correct usage examples

**Implementation pattern:**

```typescript
// src/lib/pipeline.ts
export async function executePipeline(
  code: string,
  config: PipelineConfig
): Promise<PipelineResult> {
  const steps: PipelineStep[] = [];

  // Each step builds on previous results
  for (const stepDef of PIPELINE_STEPS) {
    const step = await executeStep(stepDef, code, steps);
    steps.push(step);

    // Early exit for "quick" analysis depth
    if (config.analysisDepth === 'quick' && step.stepName === 'classification') {
      break;
    }
  }

  return { steps, totalDuration, ... };
}
```

### 3. Syntax Highlighting Code Editor

**Why this feature exists:**

Plain textareas are difficult to read and provide no visual feedback about code structure. Syntax highlighting:
- Improves code readability
- Helps users spot syntax errors
- Creates a professional IDE-like experience

**Implementation approach (dual-layer):**

```tsx
// Visible highlighted code (not editable)
<pre className="absolute inset-0 pointer-events-none">
  <code dangerouslySetInnerHTML={{ __html: highlighted }} />
</pre>

// Hidden textarea (captures input)
<textarea
  className="absolute inset-0 text-transparent caret-white"
  value={code}
  onChange={handleChange}
/>
```

**Why this approach:** Native contentEditable has cursor issues. This dual-layer approach maintains native input behavior while showing highlighted output.

### 4. Configuration Panel

**Why this feature exists:**

Different projects have different needs:
- Large codebases need quick analysis
- Security audits need comprehensive depth
- Some projects use Pages Router, others App Router

**Configuration options:**

| Setting | Options | Default |
|---------|---------|---------|
| Analysis Depth | quick, standard, comprehensive | standard |
| Framework Mode | app-router, pages-router | app-router |
| Strictness Level | lenient, standard, strict | standard |

### 5. Batch Analysis Mode

**Why this feature exists:**

Analyzing one snippet at a time is slow for:
- Code reviews
- Codebase audits
- CI/CD integration preparation

**Implementation:**

```typescript
// Uses in-memory cache for batch state (Vercel-friendly)
const batchCache = new Map<string, BatchState>();

export async function startBatchAnalysis(
  snippets: string[]
): Promise<string> {
  const batchId = generateId();

  // Process asynchronously
  processInBackground(batchId, snippets);

  return batchId; // Return immediately for polling
}
```

### 6. Analytics Dashboard

**Why this feature exists:**

Over time, developers want to understand:
- What types of code they analyze most
- Common patterns in their codebase
- Trends in risk levels
- Most frequent boundary issues

**Key metrics displayed:**

- Total analyses count
- Classification distribution (client/server/both percentages)
- Risk level breakdown
- Top detected patterns
- Recent activity feed

### 7. Export & Documentation

**Why this feature exists:**

Analysis results need to be:
- Shared with team members
- Included in documentation
- Processed by other tools
- Archived for audits

**Export formats:**

| Format | Use Case |
|--------|----------|
| Markdown | Documentation, reports |
| JSON | API integration, scripts |
| CSV | Spreadsheets, data analysis |

---

## Architectural Decisions

### Decision 1: Server Actions over API Routes

**Choice:** Use Next.js Server Actions exclusively

**Rationale:**
- Type safety across client-server boundary
- Automatic request/response handling
- Better integration with React transitions
- Simpler mental model

**Trade-off:** Less flexibility for non-Next.js clients

### Decision 2: Client Component Orchestration

**Choice:** Server Component page with Client Component MainContent

**Rationale:**
- Initial data fetched on server (fast first paint)
- Interactive features in single client boundary
- Minimal prop drilling
- Easy state management

```tsx
// page.tsx (Server Component)
export default async function Home() {
  const [history, config] = await Promise.all([...]);
  return <MainContent initialHistory={history} />;
}
```

### Decision 3: Radix UI Primitives

**Choice:** Use Radix UI for complex components (Select, Accordion, Tabs)

**Rationale:**
- Fully accessible (ARIA compliant)
- Unstyled (customizable with Tailwind)
- Headless (behavior without opinions)
- Well-tested edge cases

### Decision 4: Pattern Detection as Static Analysis

**Choice:** Regex-based pattern detection, not AST parsing

**Rationale:**
- Faster execution
- Works with incomplete/invalid code
- Simpler to extend
- Good enough for common patterns

**Trade-off:** May miss complex nested patterns

### Decision 5: SQLite for Database

**Choice:** SQLite with Prisma

**Rationale:**
- Zero configuration
- File-based (Vercel-compatible with caveats)
- Fast for read-heavy workloads
- Easy local development

**Trade-off:** Not suitable for write-heavy production

---

## Implementation Patterns

### Pattern 1: Transition-based Loading States

```typescript
const [isPending, startTransition] = useTransition();

const handleSubmit = () => {
  startTransition(async () => {
    const result = await serverAction();
    // UI remains responsive during async work
  });
};
```

**Why:** React 18 transitions provide smoother UX than useState-based loading.

### Pattern 2: Parallel Data Fetching

```typescript
const [history, config, analytics] = await Promise.all([
  getHistory(),
  getConfig(),
  getAnalyticsSummary(30),
]);
```

**Why:** Fetch independent data simultaneously to reduce waterfall latency.

### Pattern 3: Singleton Pattern for Config

```typescript
// Only one config record per application
async function getUserConfig(): Promise<UserConfig> {
  const existing = await prisma.userConfig.findFirst();
  if (existing) return existing;

  return prisma.userConfig.create({
    data: DEFAULT_CONFIG,
  });
}
```

### Pattern 4: Environment Classification

```typescript
const PATTERN_DEFINITIONS = [
  {
    name: 'useState',
    regex: /\buseState\s*\(/,
    environment: 'client' as const,
    category: 'hooks',
    riskLevel: 'low',
    description: 'React state hook, requires client',
  },
  // ... more patterns
];
```

**Why:** Declarative pattern definition enables easy extension.

### Pattern 5: Progressive Enhancement

```typescript
interface CodeEditorProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (result, pipeline) => void;
  config?: UserConfig | null;
}
```

**Why:** Optional callbacks allow component to work standalone or integrated.

---

## Developer Learning Insights

### Insight 1: Next.js App Router Mental Model

The key insight is thinking in terms of **where code executes**:

```
Client Code (Browser)
├── React Hooks (useState, useEffect, useRef)
├── Event Handlers (onClick, onChange)
├── Browser APIs (window, document, localStorage)
└── 'use client' directive

Server Code (Node.js)
├── Database Operations (Prisma, SQL)
├── File System (fs, path)
├── Environment Variables (process.env.SECRET)
├── Server Actions ('use server')
└── Default in App Router

Isomorphic (Both Safe)
├── Pure Functions
├── Data Transformations
├── Constants/Configuration
└── Utility Libraries
```

### Insight 2: Prism.js Integration

Prism.js requires language imports to be loaded:

```typescript
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Must check for language availability
const grammar = Prism.languages.tsx || Prism.languages.typescript;
```

### Insight 3: Radix UI Styling

Radix components use `data-*` attributes for state:

```css
/* Select component styling */
[data-state="open"] {
  /* When dropdown is open */
}

[data-state="checked"] {
  /* When checkbox/switch is on */
}

[data-highlighted] {
  /* When item is keyboard-focused */
}
```

### Insight 4: Type-Safe Server Actions

Server actions can return discriminated unions:

```typescript
type Result =
  | { error: string }
  | { result: ClassificationResult; pipeline: PipelineResult };

export async function analyze(code: string): Promise<Result> {
  if (!code) return { error: 'Code required' };
  return { result: ..., pipeline: ... };
}

// Client usage
if ('error' in response) {
  // TypeScript knows response.error exists
}
```

### Insight 5: useMemo for Derived State

Filtering and sorting in History component:

```typescript
const filteredItems = useMemo(() => {
  let result = [...items];

  if (searchQuery) {
    result = result.filter(item =>
      item.code.toLowerCase().includes(searchQuery)
    );
  }

  // More filters...

  return result;
}, [items, searchQuery, classificationFilter, sortBy]);
```

**Why:** Avoid recalculating on every render, only when dependencies change.

---

## File Structure

```
Client-Server-Boundary-Checker-Premium/
├── prisma/
│   └── schema.prisma          # Database schema definition
│
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions
│   │   │   ├── index.ts       # Export barrel
│   │   │   ├── analysis.ts    # Core analysis
│   │   │   ├── history.ts     # History & export
│   │   │   ├── batch.ts       # Batch operations
│   │   │   ├── config.ts      # User settings
│   │   │   └── analytics.ts   # Metrics queries
│   │   ├── globals.css        # Global styles + Prism theme
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   │
│   ├── components/
│   │   ├── ui/                # Shadcn-style components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── switch.tsx
│   │   │   └── tooltip.tsx
│   │   ├── MainContent.tsx    # Tab navigation orchestrator
│   │   ├── CodeEditor.tsx     # Syntax-highlighted editor
│   │   ├── ResultDisplay.tsx  # Analysis results
│   │   ├── History.tsx        # Searchable history list
│   │   ├── ConfigPanel.tsx    # Settings panel
│   │   ├── PipelineProgress.tsx # Step visualization
│   │   ├── BatchAnalysis.tsx  # Multi-snippet analysis
│   │   ├── AnalyticsDashboard.tsx # Metrics display
│   │   └── ExportPanel.tsx    # Export interface
│   │
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   ├── patterns.ts        # Pattern detection
│   │   └── pipeline.ts        # Multi-step pipeline
│   │
│   └── types/
│       └── index.ts           # TypeScript definitions
│
├── tailwind.config.ts         # Tailwind configuration
├── package.json               # Dependencies
├── field-notes.md             # This documentation
└── README.md                  # Project readme
```

---

## Technical Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with Server Components
- **TypeScript** - Type-safe JavaScript

### Database
- **Prisma** - Type-safe ORM
- **SQLite** - Embedded database

### UI Components
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Prism.js** - Syntax highlighting

### AI Integration
- **OpenAI API** - GPT-4o-mini for classification

### Dev Dependencies
- **clsx** - Conditional class names
- **tailwind-merge** - Tailwind class merging
- **class-variance-authority** - Variant management

---

## Deployment Notes

### Vercel Deployment

1. **Environment Variables:**
   ```
   OPENAI_API_KEY=sk-...
   DATABASE_URL=file:./dev.db
   ```

2. **Build Command:**
   ```bash
   npx prisma generate && npm run build
   ```

3. **SQLite Caveat:**
   - SQLite works on Vercel but is ephemeral
   - For production, consider Turso or PostgreSQL

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push

# Start development server
npm run dev
```

---

## Conclusion

This premium version transforms a simple classifier into a comprehensive code analysis platform. The key improvements focus on:

1. **Developer Experience** - Syntax highlighting, keyboard shortcuts, intuitive UI
2. **Analysis Depth** - Multi-step pipeline with pattern detection and suggestions
3. **Data Persistence** - Proper database with query capabilities
4. **Scalability** - Batch processing and export features
5. **Insights** - Analytics dashboard for trend analysis

Each feature was designed with learning in mind, using well-documented patterns that can be applied to other Next.js applications.

---

*Last updated: December 2024*
