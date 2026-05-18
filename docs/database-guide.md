# Database & Prisma Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Data Models](#data-models)
- [Relationships](#relationships)
- [Common Queries](#common-queries)
- [Migrations](#migrations)
- [Best Practices](#best-practices)

**Other Docs**: [API Reference](api-reference.md) • [Frontend Overview](frontend-overview.md)

---

## Overview

Kyogre uses **Prisma ORM** with PostgreSQL for type-safe database access.

**Key Tools**:
- **Prisma Client**: Generated client for database queries
- **Prisma Schema**: `frontend/prisma/schema.prisma` - defines all models
- **Migrations**: Version-controlled schema changes in `frontend/prisma/migrations/`

**Connection**: 
- Environment variable: `DATABASE_URL`
- Client instance: `frontend/lib/prisma.ts`

## Data Models

### User

User account with authentication, profile, and social data.

```prisma
model User {
  id                String    @id @default(cuid())
  name              String    @unique              // Username
  email             String    @unique
  emailVerified     Boolean   @default(false)
  image             String?   @default(...)       // Profile icon URL
  badges            String[]  @default([])         // Achievement badges
  blockedUsers      String[]  @default([])         // Blocked user IDs
  banned            Boolean   @default(false)
  profileBackground String?                        // Custom background color/image
  profileBanner     String?                        // Custom banner
  online            Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  avatarId          String?                        // Custom avatar ID
  avatar            Avatar?   @relation(fields: [avatarId])
  gameState         GameState?
  sessions          Session[]
  accounts          Account[]
  friends           Friends[]
  inboxUser         Inbox_users[]
  messages          Messages[]
  matchHistory      Match_history[]
  banner            ProfileBanner?
}
```

**Key Fields**:
- `name`: Unique username (display name)
- `email`: Email for authentication
- `badges`: Array of achievement/role badges
- `blockedUsers`: Array of blocked user IDs
- `avatarId`: Reference to custom avatar

### GameState

Game progression and resources per user.

```prisma
model GameState {
  id        String      @id @default(cuid())
  user_id   String      @unique
  rubis     Int                              // Currency
  
  // Relations
  characters Character[]
  user      User        @relation(fields: [user_id])
}
```

**Purpose**: Stores resources and character roster ownership

### Character

Character in player's team.

```prisma
model Character {
  id          String    @id @default(cuid())
  gameStateId String
  name        String
  hp          Int
  level       Int
  countering  Boolean
  silenced    Boolean
  poisened    Boolean
  berserk     Boolean
  aBoost      Int       // Attack boost
  dBoost      Int       // Defense boost
  nturnEffect Int       // Effect duration
  
  // Relations
  spells      Spell[]
  gameState   GameState @relation(fields: [gameStateId])
}
```

**Purpose**: Individual character with stats and spells

### Spell

Spell/ability for a character.

```prisma
model Spell {
  id          String    @id @default(cuid())
  characterId String
  name        String
  type        String    // "fire", "ice", "heal", etc.
  effect      Int       // Damage or healing amount
  mpCost      Int       // Mana cost
  level       Int       // Spell level
  
  // Relations
  character   Character @relation(fields: [characterId])
}
```

**Purpose**: Spell definition per character

### Friends

Friend relationship with request status.

```prisma
model Friends {
  friendId     String
  userId       String
  request_sent Boolean
  created_at   DateTime  @default(now())
  
  // Relations
  user         User      @relation(fields: [userId])
  @@id([userId, friendId])
}
```

**Status**:
- `request_sent: true` - Request sent, awaiting acceptance
- `request_sent: false` - Accepted friend

### Inbox & Inbox_users

Conversation container with participant tracking.

```prisma
model Inbox {
  id              String    @id @default(cuid())
  last_message    String?
  last_sent_user_id String?
  report_id       String?
  createdAt       DateTime  @default(now())
  
  // Relations
  inboxUser       Inbox_users[]
  messages        Messages[]
  user            User?     @relation(fields: [last_sent_user_id])
  reported        Reported_Conv?
}

model Inbox_users {
  id              String    @id @default(cuid())
  inbox_id        String
  user_id         String
  unread_messages Int?      // Unread message count
  
  // Relations
  user            User?     @relation(fields: [user_id])
  inbox           Inbox?    @relation(fields: [inbox_id])
}
```

**Purpose**: Many-to-many relationship for conversations

### Messages & Attachment

Message with optional file attachments.

```prisma
model Messages {
  id          String      @id @default(cuid())
  user_id     String
  inbox_id    String
  message     String?     // Message text (nullable for attachments-only)
  attachments Attachment[]
  createdAt   DateTime    @default(now())
  
  // Relations
  user        User?       @relation(fields: [user_id])
  inbox       Inbox?      @relation(fields: [inbox_id])
}

model Attachment {
  id         String    @id @default(cuid())
  msg_id     String?
  name       String
  sizeLabel  String    // "1.5 MB"
  type       String    // MIME type
  previewUrl String    // URL for preview
  
  // Relations
  message    Messages? @relation(fields: [msg_id])
}
```

### Avatar

Custom avatar with color accents.

```prisma
model Avatar {
  id           String @id @default(cuid())
  name         String
  type         String // "hero" | "custom"
  url          String // Image URL
  accent       String // Hex color
  accentHover  String // Hover state color
  
  // Relations
  users        User[]
}
```

### Match_history

PvP match record.

```prisma
model Match_history {
  id           String    @id @default(cuid())
  result       String    // "win" | "loss" | "draw"
  createdAt    DateTime  @default(now())
  playerTeam   String[]  // Character IDs in player team
  opponentTeam String[]  // Character IDs in opponent team
  opponent     String    // Opponent username
  user_id      String
  
  // Relations
  user         User?     @relation(fields: [user_id])
}
```

### Reported_Conv

Moderation: reported conversations.

```prisma
model Reported_Conv {
  id           String    @id @default(cuid())
  inboxId      String    @unique
  reportedUser String    // Username of reported user
  reporter     String    // Username of reporter
  reason       String
  createdAt    DateTime  @default(now())
  
  // Relations
  inbox        Inbox     @relation(fields: [inboxId])
}
```

## Relationships

### User-GameState (1:1)
```typescript
// Get user with game state
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { gameState: true }
});
```

### GameState-Character (1:N)
```typescript
// Get all characters for user
const characters = await prisma.character.findMany({
  where: { gameState: { user_id: userId } },
  include: { spells: true }
});
```

### Character-Spell (1:N)
```typescript
// Get character with spells
const character = await prisma.character.findUnique({
  where: { id: characterId },
  include: { spells: true }
});
```

### Inbox-User (N:N via Inbox_users)
```typescript
// Get all conversations for user
const inboxes = await prisma.inbox.findMany({
  where: { inboxUser: { some: { user_id: userId } } },
  include: { inboxUser: true, messages: true }
});
```

### Messages-Attachment (1:N)
```typescript
// Get message with attachments
const message = await prisma.messages.findUnique({
  where: { id: messageId },
  include: { attachments: true }
});
```

## Common Queries

### Get User Profile
```typescript
const user = await prisma.user.findUnique({
  where: { name: username },
  select: {
    id: true,
    name: true,
    badges: true,
    avatarId: true,
    image: true,
    matchHistory: true,
    avatar: true
  }
});
```

### Get User Resources
```typescript
const gameState = await prisma.gameState.findUnique({
  where: { user_id: userId }
});
// Access: gameState.rubis
```

### Update Character Level
```typescript
await prisma.character.update({
  where: { id: characterId },
  data: { level: { increment: 1 } }
});
```

### Create Friend Request
```typescript
await prisma.friends.create({
  data: {
    userId: userId,
    friendId: friendId,
    request_sent: true
  }
});
```

### Accept Friend Request
```typescript
await prisma.friends.update({
  where: {
    userId_friendId: { userId, friendId }
  },
  data: { request_sent: false }
});
```

### Create Message
```typescript
await prisma.messages.create({
  data: {
    user_id: userId,
    inbox_id: inboxId,
    message: "Hello!",
    attachments: {
      create: [
        {
          name: "file.pdf",
          type: "application/pdf",
          sizeLabel: "2.5 MB",
          previewUrl: "https://..."
        }
      ]
    }
  }
});
```

### Get Unread Messages
```typescript
const unreadCount = await prisma.inbox_users.aggregate({
  where: { user_id: userId },
  _sum: { unread_messages: true }
});
```

### Ban User
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { banned: true }
});
```

## Migrations

### Running Migrations

```bash
# Apply pending migrations
cd frontend
bun run prisma migrate deploy

# Create a new migration
bun run prisma migrate dev --name description_of_change

# Reset database (dev only)
bun run prisma migrate reset
```

### Creating a Migration

1. **Update schema.prisma**:
```prisma
model NewModel {
  id    String @id @default(cuid())
  name  String
}
```

2. **Create migration**:
```bash
bun run prisma migrate dev --name add_new_model
```

3. **Review generated SQL** in `frontend/prisma/migrations/[timestamp]_add_new_model/migration.sql`

4. **Commit** the migration files to git

## Best Practices

### 1. Always Use `select` for API Responses
```typescript
// ✅ Good - only return needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    image: true
  }
});

