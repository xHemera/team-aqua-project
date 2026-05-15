# Authentication Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Setup](#setup)
- [Client-Side Auth](#client-side-auth)
- [Server-Side Auth](#server-side-auth)
- [Protecting Routes](#protecting-routes)
- [Best Practices](#best-practices)

**Other Docs**: [Overview](frontend-overview.md) • [Components](components-guide.md) • [Hooks](hooks-guide.md) • [Styling](styling-guide.md)

---

## Overview

Kyogre uses **Better Auth** for type-safe authentication with email/password support.

**Key Features**:
- Session management with 7-day expiry
- Email/password authentication
- Type-safe API on client and server
- Automatic token refresh
- Prisma database integration
- Role-based access control

## Setup

### Environment Variables

Create `.env.local` in `frontend/`:

```env
# Required
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
DATABASE_URL=postgresql://user:password@localhost:5432/kyogre
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

**Notes**:
- `BETTER_AUTH_SECRET` must be at least 32 characters
- Generate with: `openssl rand -hex 16` or similar
- `NEXT_PUBLIC_SOCKET_URL` exposed to client for WebSocket connection

### Server Configuration

**Location**: `frontend/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  
  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  
  // URLs
  basePath: '/api/auth',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

export type Session = typeof auth.$Infer.Session;
```

### Client Configuration

**Location**: `frontend/lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'
});

export type Session = typeof authClient.$Infer.Session;
```

### API Route Handler

**Location**: `frontend/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

This single file handles all Better Auth endpoints.

## Client-Side Auth

### Sign Up

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      // Redirect to home on success
      router.push('/home');
    } catch (err) {
      setError((err as Error).message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 8 chars)"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Sign In

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authClient.signIn.email({
        email,
        password,
      });
      
      router.push('/home');
    } catch (err) {
      setError((err as Error).message || 'Sign in failed');
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
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
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

### Sign Out

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
```

### Check Current Session

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
        console.log('Logged in as:', data.user.name);
      } else {
        console.log('Not logged in');
      }
      
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## Server-Side Auth

### Protect API Routes

```typescript
// frontend/app/api/protected/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Check if user is authenticated
  if (!session?.user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  const userId = session.user.id;
  const username = session.user.name;

  return Response.json({
    message: 'Protected data',
    user: { id: userId, name: username }
  });
}
```

### Protect Server Components

```typescript
// frontend/app/protected/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/'); // Redirect to login
  }

  return (
    <main>
      <h1>Hello, {session.user.name}</h1>
      <p>This page is protected.</p>
    </main>
  );
}
```

## Protecting Routes

### Client-Side Route Protection

For pages that redirect on client:

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      
      if (data?.user) {
        setIsAuthed(true);
      } else {
        router.push('/'); // Redirect to login
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthed) return null;

  return (
    <main>
      <h1>Protected Content</h1>
    </main>
  );
}
```

### Middleware Protection (Next.js)

For more advanced routing, create middleware (optional):

```typescript
// middleware.ts (in root of frontend)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user has session cookie
  const session = request.cookies.get('better-auth.session_token');

  // Redirect to login if no session
  if (!session && request.nextUrl.pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/game/:path*', '/characters/:path*'],
};
```

## Best Practices

### ✅ Do's

1. **Always check auth on protected endpoints**
   ```typescript
   // ✅ Correct
   if (!session?.user) {
     return Response.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Use Better Auth's type-safe methods**
   ```typescript
   // ✅ Correct
   await authClient.signUp.email({ email, password, name });
   
   // ❌ Avoid: manual API calls
   await fetch('/api/auth/signup', { ... });
   ```

3. **Store session in component state (client)**
   ```typescript
   // ✅ Correct
   const { data: session } = await authClient.getSession();
   setUser(session?.user);
   ```

4. **Verify on server for sensitive operations**
   ```typescript
   // ✅ Correct - verify again on POST/PUT/DELETE
   const session = await auth.api.getSession({ headers: await headers() });
   if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
   ```

### ❌ Don'ts

1. **Don't trust client-only session checks**
   ```typescript
   // ❌ Wrong - client can be manipulated
   if (localStorage.getItem('userId')) { /* allow action */ }
   
   // ✅ Correct - verify on server
   const session = await auth.api.getSession({ headers });
   ```

2. **Don't expose user IDs in responses without checking auth**
   ```typescript
   // ❌ Wrong
   const users = await prisma.user.findMany(); // Expose all users
   
   // ✅ Correct
   if (!session?.user) return unauthorized;
   const user = await prisma.user.findUnique({ where: { id: session.user.id } });
   ```

3. **Don't store sensitive data in localStorage**
   ```typescript
   // ❌ Wrong
   localStorage.setItem('token', sensitiveToken);
   
   // ✅ Correct - Better Auth handles tokens securely
   ```

4. **Don't forget to handle token expiry**
   ```typescript
   // ✅ Correct - Better Auth auto-refreshes
   const { data } = await authClient.getSession();
   // If expired, Better Auth refreshes automatically
   ```

## User Roles & Permissions

### Admin Check

```typescript
// frontend/app/api/admin/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { badges: true }
  });

  if (!user?.badges.includes('admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Admin only logic here
  return Response.json({ message: 'Admin access granted' });
}
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS, never HTTP
2. **Session Duration**: 7 days is reasonable; adjust in `auth.ts` if needed
3. **Password Strength**: 8 character minimum enforced
4. **CSRF Protection**: Better Auth handles CSRF automatically
5. **Rate Limiting**: Use `/lib/rateLimit.js` on auth endpoints
6. **Audit Logging**: Log authentication events for security

## Troubleshooting

### "Unauthorized" on Protected Route

1. Ensure user is logged in: Check browser cookies
2. Verify session on server: Call `auth.api.getSession()`
3. Check token expiry: Session cookie should exist
4. Clear browser cache and try again

### Login Always Fails

1. Verify environment variables are set
2. Check database connection: `DATABASE_URL`
3. Check BETTER_AUTH_SECRET is at least 32 chars
4. Verify user doesn't already exist (sign up)
5. Check email/password are correct (sign in)

### Session Lost on Refresh

- This is normal if page does full reload
- Check if session cookie exists in DevTools → Application → Cookies
- Better Auth should restore session automatically

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

