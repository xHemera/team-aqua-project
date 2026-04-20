# Components Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Atomic Components](#atomic-components)
- [Molecules](#molecules)
- [Organisms](#organisms)
- [Creating Components](#creating-components)

**Other Docs**: [Overview](frontend-overview.md) • [Hooks](hooks-guide.md) • [Auth](authentication-guide.md) • [Styling](styling-guide.md)

---

## Overview

Components follow **Atomic Design**:

- **Atoms**: Basic UI elements (Button, Input, Card, IconButton)
- **Molecules**: Atom combinations (IconField)
- **Organisms**: Complex sections (DeckSelector, MatchmakingModal)
- **Pages**: Routes orchestrating components

## Atomic Components

### Button

Universal button for all clickable actions.

**Location**: `components/atoms/Button.tsx`

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

**Usage**:
```tsx
<IconButton aria-label="Close" size="md" shape="circle">
  <i className="fa-solid fa-xmark" />
</IconButton>
```

## Molecules

### IconField

Input with leading icon.

**Location**: `components/molecules/IconField.tsx`

**Usage**:
```tsx
<IconField
  icon={<i className="fa-solid fa-envelope" />}
  input={{ type: 'email', placeholder: 'your@email.com' }}
  label="Email"
/>
```

## Organisms

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
