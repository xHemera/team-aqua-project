# Hooks Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Built-in Hooks](#built-in-hooks)
- [Custom Hooks](#custom-hooks)
- [Common Patterns](#common-patterns)

**Other Docs**: [Overview](frontend-overview.md) • [Components](components-guide.md) • [Auth](authentication-guide.md) • [Styling](styling-guide.md)

---

## Overview

Hooks let you use React features in functional components. This guide covers React built-in hooks and custom hooks specific to Kyogre.

## Built-in Hooks

### useState

Manage component state.

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### useEffect

Run side effects (fetch data, subscriptions).

```tsx
'use client';

import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []); // Run once on mount

  if (loading) return <div>Loading...</div>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### useCallback

Memoize callback functions to prevent unnecessary re-renders.

```tsx
'use client';

import { useCallback, useState } from 'react';

export function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Add dependencies if needed

  return <Child onClick={handleClick} />;
}
```

### useMemo

Memoize expensive calculations.

```tsx
'use client';

import { useMemo, useState } from 'react';

export function ExpensiveList() {
  const [items, setItems] = useState([3, 1, 2]);

  const sorted = useMemo(() => items.sort((a, b) => a - b), [items]);
  return <div>{sorted.join(', ')}</div>;
}
```

### useRef

Access DOM elements or persist values.

```tsx
'use client';

import { useRef } from 'react';

export function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

### useContext

Access context values without prop drilling.

```tsx
'use client';

import { createContext, useContext } from 'react';

const ThemeContext = createContext<string>('light');

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

## Custom Hooks

### useAvatarPreference

Sync user avatar across pages via localStorage.

**Location**: `hooks/useAvatarPreference.ts`

```tsx
'use client';

import { useAvatarPreference } from '@/hooks/useAvatarPreference';

export function Avatar() {
  const url = useAvatarPreference();
  return url ? <img src={url} alt="Avatar" /> : <div>No avatar</div>;
}
```

### useDeckPreferences

Manage deck selection with localStorage persistence.

**Location**: `hooks/useDeckPreferences.ts`

```tsx
'use client';

import { useDeckPreferences } from '@/hooks/useDeckPreferences';

export function DeckSelect() {
  const { selectedDeck, availableDecks, setSelectedDeck } = useDeckPreferences();
  return (
    <select
      value={selectedDeck?.id || ''}
      onChange={(e) => setSelectedDeck(e.target.value)}
    >
      {availableDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}
```

## Common Patterns

### useHoveredItem

Manage which item is hovered in a list.

```tsx
'use client';

import { useState } from 'react';

export function useHoveredItem() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return {
    hoveredId,
    onMouseEnter: (id: string) => setHoveredId(id),
    onMouseLeave: () => setHoveredId(null),
  };
}

// Usage
export function ItemList({ items }: { items: Item[] }) {
  const { hoveredId, onMouseEnter, onMouseLeave } = useHoveredItem();

  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          onMouseEnter={() => onMouseEnter(item.id)}
          onMouseLeave={onMouseLeave}
          className={hoveredId === item.id ? 'highlighted' : ''}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### useAsync

Handle async operations with loading/error states.

```tsx
'use client';

import { useState, useEffect } from 'react';

export function useAsync<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fn()
      .then(data => !cancelled && setState({ data, loading: false, error: null }))
      .catch(error => !cancelled && setState({ data: null, loading: false, error }));

    return () => { cancelled = true; };
  }, [fn]);

  return state;
}

// Usage
export function UserData() {
  const { data: user, loading, error } = useAsync(() => fetch('/api/user').then(r => r.json()));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>User: {user?.name}</div>;
}
```

### useDebounce

Delay execution of a function.

```tsx
'use client';

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Search with debounce
export function SearchUsers() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetch(`/api/users?q=${debouncedSearch}`);
    }
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearch(e.target.value)} />;
}
```

### useLocalStorage

Persist state to localStorage.

```tsx
'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStored(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [stored, setValue];
}

// Usage
export function Preferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle theme ({theme})
    </button>
  );
}
```

## Best Practices

✅ Name hooks starting with `use`
✅ Put hooks at the top level of components
✅ Extract logic into custom hooks
✅ Use TypeScript for parameters and return types
✅ Test hooks with React Testing Library

❌ Call hooks conditionally
❌ Call hooks from non-React functions
❌ Mix async logic with hooks (use useEffect)
❌ Create overly complex hooks

---

See [Frontend Overview](frontend-overview.md) for component architecture and design patterns.
