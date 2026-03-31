# Frontend Architecture Overview

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Folder Structure](#folder-structure)
- [Quick Start](#quick-start)

**Other Docs**: [Components](components-guide.md) • [Hooks](hooks-guide.md) • [Auth](authentication-guide.md) • [Styling](styling-guide.md)

---

## Overview

The frontend is a Next.js 16 application using the App Router with **atomic design** architecture. It features type-safe authentication via Better Auth, responsive design with Tailwind CSS, and modular component structure.

**Tech Stack**:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- Better Auth

## Key Concepts
## Folder Structure

```
frontend/
├── app/                # Routes (App Router)
│   ├── (auth)/        # Public routes: login, register
│   ├── (main)/        # Protected routes: home, game, profile
│   └── api/           # Backend endpoints
├── components/        # Reusable UI (atoms, molecules, organisms)
├── hooks/             # Custom React hooks
├── lib/               # Utilities, auth, storage
└── prisma/            # Database schema & migrations
```

## Quick Start

### Creating a Page

```bash
mkdir -p app/(section)/page-name
touch app/(section)/page-name/page.tsx
```

```tsx
// Use Server Components by default
export default function Page() {
  return <main><h1>Page Name</h1></main>;
}
```

### Creating a Component

```bash
touch components/atoms/MyComponent.tsx
```

```tsx
import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function MyComponent({ children, variant = 'primary' }: Props) {
  return (
    <div className={clsx('base-styles', variant === 'primary' && 'primary-variant')}>
      {children}
    </div>
  );
}
```

### Creating a Hook

```bash
touch hooks/useMyHook.ts
```

```tsx
'use client';

import { useState } from 'react';

export function useMyHook() {
  const [state, setState] = useState(null);
  return { state, setState };
}
```

## Core Patterns

### Server vs Client Components

- **Server Components** (default): Data fetching, auth checks, server operations
- **Client Components** (`'use client'`): User interactions, browser APIs, hooks

### Atomic Design Hierarchy

1. **Atoms**: `Button`, `Input`, `Card` - basic UI elements
2. **Molecules**: `IconField` - atom combinations
3. **Organisms**: `DeckSelector` - complex sections
4. **Pages**: Routes that orchestrate everything

### Data Fetching

- **Server Components**: Use `fetch()` or Prisma directly
- **Client Components**: Call `/api/*` endpoints
- **State**: Use custom hooks for shared logic

## Best Practices

✅ Use Server Components by default
✅ Keep components small and focused
✅ Extract logic into custom hooks
✅ Follow atomic design principles
✅ Use TypeScript everywhere

❌ Fetch data in Client Components directly
❌ Create large monolithic components
❌ Use `any` types
❌ Duplicate code between components
❌ Put all state at the app level

---

See [Components Guide](components-guide.md) for available components and how to use them.
