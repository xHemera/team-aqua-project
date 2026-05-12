# Development Workflow & Setup Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Local Development Setup](#local-development-setup)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Debugging](#debugging)
- [Testing](#testing)
- [Performance Tips](#performance-tips)

**Other Docs**: [Project Structure](project-structure.md) • [Frontend Overview](frontend-overview.md)

---

## Local Development Setup

### Prerequisites

- **Docker + Docker Compose**: Container orchestration
- **Git**: Version control
- **Node.js 18+** (optional, for local development)
- **Bun 1.2.5+** (if not using Docker)

### Quick Start

**Option 1: Using Helper Script** (Recommended)

```bash
git clone <repo-url> kyogre
cd kyogre
./dev.sh
```

The script handles Docker setup and launches the stack.

**Option 2: Manual Docker**

```bash
docker compose up --build -d
```

Then visit `http://localhost:3000`

**Option 3: Local Development** (without Docker)

```bash
# Install dependencies
cd frontend
bun install
cd ../websockets
bun install
cd ..

# Start frontend (dev mode)
cd frontend
bun run dev

# In another terminal, start WebSocket server
cd websockets
npm start

# In another terminal, start PostgreSQL and Redis locally
# (or use Docker compose just for those services)
```

### Initial Setup

1. **Create `.env.local`** in `frontend/`:
```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
DATABASE_URL=postgresql://user:password@localhost:5432/kyogre
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

2. **Run database migrations**:
```bash
cd frontend
bun run prisma migrate deploy
# or for development with seed
bun run prisma migrate dev
```

3. **Access the app**:
- Frontend: `http://localhost:3000`
- WebSocket Server: `ws://localhost:4001`
- Prisma Studio (database GUI): `http://localhost:5555` after running `bun run prisma studio`

## Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────┐
│          Browser (User Client)                  │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐      ┌──────────────┐
│ HTTP   │      │  WebSocket   │
│ (REST) │      │ (Socket.IO)  │
└────┬───┘      └──────┬───────┘
     │                 │
     └────────┬────────┘
              │
     ┌────────▼────────┐
     │  Next.js App    │
     │ (Frontend)      │
     │ port: 3000      │
     └────────┬────────┘
              │
     ┌────────▼──────────┐
     │   API Routes      │
     │ (/api/*)          │
     │ (Server-side)     │
     └────────┬──────────┘
              │
     ┌────────┼────────┐
     │        │        │
     ▼        ▼        ▼
  ┌──────┐ ┌──────┐ ┌─────────────┐
  │ DB   │ │Redis │ │ WebSocket   │
  │      │ │      │ │ Server      │
  │Postgres       │ │(Bun/Node)   │
  │(Prisma)       │ │port: 4001   │
  └──────┘ └──────┘ └─────────────┘
```

### Services in Docker Compose

**Services** (in `docker-compose.yml`):
- **web**: Next.js frontend (port 3000)
- **db**: PostgreSQL database
- **redis**: Redis cache/session store
- **websocket**: Socket.IO server (port 4001)

**Networking**: All services on internal Docker network
**Volumes**: Database persistence, hot reload for code

## Development Workflow

### Starting Development

**Terminal 1 - Start all services**:
```bash
./dev.sh
# or
docker compose up --build
```

This starts:
- PostgreSQL database on localhost:5432
- Redis on localhost:6379
- Next.js on localhost:3000 (with hot reload)
- WebSocket server on localhost:4001

### Making Changes

**Frontend Code** (pages, components, lib):
1. Edit files in `frontend/`
2. Next.js hot reload automatically refreshes browser
3. No need to restart

**API Routes** (`frontend/app/api/`):
1. Edit endpoint files
2. Next.js auto-reloads
3. Test with API client

**Database Schema** (`frontend/prisma/schema.prisma`):
1. Edit schema file
2. Create migration:
   ```bash
   cd frontend
   bun run prisma migrate dev --name description_of_change
   ```
3. Migration applied automatically

**WebSocket Server** (`websockets/server.js`):
1. Edit server code
2. Restart container:
   ```bash
   docker compose restart websocket
   ```
3. Or if running locally: Restart process

### Git Workflow

**Feature Branch**:
```bash
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: describe change"
git push origin feature/my-feature
```

**Commit Conventions**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code reorganization
- `perf:` Performance improvement
- `test:` Test addition/modification
- `chore:` Dependency, build, CI changes

## Common Tasks

### Add a New Page

**Create page structure**:
```bash
mkdir -p frontend/app/mypage
touch frontend/app/mypage/page.tsx
```

**Create Server Component** (default):
```typescript
// frontend/app/mypage/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect('/'); // Protect page
  }

  return (
    <main>
      <h1>My Page</h1>
      <p>Welcome, {session.user.name}</p>
    </main>
  );
}
```

**Access at**: `http://localhost:3000/mypage`

### Add a New API Endpoint

**Create endpoint**:
```bash
mkdir -p frontend/app/api/myendpoint
touch frontend/app/api/myendpoint/route.ts
```

**Implement**:
```typescript
// frontend/app/api/myendpoint/route.ts
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // Verify user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Your logic
    const data = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
```

**Access at**: `GET http://localhost:3000/api/myendpoint`

### Add a New Component

**Atom** (basic element):
```typescript
// frontend/components/atoms/MyAtom.tsx
interface Props {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function MyAtom({ title, variant = 'primary' }: Props) {
  return (
    <div className={variant === 'primary' ? 'text-blue-500' : 'text-gray-500'}>
      {title}
    </div>
  );
}
```

**Molecule** (combination):
```typescript
// frontend/components/molecules/MyMolecule.tsx
'use client';

import { MyAtom } from '@/components/atoms/MyAtom';

export function MyMolecule() {
  return (
    <section>
      <MyAtom title="Title" variant="primary" />
      <p>Description</p>
    </section>
  );
}
```

**Organism** (complex section):
```typescript
// frontend/components/organisms/MyOrganism.tsx
'use client';

import { useEffect, useState } from 'react';
import { MyMolecule } from '@/components/molecules/MyMolecule';

export function MyOrganism() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/myendpoint')
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <div>
      <MyMolecule />
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  );
}
```

### Add Socket.IO Events

**Server** (in `websockets/server.js`):
```javascript
io.on('connection', (socket) => {
  // Custom event
  socket.on('myEvent', (data) => {
    console.log('Received:', data);
    
    // Send response to client
    socket.emit('myEventResponse', { success: true });
    
    // Broadcast to all clients
    io.emit('announcement', data);
  });
});
```

**Client** (in component):
```typescript
'use client';

import { useEffect } from 'react';
import { socket } from '@/socket';

export function MyComponent() {
  useEffect(() => {
    // Listen to event
    socket.on('myEventResponse', (response) => {
      console.log('Response:', response);
    });

    return () => socket.off('myEventResponse');
  }, []);

  const handleClick = () => {
    // Emit event to server
    socket.emit('myEvent', { message: 'hello' });
  };

  return <button onClick={handleClick}>Send Event</button>;
}
```

## Debugging

### Browser DevTools

**React DevTools**:
- Install extension
- Inspect components, props, hooks
- Profile performance

**Network Tab**:
- Monitor API calls
- Check WebSocket frames
- View request/response bodies

### Server-Side Logging

**Frontend (Next.js)**:
```typescript
// In API routes or Server Components
console.log('Debug message');
console.error('Error:', error);
```

**View logs**:
```bash
docker logs kyogre-web-1     # Frontend
docker logs kyogre-websocket-1  # WebSocket server
docker logs kyogre-db-1      # Database
```

### Database Debugging

**Prisma Studio** (GUI):
```bash
cd frontend
bun run prisma studio
# Opens http://localhost:5555
```

**SQL Queries** (enable logging):
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

### WebSocket Debugging

**Socket.IO DevTools**:
- Install browser extension
- Monitor events, emissions, connections

**Client logging**:
```typescript
socket.onAny((event, ...args) => {
  console.log(`Socket event: ${event}`, args);
});
```

## Testing

### Running Tests

```bash
# Frontend tests
cd frontend
bun run test

# ESLint check
bun run lint

# Build check
bun run build
```

### Manual Testing Checklist

- [ ] Create account (sign up)
- [ ] Login/logout
- [ ] View home page
- [ ] Build team
- [ ] Start expedition
- [ ] Send friend request
- [ ] Send message
- [ ] View profile
- [ ] Challenge in PvP
- [ ] Admin panel (if admin)

## Performance Tips

### Frontend Optimization

1. **Use Server Components by default**
   ```typescript
   // ✅ Good - Server Component
   export default async function Page() { ... }
   
   // ❌ Avoid unless necessary - Client Component
   'use client';
   ```

2. **Image Optimization**
   ```typescript
   import Image from 'next/image';
   
   <Image 
     src="/hero.png"
     alt="Hero"
     width={300}
     height={300}
   />
   ```

3. **Lazy Loading**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const Modal = dynamic(() => import('@/components/Modal'), {
     ssr: false
   });
   ```

### Database Optimization

1. **Use `select` to fetch only needed fields**
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id },
     select: { id: true, name: true }  // Only these
   });
   ```

2. **Add indexes for frequent queries**
   ```prisma
   model User {
     createdAt DateTime @default(now())
     @@index([createdAt])  // For sorting/filtering
   }
   ```

3. **Batch queries with `include`**
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id },
     include: { 
       gameState: true,
       friends: true
     }
   });
   ```

### WebSocket Optimization

1. **Debounce high-frequency events**
   ```typescript
   let timeout;
   socket.on('game:update', (data) => {
     clearTimeout(timeout);
     timeout = setTimeout(() => {
       // Process update
     }, 100);
   });
   ```

2. **Unsubscribe from unused events**
   ```typescript
   useEffect(() => {
     socket.on('event', handler);
     return () => socket.off('event', handler);
   }, []);
   ```
