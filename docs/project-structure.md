# Project Structure Reference

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Directory Overview](#directory-overview)
- [Frontend Structure](#frontend-structure)
- [WebSocket Server Structure](#websocket-server-structure)
- [Documentation Structure](#documentation-structure)
- [Key File Purposes](#key-file-purposes)

**Other Docs**: [Frontend Overview](frontend-overview.md) • [Database Guide](database-guide.md)

---

## Directory Overview

```
kyogre/
├── frontend/                      # Next.js frontend application
│   ├── app/                       # Pages and API routes
│   ├── components/                # Reusable UI components (atomic design)
│   ├── lib/                       # Utilities and configurations
│   ├── prisma/                    # Database schema and migrations
│   ├── public/                    # Static assets
│   ├── socket.js                  # Socket.IO client setup
│   ├── next.config.ts             # Next.js configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── package.json               # Dependencies and scripts
│   └── postcss.config.mjs         # PostCSS/Tailwind configuration
│
├── websockets/                    # Socket.IO server
│   ├── server.js                  # Main server file
│   ├── matchmaking.js             # PvP matchmaking logic
│   ├── package.json               # Dependencies
│   └── pnpm-lock.yaml             # Lock file
│
├── docs/                          # Project documentation
│   ├── README.md                  # Main project overview
│   ├── frontend-overview.md       # Frontend architecture
│   ├── components-guide.md        # Component library
│   ├── hooks-guide.md             # Custom hooks
│   ├── authentication-guide.md    # Auth setup and usage
│   ├── styling-guide.md           # Tailwind CSS patterns
│   ├── api-reference.md           # API endpoints
│   ├── database-guide.md          # Prisma and database models
│   ├── websocket-guide.md         # Socket.IO events
│   ├── game-features.md           # Game mechanics
│   ├── development-workflow.md    # Dev setup and tasks
│   ├── project-structure.md       # This file
│   └── deployment.md              # Deployment guide
│
├── docker-compose.yml             # Docker services configuration
├── dev.sh                         # Development helper script
├── README.md                      # Main repository README
├── AGENTS.md                      # AI agent instructions
└── package.json                   # Root package.json
```

## Frontend Structure

### `/frontend/app` - Pages and API Routes

```
frontend/app/
├── page.tsx                       # Entry point (login/register)
├── layout.tsx                     # Root layout
├── globals.css                    # Global styles
├── accent-preference-sync.tsx     # Theme sync component
│
├── api/                           # Backend endpoints
│   ├── auth/[...all]/            # Better Auth routes
│   ├── users/                     # User listing
│   ├── characters/                # Character roster
│   ├── social/                    # Messaging, friends
│   │   ├── inbox/                # Conversations
│   │   ├── msg/                  # Messages
│   │   ├── friend/               # Friend management
│   │   ├── block/                # Block/unblock
│   │   ├── report/               # Report conversation
│   │   ├── contact/              # Create conversation
│   │   ├── unread/               # Unread counts
│   │   └── ...
│   ├── profile/                   # User profiles
│   │   ├── banner/               # Profile banner upload
│   │   └── resources/            # Profile resources
│   ├── admin/                     # Admin endpoints
│   │   ├── users/                # User management
│   │   ├── reports/              # Report management
│   │   ├── role/                 # Role assignment
│   │   ├── ban/                  # User banning
│   │   └── ...
│   ├── avatars/                   # Avatar list
│   ├── upload/                    # File upload
│   ├── home/                      # Home page data
│   └── ...
│
├── home/                          # Home page (protected)
│   └── page.tsx
│
├── game/                          # Game page (protected)
│   └── page.tsx
│
├── characters/                    # Characters page (protected)
│   ├── page.tsx
│   ├── character-roster.ts        # Character data constants
│   └── types.ts                   # TypeScript types
│
├── social/                        # Social/messaging page (protected)
│   ├── page.tsx
│   ├── index.ts                   # Type definitions & helpers
│   ├── contact.tsx                # Contact types
│   └── types.ts                   # Socket types
│
├── profile/[pseudo]/              # Dynamic profile pages (protected)
│   ├── page.tsx                   # Server component
│   ├── ProfileClientView.tsx      # Client component
│   └── index.ts                   # Utilities
│
├── admin/                         # Admin dashboard (protected)
│   ├── page.tsx
│   ├── index.ts                   # Type definitions
│   ├── management.tsx             # Admin UI component
│   ├── types.ts                   # Admin types
│   └── ...
│
└── not-connected/                 # Fallback page
    └── page.tsx
```

### `/frontend/components` - Atomic Design Structure

```
frontend/components/
├── AppPageShell.tsx               # Main layout wrapper (with sidebar option)
├── AuthPageLayout.tsx             # Auth layout wrapper
├── Sidebar.tsx                    # Navigation sidebar
├── SidebarShell.tsx               # Sidebar container
│
├── atoms/                         # Basic UI elements
│   ├── Button.tsx                 # Universal button
│   ├── Input.tsx                  # Text input field
│   ├── Card.tsx                   # Card container
│   ├── IconButton.tsx             # Icon-only button
│   ├── StatusPill.tsx             # Status badge
│   │
│   ├── home/                      # Home-specific atoms
│   │   └── FeatureActionTile.tsx  # Feature tile
│   │
│   └── characters/                # Character-specific atoms
│       ├── SectionDivider.tsx     # Section header
│       └── StatRow.tsx            # Stat display
│
├── molecules/                     # Atom combinations
│   ├── IconField.tsx              # Input with icon
│   │
│   ├── admin/                     # Admin molecules
│   │   ├── UserListItem.tsx       # User in list
│   │   ├── ReportListItem.tsx     # Report item
│   │   └── ConversationMessageBubble.tsx
│   │
│   ├── characters/                # Character molecules
│   │   ├── CharacterPortraitOption.tsx
│   │   └── SkillCard.tsx          # Spell card
│   │
│   ├── home/                      # Home molecules
│   │   └── FeatureModalFrame.tsx  # Modal wrapper
│   │
│   └── social/                    # Social molecules
│       ├── FriendRequestBanner.tsx
│       ├── DuelRequestBanner.tsx
│       ├── MessageBubble.tsx
│       └── ConversationTab.tsx
│
└── organisms/                     # Complex sections
    ├── Validate.tsx               # Validation component
    │
    ├── admin/                     # Admin sections
    │   ├── UsersManagementPanel.tsx
    │   └── ReportedConversationsPanel.tsx
    │
    ├── characters/                # Character section
    │   ├── CharacterViewer.tsx    # Main container
    │   ├── CharacterSelectionPanel.tsx
    │   ├── CharacterDisplayPanel.tsx
    │   ├── CharacterDetailsPanel.tsx
    │   ├── CharacterStatsSection.tsx
    │   ├── character-config.ts    # Constants
    │   ├── character-utils.ts     # Helpers
    │   └── types.ts               # Types
    │
    ├── home/                      # Home sections
    │   ├── TeamBuilder.tsx        # Team display
    │   ├── TeamBuilderModal.tsx   # Team builder modal
    │   ├── MineSection.tsx        # Resources display
    │   ├── ExpeditionTracker.tsx  # Active expeditions
    │   ├── ExpeditionModal.tsx    # Start expedition
    │   ├── PvpMatchmakingModal.tsx # Matchmaking queue
    │   ├── NotificationToast.tsx  # Notifications
    │   └── HomePage.module.css    # Page styles
    │
    ├── profile/                   # Profile sections
    │   ├── ProfileHeader.tsx      # User header
    │   └── MatchHistoryList.tsx   # Match records
    │
    └── social/                    # Social sections
        ├── ConversationList.tsx   # Conversations
        ├── MessageThread.tsx      # Messages
        └── ProfileViewer.tsx      # Profile modal
```

### `/frontend/lib` - Utilities and Configurations

```
frontend/lib/
├── auth.ts                        # Better Auth server setup
├── auth-client.ts                 # Better Auth client setup
├── prisma.ts                      # Prisma ORM instance
├── avatar-preference.ts           # Avatar accent management
├── profile-icons.ts               # Profile icon utilities
├── hero-portraits.ts              # Character portrait data
├── date-utils.ts                  # Date/time formatting
├── rateLimit.js                   # Rate limiting helper
└── redis.js                       # Redis client
```

### `/frontend/prisma` - Database

```
frontend/prisma/
├── schema.prisma                  # Data model definitions
├── prisma.config.ts               # Prisma configuration
└── migrations/                    # Version-controlled migrations
    ├── migration_lock.toml
    └── [timestamp]_description/   # Each migration as folder
        └── migration.sql
```

### `/frontend/public` - Static Assets

```
frontend/public/
├── gameResources/                 # Game images
│   ├── heroes/                    # Character portraits
│   ├── items/                     # Item icons
│   └── spells/                    # Spell icons
└── profile-icons/                 # User profile icons
    ├── default-avatar.svg
    └── ...
```

## WebSocket Server Structure

```
websockets/
├── server.js                      # Main entry point
│   ├── Initializes Socket.IO
│   ├── Sets up CORS
│   ├── Connects to Redis
│   └── Registers event handlers
│
├── matchmaking.js                 # Matchmaking logic
│   ├── Queue management
│   ├── MMR-based pairing
│   └── Match session creation
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config (if used)
└── pnpm-lock.yaml                 # Dependency lock file
```

## Documentation Structure

```
docs/
├── README.md                      # Overview (in root)
├── frontend-overview.md           # Frontend architecture + folder structure
├── components-guide.md            # Atomic design + component catalog
├── hooks-guide.md                 # React hooks + custom hooks
├── authentication-guide.md        # Better Auth setup and usage
├── styling-guide.md               # Tailwind CSS patterns and global styles
├── api-reference.md               # All API endpoints documented
├── database-guide.md              # Prisma models and queries
├── websocket-guide.md             # Socket.IO events and real-time features
├── game-features.md               # Game mechanics and systems
├── development-workflow.md        # Dev setup, common tasks, debugging
├── project-structure.md           # This file - structure reference
└── deployment.md                  # Deployment instructions
```

## Key File Purposes

### Root Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Define all Docker services (web, db, redis, websocket) |
| `dev.sh` | Helper script to start development environment |
| `README.md` | Main project overview and quick start |
| `AGENTS.md` | AI agent instructions for development |
| `package.json` | Root package config (monorepo setup) |

### Frontend Configuration

| File | Purpose |
|------|---------|
| `frontend/next.config.ts` | Next.js configuration (remote images, build settings) |
| `frontend/tsconfig.json` | TypeScript compiler options (path aliases, etc.) |
| `frontend/postcss.config.mjs` | PostCSS setup for Tailwind CSS |
| `frontend/eslint.config.mjs` | ESLint rules for code quality |
| `frontend/package.json` | Next.js dependencies and scripts |
| `frontend/socket.js` | Socket.IO client initialization |
| `frontend/app/globals.css` | Global CSS variables and styles |
| `frontend/app/layout.tsx` | Root layout with fonts and metadata |

### Important App Files

| File | Purpose |
|------|---------|
| `frontend/app/page.tsx` | Entry point (auth page) |
| `frontend/app/home/page.tsx` | Main dashboard |
| `frontend/app/characters/page.tsx` | Character roster manager |
| `frontend/app/social/page.tsx` | Messaging system |
| `frontend/app/profile/[pseudo]/page.tsx` | User profile viewer |
| `frontend/app/admin/page.tsx` | Admin dashboard |

### Important Lib Files

| File | Purpose |
|------|---------|
| `frontend/lib/auth.ts` | Server-side auth configuration |
| `frontend/lib/auth-client.ts` | Client-side auth client |
| `frontend/lib/prisma.ts` | Singleton Prisma instance |
| `frontend/prisma/schema.prisma` | All database models |

### Component Organization

| Folder | Purpose | Examples |
|--------|---------|----------|
| `atoms/` | Basic building blocks | Button, Input, Card, Icon |
| `molecules/` | Combinations of atoms | IconField, MessageBubble, Banner |
| `organisms/` | Feature sections | Modal, Panel, List, Form |
| `organisms/home/` | Home page sections | TeamBuilder, ExpeditionTracker |
| `organisms/characters/` | Character section | CharacterViewer, StatSection |
| `organisms/social/` | Social section | ConversationList, MessageThread |

## Naming Conventions

### File Naming

- **Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`, `formatters.ts`)
- **Types**: PascalCase in file (e.g., `types.ts` containing `type User = {}`)
- **Pages**: lowercase or PascalCase (e.g., `page.tsx`)

### Component Naming

- **Atoms**: Single word or short phrase (`Button`, `Input`, `Card`)
- **Molecules**: Descriptive with domain (`IconField`, `MessageBubble`)
- **Organisms**: Feature names (`CharacterViewer`, `TeamBuilder`)

### Database Models

- **PascalCase**: `User`, `Character`, `GameState`
- **Plural for collections**: `Friends`, `Messages`, `Spells`
- **Descriptive**: `Match_history`, `Reported_Conv`, `Inbox_users`

### API Routes

- **Lowercase with slashes**: `/api/users`, `/api/social/friend`
- **Action verbs optional**: `/api/characters` (GET, POST)
- **Dynamic routes**: `/api/profile/[pseudo]`, `/profile/[pseudo]`

## Common Patterns

### Route Pattern

```
/frontend/app/[section]/[page]/page.tsx
```

Examples:
- `/frontend/app/home/page.tsx` → `http://localhost:3000/home`
- `/frontend/app/social/page.tsx` → `http://localhost:3000/social`
- `/frontend/app/profile/[pseudo]/page.tsx` → `http://localhost:3000/profile/username`

### API Endpoint Pattern

```
/frontend/app/api/[resource]/[action]/route.ts
```

Examples:
- `/frontend/app/api/users/route.ts` → `GET /api/users`
- `/frontend/app/api/characters/route.ts` → `GET /api/characters`, `POST /api/characters`
- `/frontend/app/api/social/friend/route.ts` → Friend operations

### Type Imports

```typescript
import type { ComponentProps } from 'react';
import type { Character } from '@/components/organisms/characters/types';
```

### Path Aliases

All imports use `@/` prefix:
```typescript
import { Button } from '@/components/atoms/Button';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
```

Configured in `frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
