# Client/Server Boundary Checker - Demo Examples

Use these code snippets to demonstrate the classification functionality.
Copy and paste each example into the code editor to see the results.

---

## 1. Client-Only Examples

### Example 1A: React Hook Component
```tsx
'use client';

import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### Example 1B: Browser API Usage
```typescript
function saveUserPreference(key: string, value: string) {
  localStorage.setItem(key, value);

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
}
```

### Example 1C: Event Handlers
```tsx
export function SearchInput() {
  return (
    <input
      type="text"
      onChange={(e) => console.log(e.target.value)}
      onFocus={() => document.body.style.overflow = 'hidden'}
    />
  );
}
```

---

## 2. Server-Only Examples

### Example 2A: Server Action with Database
```typescript
'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function createPost(title: string, content: string) {
  const session = cookies().get('session');

  return db.post.create({
    data: { title, content, authorId: session?.value }
  });
}
```

### Example 2B: File System Access
```typescript
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function loadConfig() {
  const configPath = join(process.cwd(), 'config.json');
  const data = readFileSync(configPath, 'utf-8');
  return JSON.parse(data);
}
```

### Example 2C: Environment Variables & Headers
```typescript
import { headers } from 'next/headers';

export async function getApiData() {
  const apiKey = process.env.SECRET_API_KEY;
  const userAgent = headers().get('user-agent');

  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-User-Agent': userAgent || ''
    }
  });

  return response.json();
}
```

---

## 3. Both-Safe Examples

### Example 3A: Pure Utility Function
```typescript
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}
```

### Example 3B: Type Definitions
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
```

### Example 3C: Data Transformation
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
```

### Example 3D: Simple React Component (No Hooks)
```tsx
interface CardProps {
  title: string;
  description: string;
}

export function Card({ title, description }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
```

---

## Demo Flow Suggestion

1. **Start with Client-Only** (Example 1A) - Shows hooks and browser APIs
2. **Show Server-Only** (Example 2A) - Shows database and cookies
3. **Demonstrate Both-Safe** (Example 3A) - Shows pure functions
4. **Quick comparisons** - Toggle between similar functions
5. **Check history** - Show how past analyses are saved

---

## Edge Cases to Demo

### Ambiguous Code (Classifies as "both" with explanation)
```typescript
export async function fetchData(url: string) {
  const response = await fetch(url);
  return response.json();
}
```
*Note: Basic fetch works in both environments*

### Mixed Signals (Should be client-only)
```tsx
// Has "use client" but also looks like it could be server
'use client';

export function DataDisplay({ data }: { data: string[] }) {
  return (
    <ul>
      {data.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
```