// ❌ Avoid - returns all fields including sensitive data
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### 2. Prefer `include` for Relations
```typescript
// ✅ Good - includes related data
const character = await prisma.character.findUnique({
  where: { id: characterId },
  include: { spells: true }
});
```

### 3. Use Transactions for Multi-Step Operations
```typescript
// ✅ Good - atomic operation
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id: userId },
    data: { rubis: { decrement: 100 } }
  });
  
  const item = await tx.character.update({
    where: { id: characterId },
    data: { level: { increment: 1 } }
  });
  
  return { user, item };
});
```

### 4. Handle Errors Gracefully
```typescript
try {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
  }
  throw error;
}
```

### 5. Validate Input Data
```typescript
// ✅ Good - validate before querying
if (!username || typeof username !== 'string') {
  return Response.json({ error: 'Invalid username' }, { status: 400 });
}

const user = await prisma.user.findUnique({
  where: { name: username }
});
```

### 6. Use Connection Pooling for Performance
- Configured in `frontend/lib/prisma.ts` with `PrismaPg`
- PostgreSQL adapter handles connection pooling automatically

### 7. Index Frequently Queried Fields
```prisma
model User {
  id    String @id
  name  String @unique              // Auto-indexed
  email String @unique              // Auto-indexed
  @@index([createdAt])             // Add for filtering/sorting
}
```

## Database Admin

### View Schema
```bash
cd frontend
bun run prisma studio
```

Opens browser interface at `http://localhost:5555` to browse and edit data.

### Export Data
```bash
# Use PostgreSQL tools
psql $DATABASE_URL -c "SELECT * FROM \"User\"" > users.csv
```

### Backup Database
```bash
# Docker backup
docker compose exec db pg_dump -U postgres kyogre > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```
