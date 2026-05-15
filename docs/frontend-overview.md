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
├── app/                     # Routes (App Router)
│   ├── page.tsx            # Auth page (login/register - entry point)
│   ├── layout.tsx          # Root layout with fonts and global setup
│   ├── globals.css         # Global styles & CSS variables
│   ├── accent-preference-sync.tsx  # Theme accent sync component
│   ├── api/                # API endpoints
│   │   ├── auth/           # Better Auth routes
│   │   ├── characters/     # Character roster API
│   │   ├── users/          # Users listing
│   │   ├── social/         # Messaging, friends, etc.
│   │   ├── profile/        # User profiles
│   │   ├── admin/          # Admin endpoints
│   │   ├── avatars/        # Avatar management
│   │   ├── upload/         # File uploads
│   │   ├── home/           # Home page data
│   │   └── ...             # Other endpoints
│   ├── home/               # Home page - main dashboard
│   ├── game/               # Game page
│   ├── characters/         # Character roster & upgrades
│   ├── social/             # Messaging & friend management
│   ├── profile/[pseudo]/   # User profile pages
│   ├── admin/              # Admin dashboard
│   └── not-connected/      # Fallback page
├── components/             # Reusable UI (atomic design)
│   ├── atoms/              # Basic elements
│   ├── molecules/          # Atom combinations
│   └── organisms/          # Complex sections
├── lib/                    # Utilities & configurations
│   ├── auth.ts             # Better Auth server setup
│   ├── auth-client.ts      # Better Auth client setup
│   ├── prisma.ts           # Prisma ORM client
│   ├── avatar-preference.ts # Avatar accent management
│   ├── profile-icons.ts    # Profile icon utilities
│   ├── hero-portraits.ts   # Character portrait data
│   ├── date-utils.ts       # Date formatting utilities
│   ├── rateLimit.js        # Rate limiting middleware
│   └── redis.js            # Redis client configuration
├── prisma/                 # Database layer
│   ├── schema.prisma       # Data models
│   ├── migrations/         # Database migrations
│   └── prisma.config.ts    # Prisma configuration
├── socket.js               # Socket.IO client setup
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS configuration (Tailwind)
├── eslint.config.mjs       # ESLint configuration
├── package.json            # Dependencies
└── public/                 # Static assets
    ├── gameResources/      # Game images (heroes, items, spells)
    └── profile-icons/      # User profile icons
```

## Key Folders Explained

### `/app` - Pages & Routes
- **Entry Point**: `page.tsx` handles authentication (login/register)
- **Protected Routes**: `home/`, `game/`, `characters/`, `social/`, `profile/`, `admin/`
- **API Endpoints**: `/api/*` handles all backend communication
- **Server Components**: Use by default; only add `'use client'` for interactive features

### `/components` - Atomic Design Structure
- **atoms/**: Basic UI building blocks (Button, Input, Card, etc.)
- **molecules/**: Simple combinations of atoms (IconField, etc.)
- **organisms/**: Complex, feature-rich components (sections)

### `/lib` - Utilities & Configuration
- **auth.ts / auth-client.ts**: Better Auth setup (server + client)
- **prisma.ts**: Database ORM instance
- **Other utilities**: Date formatting, storage, icons, etc.

### `/prisma` - Database
- **schema.prisma**: Defines all data models (User, Character, Messages, etc.)
- **migrations/**: Version-controlled database schema changes

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
