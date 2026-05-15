# Hooks Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Built-in Hooks](#built-in-hooks)
- [Authentication](#authentication)
- [Socket.IO Patterns](#socketio-patterns)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)

**Other Docs**: [Overview](frontend-overview.md) • [Components](components-guide.md) • [Auth](authentication-guide.md) • [Styling](styling-guide.md)

---

## Overview

Hooks let you use React features in functional components. This guide covers React built-in hooks and common patterns in Kyogre.

**Key Principle**: Components using hooks must have `'use client'` directive.

## Built-in Hooks

### useState

Manage component state.

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useEffect

Run side effects (fetch data, subscriptions, listeners).

```typescript
'use client';

import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Effect runs on mount (empty dependency array)
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // Empty deps: run once

  return loading ? <div>Loading...</div> : <ul>...</ul>;
}
```

**With Dependencies**:
```typescript
useEffect(() => {
  // Runs when userId changes
  loadUserData(userId);
}, [userId]); // Dependency array

// Cleanup function
useEffect(() => {
  socket.on('message', handleMessage);
  
  return () => {
    socket.off('message', handleMessage); // Cleanup
  };
}, []);
```

### useCallback

Memoize callback functions to prevent unnecessary re-renders.

```typescript
'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/atoms/Button';

export function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Memoized: won't change on re-render

  return <Button onClick={handleClick}>+</Button>;
}
```

### useMemo

Memoize expensive calculations.

```typescript
'use client';

import { useMemo, useState } from 'react';

export function ExpensiveList() {
  const [items, setItems] = useState([3, 1, 2]);

  // Only recalculates when items changes
  const sorted = useMemo(() => {
    console.log('Sorting...');
    return items.sort((a, b) => a - b);
  }, [items]);

  return <div>{sorted.join(', ')}</div>;
}
```

### useRef

Access DOM elements or persist values across renders.

```typescript
'use client';

import { useRef } from 'react';

export function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>Focus Input</button>
    </>
  );
}
```

### useContext

Access context values without prop drilling.

```typescript
'use client';

import { createContext, useContext } from 'react';

const ThemeContext = createContext<string>('light');

export function useTheme() {
  return useContext(ThemeContext);
}

// Usage
export function ThemedComponent() {
  const theme = useTheme();
  return <div className={theme}>Content</div>;
}
```

## Authentication

### Using authClient

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authClient.signIn.email({
        email,
        password
      });
      router.push('/home');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Check Session

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      if (data?.user) {
        setUser(data.user);
      } else {
        // Not logged in
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.name}</div>;
}
```

## Socket.IO Patterns

### Connection Management

```typescript
'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/socket';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect on mount
    socket.connect();

    // Listen for connection events
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Don't disconnect - let other components use it
    };
  }, []);

  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );
}
```

### Custom Hook for Socket Events

```typescript
'use client';

import { useEffect, useCallback } from 'react';
import { socket } from '@/socket';

/**
 * Hook to listen to socket events
 * Automatically cleans up on unmount
 */
export function useSocket<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: any[] = []
) {
  const memoizedHandler = useCallback(handler, deps);

  useEffect(() => {
    socket.on(event, memoizedHandler);

    return () => {
      socket.off(event, memoizedHandler);
    };
  }, [event, memoizedHandler]);
}

// Usage
export function MessageListener() {
  useSocket('message:received', (msg) => {
    console.log('New message:', msg);
  });

  return <div>Listening for messages...</div>;
}
```

### Emit Socket Event

```typescript
'use client';

import { useState } from 'react';
import { socket } from '@/socket';

export function SendMessage() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    socket.emit('message:send', {
      inboxId: 'inbox-123',
      message: message
    });
    setMessage('');
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

## Common Patterns

### Avoiding Hydration Mismatch with localStorage

```typescript
'use client';

import { useEffect, useState } from 'react';

export function UserPreferences() {
  const [theme, setTheme] = useState<string | null>(null);

  // Only read localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    setTheme(stored || 'light');
  }, []);

  // Don't render until hydrated
  if (theme === null) return null;

  return <div>Theme: {theme}</div>;
}
```

### Debounced Input

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';

export function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Debounce search
    const timeout = setTimeout(() => {
      if (query.length > 0) {
        fetch(`/api/users?search=${query}`)
          .then(r => r.json())
          .then(setResults);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### Polling Data

```typescript
'use client';

import { useEffect, useState } from 'react';

export function ExpeditionTracker() {
  const [expeditions, setExpeditions] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchExpeditions = async () => {
      const res = await fetch('/api/characters');
      const data = await res.json();
      setExpeditions(data.activeExpeditions);
    };

    fetchExpeditions();

    // Poll every 5 seconds
    const interval = setInterval(fetchExpeditions, 5000);

    return () => clearInterval(interval);
  }, []);

  return <div>{expeditions.length} active expeditions</div>;
}
```

## Best Practices

### ✅ Do's

1. **Use dependency array correctly**
   ```typescript
   // ✅ Correct
   useEffect(() => {
     loadData(userId);
   }, [userId]); // Re-run when userId changes
   ```

2. **Clean up subscriptions**
   ```typescript
   // ✅ Correct
   useEffect(() => {
     socket.on('event', handler);
     return () => socket.off('event', handler);
   }, []);
   ```

3. **Name custom hooks with `use` prefix**
   ```typescript
   // ✅ Correct
   export function useSocket(event, handler) { ... }
   export function useUser() { ... }
   ```

### ❌ Don'ts

1. **Don't call hooks conditionally**
   ```typescript
   // ❌ Wrong
   if (user) {
     const data = useState(null); // ❌ Can't do this
   }
   
   // ✅ Correct
   const [data, setData] = useState(null);
   ```

2. **Don't forget cleanup functions**
   ```typescript
   // ❌ Wrong - memory leak
   useEffect(() => {
     socket.on('event', handler);
     // Missing cleanup
   }, []);
   
   // ✅ Correct
   useEffect(() => {
     socket.on('event', handler);
     return () => socket.off('event', handler);
   }, []);
   ```

3. **Don't use stale closures**
   ```typescript
   // ❌ Wrong - count is stale
   useEffect(() => {
     const timer = setInterval(() => {
       console.log(count); // Always same value
     }, 1000);
   }, []); // count not in deps
   
   // ✅ Correct
   useEffect(() => {
     const timer = setInterval(() => {
       console.log(count);
     }, 1000);
   }, [count]); // Include in deps
   ```
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
