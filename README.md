# Client/Server Boundary Checker

A developer tool that analyzes JavaScript/TypeScript code snippets to determine if they can run on the **client**, **server**, or **both** in a Next.js App Router environment.

## Purpose

In Next.js App Router, understanding the client/server boundary is critical:

- **Server Components** run only on the server and can access databases, file systems, and environment variables
- **Client Components** run in the browser and can use hooks, event handlers, and browser APIs
- Some code is **isomorphic** and safely runs in both environments

This tool helps developers quickly classify code snippets and understand why certain code belongs in specific environments.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Local JSON file (no external database required)
- **AI**: OpenAI API (GPT-4o-mini)

## Features

- Paste any JavaScript/TypeScript code snippet
- Get instant classification: `client-only`, `server-only`, or `both`
- Detailed explanations referencing Next.js rules
- Local history of all analyzed snippets
- Clean, developer-focused UI

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically create a local `data/db.json` file to store your analysis history.

## Usage

1. **Enter Code**: Paste your JavaScript/TypeScript snippet into the code editor
2. **Click "Check Boundary"**: The AI analyzes your code
3. **View Results**: See the classification badge and detailed explanation
4. **Browse History**: Click any previous check to reload it

## Classification Rules

### Client-Only

Code that uses:
- Browser globals: `window`, `document`, `localStorage`, `sessionStorage`
- React hooks: `useState`, `useEffect`, `useReducer`, etc.
- Event handlers: `onClick`, `onChange`, `onSubmit`
- Browser APIs: `navigator`, `geolocation`, `fetch` with credentials
- `"use client"` directive

### Server-Only

Code that uses:
- Node.js modules: `fs`, `path`, `crypto`, `os`
- Environment variables: `process.env`
- Database clients: Prisma, Drizzle, etc.
- `"use server"` directive
- `next/headers` (cookies, headers)
- Server-only imports

### Both (Isomorphic)

Code that:
- Contains pure functions without side effects
- Only defines types or interfaces
- Uses cross-environment utilities
- Doesn't access environment-specific globals

## Example Inputs/Outputs

### Example 1: Client Component

**Input:**
```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Output:**
- Classification: `Client Only`
- Explanation: Uses `"use client"` directive, `useState` hook, and `onClick` event handler

### Example 2: Server Action

**Input:**
```ts
'use server';

import { db } from '@/lib/db';

export async function createUser(name: string) {
  return db.user.create({ data: { name } });
}
```

**Output:**
- Classification: `Server Only`
- Explanation: Uses `"use server"` directive and direct database access

### Example 3: Utility Function

**Input:**
```ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

**Output:**
- Classification: `Both Safe`
- Explanation: Pure function using only standard JavaScript APIs available in both environments

## Project Structure

```
├── data/                    # Auto-created, stores local history
│   └── db.json
├── src/
│   ├── app/
│   │   ├── actions.ts       # Server actions for classification
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   ├── components/
│   │   ├── CodeEditor.tsx   # Code input component
│   │   ├── History.tsx      # History sidebar
│   │   └── ResultDisplay.tsx # Classification results
│   └── lib/
│       ├── db.ts            # Local JSON database
│       └── openai.ts        # OpenAI client
├── .env.example             # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Non-Goals (Future Labs Version)

This base version intentionally excludes:
- Repository scanning
- File uploads
- Multi-file analysis
- Fix suggestions
- User authentication
- Model fine-tuning

These features are planned for a future Labs version.

## License

MIT
