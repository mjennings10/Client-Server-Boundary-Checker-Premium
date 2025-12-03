# Filming Guide: Client/Server Boundary Checker Premium

A complete recording script and demonstration guide for the Apex Room premium project.

---

## Table of Contents

1. [Pre-Recording Setup](#1-pre-recording-setup)
2. [Scene-by-Scene Filming Script](#2-scene-by-scene-filming-script)
3. [Feature Demonstration Walkthrough](#3-feature-demonstration-walkthrough)
4. [Demo Queries](#4-demo-queries)
5. [Narration Talking Points](#5-narration-talking-points)
6. [B-Roll Suggestions](#6-b-roll-suggestions)
7. [Troubleshooting Section](#7-troubleshooting-section)
8. [Step-by-Step Directions for Filming](#8-step-by-step-directions-for-using-the-project-in-filming)
9. [Final Checklist](#9-final-checklist)

---

## 1. Pre-Recording Setup

### Environment Preparation

**Terminal Setup**
```bash
# Navigate to project directory
cd Client-Server-Boundary-Checker-Premium

# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates SQLite database)
npx prisma db push

# Start development server
npm run dev
```

**Environment Variables**
Create or verify `.env.local` file:
```
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL="file:./dev.db"
```

**Verify API Key**
- Test your OpenAI API key is active before recording
- Ensure sufficient credits/quota for demo queries
- Consider using a dedicated demo API key

### Window and Tab Configuration

**Recommended Layout (Single Monitor)**
```
+------------------------------------------+
|  Browser (80% width)  |  VS Code (20%)   |
|  - App at localhost   |  - Code visible  |
|  - DevTools hidden    |  - Terminal tab  |
+------------------------------------------+
```

**Recommended Layout (Dual Monitor)**
- Primary: Browser with app fullscreen
- Secondary: VS Code with relevant files open

**Browser Tabs to Open**
1. `http://localhost:3000` - Main application
2. Keep additional tabs closed to avoid distractions

**Files to Have Open in VS Code**
1. `src/lib/pipeline.ts` - Multi-step analysis logic
2. `src/lib/patterns.ts` - Pattern detection definitions
3. `prisma/schema.prisma` - Database schema
4. `src/components/CodeEditor.tsx` - Syntax highlighting
5. `field-notes.md` - Documentation reference

### Data Reset Before Recording

**Clear History (Fresh Start)**
```bash
# Delete existing database
rm prisma/dev.db

# Recreate database
npx prisma db push
```

**Seed Sample Data (Optional)**
If you want some history visible at start, analyze 2-3 code snippets before recording.

### Screen and Recording Settings

**Screen Resolution**
- Recommended: 1920x1080 or 2560x1440
- Avoid 4K unless downscaling in post

**Browser Zoom Level**
- Set browser to 100% zoom
- Increase to 110-125% if text appears small on recording

**UI Scaling**
- Ensure VS Code font size is readable (14-16px recommended)
- Terminal font should be clearly visible

**Browser Configuration**
- Hide bookmarks bar
- Disable browser extensions that show badges
- Use incognito mode or clean profile
- Clear any autofill data

**Microphone Settings**
- Use external microphone if available
- Test audio levels before recording
- Record in a quiet environment
- Position mic 6-8 inches from mouth

### Performance Verification

**Before Recording**
1. Run through full demo once without recording
2. Verify API responses are fast (under 3 seconds)
3. Confirm syntax highlighting renders smoothly
4. Test batch analysis with 3 snippets
5. Verify export downloads work

---

## 2. Scene-by-Scene Filming Script

### Scene 1: Introduction

**Purpose:** Establish context and project value proposition

**Screen Setup:** Browser showing the application homepage with empty state

**Actions:**
1. Show the application loaded at localhost:3000
2. Slowly pan across the interface
3. Highlight the "Premium" badge in header

**Narration Script:**
> "This is the Client/Server Boundary Checker Premium. It is a tool designed to help Next.js developers understand exactly where their code should run. In the App Router architecture, the boundary between client and server code is critical. Get it wrong, and you face runtime errors, security vulnerabilities, or performance issues. This tool analyzes your code and tells you precisely where it belongs."

**Camera Direction:**
- Start with full application view
- Slow zoom toward the code editor area
- Hold for 2 seconds on the Premium badge

**Pause Point:** After showing full interface, pause for cut

**Shorts/TikTok Variation:**
> "Stop guessing where your Next.js code should run. This tool analyzes it for you in seconds."

---

### Scene 2: First Analysis

**Purpose:** Demonstrate core functionality with a simple example

**Screen Setup:** Code editor empty, ready for input

**Actions:**
1. Click into the code editor
2. Type or paste a simple client-side hook example
3. Click "Analyze Boundary" button
4. Wait for result to appear
5. Review the classification and explanation

**Code to Enter:**
```javascript
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**Narration Script:**
> "Let us start with a straightforward example. I am pasting a React component that uses the useState hook. Watch what happens when I click Analyze Boundary."
>
> [After clicking]
>
> "The tool identifies this as client-only code. It explains that useState is a React hook that requires client-side execution. It cannot run in a Server Component. The explanation is clear and actionable."

**Camera Direction:**
- Focus on code editor while typing
- Follow the cursor to the Analyze button
- Zoom slightly on the result panel when classification appears

**Pause Point:** After result displays, hold for 3 seconds

---

### Scene 3: Pipeline Visualization

**Purpose:** Show the multi-step analysis process

**Screen Setup:** Result displayed, pipeline progress visible

**Actions:**
1. Point out the pipeline progress section
2. Explain each step completed
3. Show the timing information

**Narration Script:**
> "Notice the pipeline progress. The Premium version does not just classify your code. It runs a five-step analysis. First, it determines the classification. Then it detects specific patterns in your code. It assesses the risk level. It generates suggestions for improvement. And for comprehensive analysis, it provides code examples. Each step builds on the last, giving you a complete picture."

**Camera Direction:**
- Zoom on pipeline progress indicator
- Highlight each step as you mention it
- Show timing data

**Pause Point:** After explaining all five steps

---

### Scene 4: Server-Only Example

**Purpose:** Demonstrate server classification

**Screen Setup:** Clear the editor or start fresh

**Actions:**
1. Clear previous code
2. Enter server-side code example
3. Run analysis
4. Review server-only classification

**Code to Enter:**
```javascript
import { prisma } from '@/lib/db';

export async function getUsers() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true }
  });
  return users;
}
```

**Narration Script:**
> "Now let us try server-side code. This function queries a database using Prisma. Database operations must run on the server. They cannot execute in a browser."
>
> [After result]
>
> "Classified as server-only. The tool detected the Prisma database access pattern and correctly identified this as code that must stay on the server. Exposing database queries to the client would be a serious security risk."

**Camera Direction:**
- Standard recording of typing and result
- Zoom on detected patterns section

**Pause Point:** After showing risk assessment

---

### Scene 5: Configuration Panel

**Purpose:** Demonstrate customization options

**Screen Setup:** Main interface with settings toggle visible

**Actions:**
1. Click the Settings toggle in sidebar
2. Show Analysis Depth options
3. Change to "comprehensive"
4. Show Framework Mode options
5. Explain Strictness Level

**Narration Script:**
> "The Premium version includes a configuration panel. You can adjust the analysis depth. Quick mode gives fast results. Standard is the default balance. Comprehensive runs all five pipeline steps including code examples."
>
> "You can also set the framework mode. App Router is the default for modern Next.js. Pages Router is available for legacy projects. The strictness level controls how cautiously the tool flags potential issues."

**Camera Direction:**
- Click through each dropdown slowly
- Hold on each option for 1-2 seconds
- Return to default settings after demonstration

**Pause Point:** After closing settings panel

---

### Scene 6: Batch Analysis

**Purpose:** Show multi-snippet analysis capability

**Screen Setup:** Navigate to Batch tab

**Actions:**
1. Click the "Batch" tab
2. Enter multiple code snippets with delimiters
3. Start batch analysis
4. Show progress indicator
5. Review batch results

**Code to Enter:**
```javascript
// --- snippet: Client Hook ---
const [loading, setLoading] = useState(false);

// --- snippet: Server Action ---
'use server'
async function saveData(formData) {
  await db.insert(formData);
}

// --- snippet: Isomorphic Utility ---
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US').format(date);
}
```

**Narration Script:**
> "The Batch Analysis feature lets you analyze multiple code snippets at once. This is useful for code reviews or auditing an entire codebase. Separate your snippets with the delimiter pattern shown here."
>
> [Start analysis]
>
> "Watch the progress as each snippet is analyzed. When complete, you see results for all three: client-only, server-only, and both. The isomorphic utility function works in either environment."

**Camera Direction:**
- Show the batch input area
- Follow progress indicator
- Pan across all results

**Pause Point:** After all batch results display

---

### Scene 7: History and Search

**Purpose:** Demonstrate history management features

**Screen Setup:** Return to Analyze tab, history sidebar visible

**Actions:**
1. Show history items in sidebar
2. Use search filter
3. Filter by classification type
4. Click history item to reload
5. Show expandable details

**Narration Script:**
> "Every analysis is saved to your history. You can search through past analyses, filter by classification type, or sort by risk level. Click any item to reload it into the editor. Expand an item to see the explanation and detected patterns without leaving the list."

**Camera Direction:**
- Focus on history sidebar
- Show filtering in action
- Demonstrate click-to-load

**Pause Point:** After showing expanded history item

---

### Scene 8: Analytics Dashboard

**Purpose:** Show usage insights and trends

**Screen Setup:** Navigate to Analytics tab

**Actions:**
1. Click Analytics tab
2. Show classification distribution
3. Show risk breakdown
4. Point out top patterns
5. Show recent activity

**Narration Script:**
> "The Analytics Dashboard provides insights into your analysis patterns. See the distribution of client, server, and isomorphic code across your projects. The risk breakdown shows how often high-risk patterns appear. Top patterns reveal which APIs and hooks you use most frequently."

**Camera Direction:**
- Pan across the dashboard
- Zoom on each visualization briefly
- End on distribution chart

**Pause Point:** After touring full dashboard

---

### Scene 9: Export Functionality

**Purpose:** Demonstrate export options

**Screen Setup:** Navigate to Export tab

**Actions:**
1. Click Export tab
2. Show format options (Markdown, JSON, CSV)
3. Toggle include options
4. Generate export
5. Show download or clipboard action

**Narration Script:**
> "Export your analysis history in multiple formats. Markdown is ideal for documentation. JSON works well for programmatic processing. CSV opens directly in spreadsheets. Choose which details to include: code snippets, pipeline data, or suggestions. Download the file or copy directly to your clipboard."

**Camera Direction:**
- Show each format option
- Demonstrate toggle switches
- Show successful export action

**Pause Point:** After export completes

---

### Scene 10: Code Architecture Tour

**Purpose:** Highlight technical implementation for developers

**Screen Setup:** Switch to VS Code with relevant files

**Actions:**
1. Show `src/lib/pipeline.ts`
2. Briefly show `src/lib/patterns.ts`
3. Show `prisma/schema.prisma`
4. Return to browser

**Narration Script:**
> "For developers studying this codebase, the architecture is designed for learning. The pipeline logic in pipeline.ts orchestrates the five-step analysis. Pattern detection in patterns.ts defines over sixty patterns the tool recognizes. The Prisma schema shows how results are persisted. All files are heavily commented for study."

**Camera Direction:**
- Quick cuts between files
- Highlight key function names
- Do not linger too long on code

**Pause Point:** After showing schema file

---

### Scene 11: Closing

**Purpose:** Summarize value and call to action

**Screen Setup:** Return to browser with full application view

**Actions:**
1. Show full application interface
2. End on clean state

**Narration Script:**
> "That is the Client/Server Boundary Checker Premium. Seven features designed to help you understand Next.js boundaries: database persistence, multi-step analysis, syntax highlighting, configuration options, batch processing, analytics, and export. The field-notes.md file documents every architectural decision. Clone the repository, study the code, and build your understanding of modern React Server Components."

**Camera Direction:**
- Slow zoom out to full interface
- Hold final frame for 3 seconds

**Pause Point:** End of recording

---

## 3. Feature Demonstration Walkthrough

### Feature 1: Syntax Highlighted Code Editor

**What to Click:** Click anywhere in the code editor area

**What to Type:**
```javascript
import { useEffect, useState } from 'react';

export function DataFetcher({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

**What It Demonstrates:**
- Prism.js syntax highlighting
- Line numbers in gutter
- Keyword colorization
- Tab key indentation support

**Developer Learning Angle:**
The dual-layer approach uses an invisible textarea for input and a visible pre element for display. This maintains native text editing while showing highlighted code.

**When to Zoom:** Zoom on line numbers and keyword colors

**Expected Output:** Code appears with purple keywords, green strings, blue function names

---

### Feature 2: Multi-Step Pipeline Analysis

**What to Click:** Analyze Boundary button

**What to Type:** Any code snippet from Demo Queries section

**What It Demonstrates:**
- Five-step analysis process
- Progress visualization
- Step-by-step timing
- Incremental result building

**Developer Learning Angle:**
Each pipeline step is independent and can fail gracefully. The architecture allows for depth configuration without changing core logic.

**When to Zoom:** Zoom on pipeline progress indicator as steps complete

**Expected Output:** Pipeline shows Classification, Pattern Detection, Risk Assessment, Suggestions, Examples (if comprehensive)

---

### Feature 3: Pattern Detection

**What to Click:** Run analysis, then scroll to Detected Patterns section

**What to Type:**
```javascript
'use client';
import { useState, useEffect, useRef } from 'react';

export function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>{seconds}s</div>;
}
```

**What It Demonstrates:**
- Multiple pattern detection
- Environment classification per pattern
- Pattern categorization (hooks, directives)

**Developer Learning Angle:**
The patterns.ts file contains regex-based definitions. Each pattern has a name, regex, environment, category, and risk level.

**When to Zoom:** Zoom on detected patterns list showing multiple hooks

**Expected Output:** Patterns detected: use client directive, useState, useEffect, useRef

---

### Feature 4: Risk Assessment

**What to Click:** Run analysis on risky code

**What to Type:**
```javascript
// Dangerous: exposing environment variables to client
export function ApiConfig() {
  return {
    apiKey: process.env.API_SECRET_KEY,
    dbUrl: process.env.DATABASE_URL
  };
}
```

**What It Demonstrates:**
- Risk level calculation
- Security warning flags
- Explanation of risks

**Developer Learning Angle:**
Risk assessment combines pattern severity with context. Exposing secrets is always critical. Using hooks is low risk.

**When to Zoom:** Zoom on risk level badge when it shows High or Critical

**Expected Output:** Classification: server-only, Risk: High or Critical, warning about secret exposure

---

### Feature 5: Configuration Panel

**What to Click:** Settings button in sidebar

**What to Type:** Nothing - configuration only

**What It Demonstrates:**
- Analysis depth options
- Framework mode selection
- Strictness level adjustment
- Settings persistence

**Developer Learning Angle:**
Configuration is stored in SQLite via Prisma. The UserConfig model uses a singleton pattern.

**When to Zoom:** Zoom on each dropdown as you demonstrate options

**Expected Output:** Settings panel opens with three configurable options

---

### Feature 6: Batch Analysis

**What to Click:** Batch tab, then Start Batch Analysis button

**What to Type:**
```javascript
// --- snippet: Hook Usage ---
const [open, setOpen] = useState(false);

// --- snippet: Database Query ---
const users = await prisma.user.findMany();

// --- snippet: Pure Function ---
function add(a, b) { return a + b; }
```

**What It Demonstrates:**
- Multi-snippet parsing
- Parallel analysis
- Progress tracking
- Aggregated results

**Developer Learning Angle:**
Batch processing uses in-memory state cache. Each snippet is analyzed independently, allowing partial success.

**When to Zoom:** Zoom on progress bar as it advances

**Expected Output:** Three results: client-only, server-only, both

---

### Feature 7: Analytics Dashboard

**What to Click:** Analytics tab

**What to Type:** Nothing - display only

**What It Demonstrates:**
- Classification distribution
- Risk level breakdown
- Top patterns chart
- Recent activity feed

**Developer Learning Angle:**
Analytics are aggregated from the database using Prisma queries. The dashboard updates after each analysis.

**When to Zoom:** Zoom on distribution bars showing percentages

**Expected Output:** Charts showing analysis history breakdown

---

### Feature 8: Export Panel

**What to Click:** Export tab, format selector, Download button

**What to Type:** Nothing - export only

**What It Demonstrates:**
- Multiple export formats
- Customizable content inclusion
- File download
- Clipboard copy

**Developer Learning Angle:**
Export uses server actions to generate content. Markdown uses template literals, JSON uses stringify, CSV uses manual formatting.

**When to Zoom:** Zoom on format options and toggle switches

**Expected Output:** File downloads or clipboard notification appears

---

## 4. Demo Queries

### Safe Demo Queries (Always Work)

**Query 1: Clear Client-Side Code**
```javascript
'use client';

import { useState } from 'react';

export function ToggleButton() {
  const [active, setActive] = useState(false);

  return (
    <button onClick={() => setActive(!active)}>
      {active ? 'ON' : 'OFF'}
    </button>
  );
}
```
**Expected Output:** Client-only classification, mentions useState and onClick

---

**Query 2: Clear Server-Side Code**
```javascript
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export async function getCurrentUser() {
  const headersList = headers();
  const token = headersList.get('authorization');

  return prisma.user.findFirst({
    where: { token }
  });
}
```
**Expected Output:** Server-only classification, mentions headers and database access

---

**Query 3: Clear Isomorphic Code**
```javascript
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}
```
**Expected Output:** Both classification, notes pure function with standard APIs

---

**Query 4: Server Action**
```javascript
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');

  await db.post.create({
    data: { title, content }
  });

  revalidatePath('/posts');
}
```
**Expected Output:** Server-only classification, mentions 'use server' directive

---

**Query 5: Browser API Usage**
```javascript
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```
**Expected Output:** Client-only classification, mentions window object and hooks

---

### Alternative Variations

**Shorter Version (for TikTok/Shorts):**
```javascript
const [count, setCount] = useState(0);
```
**Expected Output:** Client-only, useState requires client

---

**One-Liner Server:**
```javascript
const data = await prisma.user.findMany();
```
**Expected Output:** Server-only, database access

---

**Ambiguous Code (Interesting Result):**
```javascript
export const config = {
  api: {
    bodyParser: false
  }
};
```
**Expected Output:** Both or Server, configuration object

---

### Failure-Resistant Queries

These queries produce consistent, interesting results even under load:

**Always Interesting:**
```javascript
// What environment does this need?
export function UserProfile({ user }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditForm user={user} onSave={() => setEditing(false)} />;
  }

  return (
    <div onClick={() => setEditing(true)}>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}
```
**Why It Works:** Clear client indicators with interesting real-world pattern

---

## 5. Narration Talking Points

### Key Ideas to Emphasize

- The client/server boundary is not optional in Next.js App Router
- Getting the boundary wrong causes real production bugs
- Understanding where code runs is fundamental to React Server Components
- This tool removes guessing from the equation
- The analysis is deterministic and explainable

### What Viewers Should Take Away

- How to identify client-only code patterns (hooks, browser APIs, event handlers)
- How to identify server-only code patterns (database, file system, secrets)
- What makes code safely isomorphic
- Why the boundary matters for security
- Why the boundary matters for performance
- How to use the tool for code review

### Apex Room Philosophies

- Learn by building real tools
- Documentation is as important as code
- Every architectural decision should be explainable
- Premium features solve real workflow problems
- Code should teach, not just function

### Project Learning Moments

- Prism.js integration with React (dual-layer technique)
- Server Actions for form-like operations
- Prisma with SQLite for simple persistence
- Multi-step pipelines with error recovery
- Pattern detection using regex
- Radix UI primitives for accessible components

### Call-to-Action Options

- "Clone the repository and study the field-notes.md"
- "Try analyzing your own codebase"
- "Check the patterns.ts file to see all 60+ patterns"
- "Build your own analysis tool using this architecture"
- "Visit the Apex Room Lab for more premium projects"

---

## 6. B-Roll Suggestions

### UI Movement Shots

1. **Code Editor Typing** - Slow, deliberate typing of a code snippet with syntax highlighting appearing
2. **Analyze Button Click** - Finger approaching button, click, loading state
3. **Pipeline Progress** - Steps completing one by one with checkmarks appearing
4. **Tab Navigation** - Smooth click through Analyze, Batch, Analytics, Export tabs
5. **History Scroll** - Scrolling through analysis history items
6. **Filter Toggle** - Clicking classification filter buttons
7. **Settings Dropdown** - Opening and selecting analysis depth options
8. **Result Expansion** - Expanding an accordion to show suggestions

### Code Snippet Shots

9. **Pattern Detection** - Close-up of detected patterns list with environment badges
10. **Risk Badge** - Zoom on risk level indicator changing from Low to High
11. **Classification Display** - The large classification result with icon

### Architecture Shots

12. **Schema File** - Slow scroll through prisma/schema.prisma
13. **Pipeline Code** - Key function in pipeline.ts with comment visible
14. **Patterns Array** - Scrolling through pattern definitions in patterns.ts

### Static/Logo Shots

15. **Application Header** - Clean shot of "Boundary Checker Premium" with badge
16. **Empty State** - The placeholder text in empty code editor

### Pacing Recommendations

**For YouTube (long-form):**
- B-roll clips: 2-4 seconds each
- Use during explanation pauses
- Transition smoothly from speech

**For TikTok/Shorts:**
- B-roll clips: 0.5-1.5 seconds each
- Rapid cuts between features
- Always have motion in frame
- Use typing and clicking sounds

---

## 7. Troubleshooting Section

### API Issues

**Problem:** "OpenAI API key is not configured"
**Solution:**
1. Check `.env.local` file exists
2. Verify `OPENAI_API_KEY=sk-...` is set
3. Restart dev server after adding key

**Problem:** Slow API responses (over 5 seconds)
**Solution:**
1. Check OpenAI status page
2. Use shorter code snippets for demo
3. Pre-record analysis results if needed

**Problem:** Rate limit errors
**Solution:**
1. Wait 60 seconds between rapid analyses
2. Use pre-analyzed history items for demo
3. Consider API key with higher tier

---

### Database Issues

**Problem:** "Database not found" or Prisma errors
**Solution:**
```bash
npx prisma db push
npx prisma generate
```

**Problem:** History not appearing
**Solution:**
1. Check `prisma/dev.db` exists
2. Run `npx prisma studio` to verify data
3. Restart dev server

---

### UI Issues

**Problem:** Syntax highlighting not rendering
**Solution:**
1. Clear browser cache
2. Check console for Prism.js errors
3. Verify `globals.css` includes Prism theme

**Problem:** UI flickering during analysis
**Solution:**
1. Reduce browser extensions
2. Use Chrome or Firefox (not Safari)
3. Disable React strict mode for recording

**Problem:** Components not loading
**Solution:**
1. Check terminal for build errors
2. Restart dev server
3. Clear `.next` folder and rebuild

---

### Recording Issues

**Problem:** Text too small on recording
**Solution:**
1. Increase browser zoom to 125%
2. Increase VS Code font size
3. Record at 1080p, not 4K

**Problem:** Autofill appearing in code editor
**Solution:**
1. Use incognito mode
2. Disable browser autofill
3. Clear form data

**Problem:** Dev tools popup appearing
**Solution:**
1. Close dev tools before recording
2. Disable "Open dev tools" shortcuts
3. Use presentation mode if available

---

### Environment Issues

**Problem:** "Module not found" errors
**Solution:**
```bash
rm -rf node_modules
npm install
```

**Problem:** TypeScript errors blocking start
**Solution:**
1. Run `npm run dev` (dev mode is more forgiving)
2. Ignore type errors for demo purposes
3. The app will still function

**Problem:** Port 3000 already in use
**Solution:**
```bash
# Find and kill process
lsof -i :3000
kill -9 [PID]

# Or use different port
npm run dev -- -p 3001
```

---

## 8. Step-by-Step Directions for Using the Project in Filming

### Opening Sequence (0:00 - 0:30)

1. Start with browser showing `localhost:3000`
2. Application should be in fresh state (empty or 1-2 history items)
3. Ensure code editor is empty and focused
4. Pause 2 seconds on opening shot

### First Demo Analysis (0:30 - 1:30)

1. Click into code editor
2. Type or paste the "Clear Client-Side Code" demo query
3. Wait for syntax highlighting to render (0.5s)
4. Move cursor to "Analyze Boundary" button
5. Click button
6. Wait for result (2-5 seconds)
7. Pause on result for 3 seconds
8. Point out classification badge
9. Point out explanation text
10. Point out detected patterns

### Pipeline Demonstration (1:30 - 2:15)

1. Scroll to pipeline progress section
2. Pause on each completed step
3. Note the timing information
4. Avoid clicking during this section

### Server Code Demo (2:15 - 3:00)

1. Clear editor (select all, delete)
2. Paste "Clear Server-Side Code" demo query
3. Click Analyze
4. Wait for result
5. Highlight server-only classification
6. Point out database pattern detection

### Configuration Walkthrough (3:00 - 3:45)

1. Click Settings button in sidebar
2. Open Analysis Depth dropdown
3. Hover over each option (do not change)
4. Open Framework Mode dropdown
5. Hover over each option
6. Close settings panel

### Batch Analysis Demo (3:45 - 4:45)

1. Click "Batch" tab
2. Clear any existing content
3. Paste batch demo query with three snippets
4. Click "Start Batch Analysis"
5. Watch progress indicator
6. Review all three results
7. Point out different classifications

### Analytics Tour (4:45 - 5:15)

1. Click "Analytics" tab
2. Pause on distribution chart
3. Scroll to top patterns
4. Note recent activity section
5. Do not click any interactive elements

### Export Demonstration (5:15 - 5:45)

1. Click "Export" tab
2. Select "Markdown" format
3. Toggle "Include Code" on
4. Click "Download" or "Copy"
5. Show success feedback

### Closing Shot (5:45 - 6:00)

1. Return to "Analyze" tab
2. Show full application view
3. Pause on clean interface
4. End recording

### What to Avoid

- Do not show terminal during main demo
- Do not open browser dev tools
- Do not click external links
- Do not show file system or desktop
- Do not rush through results
- Do not analyze code that might fail
- Do not show error states unless intentional

### What to Highlight

- The Premium badge in header
- Pipeline step completion
- Risk level badges
- Detected patterns list
- Classification explanations
- Configuration options
- Batch progress indicator
- Analytics charts

---

## 9. Final Checklist

### One Hour Before Recording

- [ ] Test API key works with simple query
- [ ] Restart development server fresh
- [ ] Clear browser cache and cookies
- [ ] Close all unnecessary applications
- [ ] Disable notifications (system and browser)
- [ ] Charge laptop or plug in
- [ ] Test microphone audio levels

### Fifteen Minutes Before Recording

- [ ] Reset database to desired state
- [ ] Open browser to `localhost:3000`
- [ ] Set browser zoom level (100-125%)
- [ ] Hide bookmarks bar
- [ ] Close other browser tabs
- [ ] Open VS Code with relevant files (if showing)
- [ ] Set VS Code font size to readable level
- [ ] Prepare demo code snippets in separate document

### Five Minutes Before Recording

- [ ] Verify application loads without errors
- [ ] Run one test analysis to warm up API
- [ ] Position microphone correctly
- [ ] Take a breath and review first scene
- [ ] Start screen recording software
- [ ] Do a quick audio check

### Environment Checklist

- [ ] Node.js dev server running
- [ ] No terminal errors visible
- [ ] `.env.local` configured
- [ ] Database accessible
- [ ] OpenAI API responding

### Screen Checklist

- [ ] Browser in clean profile or incognito
- [ ] No visible user data or bookmarks
- [ ] No notification badges
- [ ] No autofill data showing
- [ ] Clock/system tray hidden (optional)

### Content Checklist

- [ ] Demo queries copied and ready to paste
- [ ] Scene script printed or on second screen
- [ ] Narration points reviewed
- [ ] Backup queries prepared
- [ ] Know what to do if API fails

### Post-Recording

- [ ] Stop screen recording
- [ ] Stop audio recording
- [ ] Verify files saved correctly
- [ ] Review first 30 seconds for quality
- [ ] Back up raw footage
- [ ] Note any retakes needed

---

## Quick Reference Card

**Demo Queries Location:** Section 4 of this guide

**Safe Opening Code:**
```javascript
const [count, setCount] = useState(0);
```

**Safe Server Code:**
```javascript
const data = await prisma.user.findMany();
```

**Batch Delimiter:**
```javascript
// --- snippet: Name Here ---
```

**If API Fails:** Use history items to show pre-analyzed results

**If UI Breaks:** Refresh browser, restart server if needed

**Recording Resolution:** 1920x1080 recommended

**Browser Zoom:** 100-125%

---

*This filming guide is designed for the Apex Room Lab. Follow each section sequentially for best results. Update demo queries if API behavior changes.*
