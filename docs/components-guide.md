# Components Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Atomic Components](#atomic-components)
- [Molecules](#molecules)
- [Organisms](#organisms)
- [Utility Components](#utility-components)

**Other Docs**: [Overview](frontend-overview.md) • [Hooks](hooks-guide.md) • [Auth](authentication-guide.md) • [Styling](styling-guide.md) • [API Reference](api-reference.md) • [Database](database-guide.md)

---

## Overview

Components follow **Atomic Design**:

- **Atoms**: Basic UI elements (Button, Input, Card, IconButton, StatusPill)
- **Molecules**: Simple combinations of atoms with minor logic (IconField, Banners, Bubbles)
- **Organisms**: Complex sections combining molecules and atoms (Modals, Lists, Panels)
- **Utility Components**: Global layout shells (AppPageShell, AuthPageLayout, Sidebar)
- **Pages**: Routes orchestrating components

## Atomic Components (atoms/)

### Button

Universal button for all clickable actions.

**Location**: `components/atoms/Button.tsx`

**Props**:
- `children`: React.ReactNode
- `variant`: 'primary' | 'secondary' | 'ghost' (default: 'primary')
- `isLoading`: boolean
- `disabled`: boolean
- `onClick`: () => void

**Usage**:
```tsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button isLoading>Loading...</Button>
```

### Input

Text input field with optional label, error, hint.

**Location**: `components/atoms/Input.tsx`

**Props**:
- `label`: string (optional)
- `type`: string (default: 'text')
- `placeholder`: string
- `error`: string (optional)
- `hint`: string (optional)
- `disabled`: boolean

**Usage**:
```tsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input label="Password" type="password" error="Min 8 chars" />
```

### Card

Container with consistent styling.

**Location**: `components/atoms/Card.tsx`

**Usage**:
```tsx
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### IconButton

Icon-only button (requires `aria-label` for accessibility).

**Location**: `components/atoms/IconButton.tsx`

**Props**:
- `aria-label`: string (required)
- `size`: 'sm' | 'md' | 'lg'
- `shape`: 'circle' | 'square'
- `children`: React.ReactNode (icon)

**Usage**:
```tsx
<IconButton aria-label="Close" size="md" shape="circle">
  <i className="fa-solid fa-xmark" />
</IconButton>
```

### StatusPill

Status badge component.

**Location**: `components/atoms/StatusPill.tsx`

**Usage**:
```tsx
<StatusPill status="online">Online</StatusPill>
<StatusPill status="offline">Offline</StatusPill>
<StatusPill status="busy">Busy</StatusPill>
```

### FeatureActionTile

Tile for home page feature actions (Expedition, PvP, etc.).

**Location**: `components/atoms/home/FeatureActionTile.tsx`

**Props**:
- `icon`: React.ReactNode
- `title`: string
- `description`: string
- `onClick`: () => void
- `disabled`: boolean

### Character Components

**Location**: `components/atoms/characters/`

- `SectionDivider.tsx`: Section header divider
- `StatRow.tsx`: Display character stat (HP, ATK, DEF, etc.)

## Molecules (molecules/)

### IconField

Input with leading icon.

**Location**: `components/molecules/IconField.tsx`

**Props**:
- `icon`: React.ReactNode
- `input`: InputProps
- `label`: string (optional)

**Usage**:
```tsx
<IconField
  icon={<i className="fa-solid fa-envelope" />}
  input={{ type: 'email', placeholder: 'your@email.com' }}
  label="Email"
/>
```

### Social Molecules

**Location**: `components/molecules/social/`

- `FriendRequestBanner.tsx`: Shows incoming friend request
- `DuelRequestBanner.tsx`: Shows incoming duel challenge
- `MessageBubble.tsx`: Individual message bubble
- `ConversationTab.tsx`: Tab for conversation in list

### Character Molecules

**Location**: `components/molecules/characters/`

- `CharacterPortraitOption.tsx`: Character portrait with selection
- `SkillCard.tsx`: Spell/skill card display

### Home Molecules

**Location**: `components/molecules/home/`

- `FeatureModalFrame.tsx`: Modal frame for feature modals

### Admin Molecules

**Location**: `components/molecules/admin/`

- `UserListItem.tsx`: User item in admin list
- `ReportListItem.tsx`: Reported conversation item
- `ConversationMessageBubble.tsx`: Message bubble for reports

## Organisms (organisms/)

### Home Organisms

**Location**: `components/organisms/home/`

- **`TeamBuilder`**: Build and display player team (3 characters)
- **`TeamBuilderModal`**: Modal for selecting team members
- **`MineSection`**: Resource accumulation (gold/rubis)
- **`ExpeditionTracker`**: Display active expeditions
- **`ExpeditionModal`**: Start new expedition
- **`PvpMatchmakingModal`**: PvP matchmaking queue
- **`NotificationToast`**: Toast notifications for events

### Characters Organisms

**Location**: `components/organisms/characters/`

- **`CharacterViewer`**: Main character roster manager
- **`CharacterSelectionPanel`**: Select character to view/upgrade
- **`CharacterDisplayPanel`**: Character portrait and details
- **`CharacterDetailsPanel`**: Character stats, spells, upgrades
- **`CharacterStatsSection`**: Display all character stats
- **Support files**:
  - `character-config.ts`: Configuration constants
  - `character-utils.ts`: Utility functions
  - `types.ts`: TypeScript types

### Social Organisms

**Location**: `components/organisms/social/`

- **`ConversationList`**: List of all conversations
- **`MessageThread`**: Display messages in a conversation
- **`ProfileViewer`**: Modal to view user profile

### Profile Organisms

**Location**: `components/organisms/profile/`

- **`ProfileHeader`**: User profile header with avatar, badges
- **`MatchHistoryList`**: Display user's match history

### Admin Organisms

**Location**: `components/organisms/admin/`

- **`UsersManagementPanel`**: Admin user management
- **`ReportedConversationsPanel`**: Admin report management

## Utility Components

### AppPageShell

Layout wrapper for app pages (with optional sidebar).

**Location**: `components/AppPageShell.tsx`

**Props**:
- `children`: React.ReactNode
- `showSidebar`: boolean (default: false)
- `mainClassName`: string
- `containerClassName`: string

**Usage**:
```tsx
<AppPageShell showSidebar>
  <div>Content</div>
</AppPageShell>
```

### AuthPageLayout

Layout wrapper for authentication pages.

**Location**: `components/AuthPageLayout.tsx`

**Usage**:
```tsx
<AuthPageLayout>
  <LoginForm />
</AuthPageLayout>
```

### Sidebar

Navigation sidebar with user profile, links, etc.

**Location**: `components/Sidebar.tsx`

**Features**:
- Current user profile with badges
- Navigation links
- Theme/accent preferences
- Logout button

### SidebarShell

Container for sidebar layout.

**Location**: `components/SidebarShell.tsx`

## Creating New Components

### Creating an Atom

```bash
touch components/atoms/MyAtom.tsx
```

```tsx
import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function MyAtom({ children, variant = 'primary' }: Props) {
  return (
    <div className={clsx('base-styles', variant === 'primary' && 'primary-variant')}>
      {children}
    </div>
  );
}
```

### Creating a Molecule

```bash
touch components/molecules/MyMolecule.tsx
```

```tsx
'use client';

import { MyAtom } from '@/components/atoms/MyAtom';

interface Props {
  title: string;
  subtitle: string;
}

export function MyMolecule({ title, subtitle }: Props) {
  return (
    <div className="space-y-2">
      <MyAtom variant="primary">{title}</MyAtom>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}
```

### Creating an Organism

```bash
touch components/organisms/MyOrganism.tsx
```

```tsx
'use client';

import { useEffect, useState } from 'react';
import { MyMolecule } from '@/components/molecules/MyMolecule';

export function MyOrganism() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data, setup subscriptions, etc.
  }, []);

  return (
    <section className="space-y-6">
      <MyMolecule title="Data" subtitle="Loading..." />
    </section>
  );
}
```

## Styling Notes

- **Tailwind CSS v4**: Utility-first styling with dark mode support
- **Class Composition**: Use `clsx` for conditional classes
- **CSS Modules**: Use for complex page-level styles only (e.g., `HomePage.module.css`)
- **Global Styles**: `app/globals.css` contains theme variables and resets
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

**Location**: `components/molecules/home/DeckOptionItem.tsx`

## Organisms

### DeckSelector

List and select available decks with localStorage persistence.

**Location**: `components/organisms/home/DeckSelector.tsx`

### MatchmakingModal

Modal for game queue and matchmaking status.

**Location**: `components/organisms/home/MatchmakingModal.tsx`

### PlayCta

Call-to-action button for starting a game.

**Location**: `components/organisms/home/PlayCta.tsx`

### NotificationToast

Auto-dismiss toast notifications (success, error, info).

**Location**: `components/organisms/home/NotificationToast.tsx`

## Layout Components

### AppPageShell

Wrapper for all pages (sidebar, background).

**Usage**:
```tsx
export default function Page() {
  return (
    <AppPageShell>
      <main>{/* content */}</main>
    </AppPageShell>
  );
}
```

### AuthPageLayout

Layout for auth pages (login, register).

**Usage**:
```tsx
export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
```

### Sidebar

Navigation sidebar with user profile section.

**Location**: `components/Sidebar.tsx`

## Creating Components

### New Atom Template

```tsx
'use client';

import clsx from 'clsx';

interface MyAtomProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const MyAtom = React.forwardRef<HTMLDivElement, MyAtomProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('base-classes', variant === 'primary' && 'primary-variant', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MyAtom.displayName = 'MyAtom';
```

### New Molecule Template

```tsx
'use client';

import React from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface MyMoleculeProps {
  onSubmit: (value: string) => void;
}

export function MyMolecule({ onSubmit }: MyMoleculeProps) {
  const [value, setValue] = React.useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); }}>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Best Practices

✅ Keep atoms simple and reusable
✅ Use TypeScript for prop types
✅ Include `aria-label` on icon buttons
✅ Use `React.forwardRef` for DOM elements
✅ Focus on single responsibility

❌ Mix business logic with UI
❌ Create overly generic components
❌ Skip accessibility attributes
❌ Duplicate component code
❌ Make atoms too complex

---

See [Frontend Overview](frontend-overview.md) for folder structure and how components fit together.
