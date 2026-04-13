# Authentication Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Setup](#setup)
- [Sign In/Up/Out](#sign-inupout)
- [Protected Routes](#protected-routes)
- [Best Practices](#best-practices)

**Other Docs**: [Overview](frontend-overview.md) • [Components](components-guide.md) • [Hooks](hooks-guide.md) • [Styling](styling-guide.md)

---

## Overview

Kyogre uses **Better Auth** for type-safe authentication with email/password, OAuth, and role-based access.

**Key Features**:
- Session management with 7-day expiry
- Type-safe client and server APIs
- Automatic token refresh
- Prisma integration

## Setup

### Environment Variables

```env
# .env.local
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-32-chars-minimum
DATABASE_URL=postgresql://user:password@localhost:5432/kyogre
```

### Server Config

**Location**: `lib/auth.ts`

```tsx
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: { expiresIn: 60 * 60 * 24 * 7 },
});
```

### Client Setup

**Location**: `lib/auth-client.ts`

```tsx
import { createAuthClient } from 'better-auth/react';

export const { useSession, signIn, signUp, signOut } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});
```

## Sign In/Up/Out

### Form Component

```tsx
'use client';

import { useState } from 'react';
import { signUp, signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp.email({
        email,
        password,
        name: email.split('@')[0],
      });
      router.push('/home');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn.email({ email, password });
      router.push('/home');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sign Up</button>
      <button type="button" onClick={handleSignIn}>Sign In</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Sign Out

```tsx
'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## Protected Routes

### Using useSession Hook

```tsx
'use client';

import { useSession } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export function DashboardPage() {
  const { data: session } = useSession();

  if (!session) {
    redirect('/');
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Server-Side Protection

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Profile: {session.user.email}</div>;
}
```

### Protected API Routes

```tsx
// app/api/user/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

## Best Practices

✅ Always check `useSession()` before accessing user data
✅ Use server-side auth checks for sensitive routes
✅ Store tokens securely (cookies by default)
✅ Redirect to login on 401 errors
✅ Use environment variables for auth URLs
✅ Validate all auth input on server

❌ Store tokens in localStorage
❌ Expose sensitive auth logic on client
❌ Skip session validation
❌ Commit .env.local with real secrets
❌ Trust only client-side security checks

---

See [Frontend Overview](frontend-overview.md) for more architecture patterns.

