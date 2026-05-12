# API Reference

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Authentication](#authentication)
- [Users API](#users-api)
- [Characters API](#characters-api)
- [Social API](#social-api)
- [Profile API](#profile-api)
- [Admin API](#admin-api)
- [Utilities API](#utilities-api)

**Other Docs**: [Overview](frontend-overview.md) • [Database](database-guide.md) • [WebSocket](websocket-guide.md)

---

## Overview

All API endpoints are located in `frontend/app/api/` and follow REST conventions. The frontend uses `fetch()` for API calls from client and server components.

**Base URL**: `http://localhost:3000/api`

**Rate Limiting**: Most endpoints implement rate limiting via Redis to prevent abuse.

## Authentication

### `GET /api/auth/[...all]`

**Purpose**: Better Auth routes handler (login, register, session, etc.)

**Location**: `frontend/app/api/auth/[...all]/route.ts`

**Handled by**: Better Auth library - all auth operations go through this endpoint

**Usage**:
```typescript
// Client-side: Use authClient from lib/auth-client.ts
import { authClient } from '@/lib/auth-client';

// Sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'username',
});

// Sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
});

// Get session
const { data } = await authClient.getSession();
```

## Users API

### `GET /api/users`

**Purpose**: Retrieve list of all users

**Rate Limit**: 20 requests per minute per IP

**Query Parameters**: None

**Response**:
```json
[
  {
    "id": "cuid",
    "name": "username",
    "image": "avatar-url",
    "badges": ["badge1", "badge2"],
    "avatar": {
      "url": "avatar-custom-url"
    }
  }
]
```

**Usage**:
```typescript
const response = await fetch('/api/users');
const users = await response.json();
```

### `GET /api/user`

**Purpose**: Get current authenticated user info

**Response**:
```json
{
  "id": "user-id",
  "name": "username",
  "email": "email@example.com",
  "badges": [],
  "avatarId": "avatar-id",
  "image": "profile-icon-url"
}
```

### `POST /api/users`

**Purpose**: Create or update user profile

**Body**:
```json
{
  "name": "newusername",
  "image": "icon-url"
}
```

## Characters API

### `GET /api/characters`

**Purpose**: Retrieve user's character roster with stats

**Response**:
```json
{
  "characters": [
    {
      "id": "char-id",
      "name": "Char Name",
      "hp": 100,
      "level": 5,
      "spells": [
        {
          "id": "spell-id",
          "name": "Spell Name",
          "type": "fire",
          "mpCost": 10,
          "effect": 15,
          "level": 1
        }
      ]
    }
  ],
  "resources": {
    "gold": 1000,
    "rubis": 50,
    "xp": 250
  },
  "maxSkillLevel": 10
}
```

**Usage**:
```typescript
const response = await fetch('/api/characters', { cache: 'no-store' });
const data = await response.json();
```

### `POST /api/characters`

**Purpose**: Upgrade character spells or stats

**Body**:
```json
{
  "characterId": "char-id",
  "spellId": "spell-id",
  "action": "upgrade" | "downgrade"
}
```

## Social API

### `GET /api/social/inbox`

**Purpose**: Get user's message conversations

**Query Parameters**:
- `username`: string (required)

**Response**:
```json
[
  {
    "id": "inbox-id",
    "lastMessage": "Last message text",
    "lastSentUserId": "user-id",
    "createdAt": "2026-05-12T10:00:00Z",
    "inboxUser": [
      {
        "userId": "other-user-id",
        "user": {
          "name": "otheruser",
          "image": "avatar-url"
        },
        "unreadMessages": 2
      }
    ]
  }
]
```

**Usage**:
```typescript
const response = await fetch(`/api/social/inbox?username=${userPseudo}`);
const inboxes = await response.json();
```

### `GET /api/social/msg`

**Purpose**: Get messages from a conversation

**Query Parameters**:
- `inboxId`: string (required)
- `start`: number (optional, for pagination)

**Response**:
```json
{
  "messages": [
    {
      "id": "msg-id",
      "userId": "sender-id",
      "message": "Message text",
      "createdAt": "2026-05-12T10:00:00Z",
      "attachments": []
    }
  ]
}
```

### `POST /api/social/msg`

**Purpose**: Send a message

**Body**:
```json
{
  "inboxId": "inbox-id",
  "message": "Message text",
  "attachments": []
}
```

### `GET /api/social/friend`

**Purpose**: Get user's friend list

**Query Parameters**:
- `username`: string (required)

**Response**:
```json
[
  {
    "friendId": "friend-user-id",
    "userId": "user-id",
    "requestSent": false,
    "createdAt": "2026-05-12T10:00:00Z"
  }
]
```

### `POST /api/social/friend`

**Purpose**: Send/accept friend request

**Body**:
```json
{
  "friendName": "username",
  "action": "request" | "accept" | "remove"
}
```

### `POST /api/social/contact`

**Purpose**: Create new contact/conversation

**Body**:
```json
{
  "targetUsername": "username"
}
```

### `POST /api/social/block`

**Purpose**: Block/unblock a user

**Body**:
```json
{
  "targetUsername": "username",
  "action": "block" | "unblock"
}
```

### `GET /api/social/block`

**Purpose**: Get list of blocked users

**Response**:
```json
{
  "blockedUsers": ["user1", "user2"]
}
```

### `POST /api/social/report`

**Purpose**: Report a conversation

**Body**:
```json
{
  "inboxId": "inbox-id",
  "reason": "harassment | spam | other"
}
```

## Profile API

### `GET /api/profile`

**Purpose**: Get user's profile with match history

**Query Parameters**:
- `username`: string (required)

**Response**:
```json
{
  "id": "user-id",
  "name": "username",
  "badges": ["badge1"],
  "avatarId": "avatar-id",
  "matchHistory": [
    {
      "id": "match-id",
      "result": "win" | "loss",
      "opponent": "opponent-name",
      "createdAt": "2026-05-12T10:00:00Z"
    }
  ]
}
```

### `POST /api/profile`

**Purpose**: Update user profile (background, banner, etc.)

**Body**:
```json
{
  "profileBackground": "color-or-url",
  "profileBanner": "banner-url",
  "avatarId": "avatar-id"
}
```

### `POST /api/profile/banner`

**Purpose**: Upload profile banner image

**Body**: FormData with file

## Admin API

### `GET /api/admin/users`

**Purpose**: Get all users for admin panel

**Requires**: Admin role

**Query Parameters**:
- `page`: number (optional)
- `search`: string (optional)

**Response**:
```json
[
  {
    "id": "user-id",
    "name": "username",
    "email": "email@example.com",
    "badges": [],
    "banned": false,
    "online": false,
    "createdAt": "2026-05-12T10:00:00Z"
  }
]
```

### `POST /api/admin/users`

**Purpose**: Ban/unban user or change role

**Body**:
```json
{
  "userId": "user-id",
  "action": "ban" | "unban" | "setRole",
  "role": "user" | "admin"
}
```

### `GET /api/admin/reports`

**Purpose**: Get reported conversations

**Response**:
```json
[
  {
    "id": "report-id",
    "inboxId": "inbox-id",
    "reportedUser": "username",
    "reporter": "reporter-username",
    "reason": "harassment",
    "createdAt": "2026-05-12T10:00:00Z"
  }
]
```

### `POST /api/admin/reports`

**Purpose**: Handle report (dismiss, ban user, etc.)

**Body**:
```json
{
  "reportId": "report-id",
  "action": "dismiss" | "banUser" | "deleteConversation"
}
```

## Utilities API

### `GET /api/avatars`

**Purpose**: Get all available avatars with color accents

**Response**:
```json
[
  {
    "id": "avatar-id",
    "name": "Avatar Name",
    "type": "hero" | "custom",
    "url": "image-url",
    "accent": "#FF0000",
    "accentHover": "#FF3333"
  }
]
```

### `POST /api/upload`

**Purpose**: Upload file (image, attachment, etc.)

**Body**: FormData with file

**Response**:
```json
{
  "url": "uploaded-file-url",
  "name": "filename",
  "type": "mime-type",
  "sizeLabel": "size"
}
```

### `GET /api/home`

**Purpose**: Get home page data (resources, expeditions, etc.)

**Response**:
```json
{
  "resources": {
    "gold": 1000,
    "rubis": 50
  },
  "activeExpeditions": [
    {
      "characterId": "char-id",
      "endsAt": 1234567890,
      "xp": 100,
      "gold": 50
    }
  ]
}
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "status": 400 | 401 | 403 | 404 | 429 | 500
}
```

**Common Status Codes**:
- `400`: Bad request (missing params, invalid data)
- `401`: Unauthorized (need to login)
- `403`: Forbidden (no permission)
- `404`: Not found
- `429`: Too many requests (rate limited)
- `500`: Server error

## Rate Limiting

Most endpoints implement rate limiting:
- Default: 20 requests per minute per IP
- Redis is used for tracking requests
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

If rate limited (429), wait before retrying.

## Authentication in API Routes

Use `Better Auth` session verification in API routes:

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  // ... rest of logic
}
```
