# WebSocket & Real-Time Features Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Socket.IO Setup](#socketio-setup)
- [Real-Time Features](#real-time-features)
- [Matchmaking System](#matchmaking-system)
- [Connection Management](#connection-management)
- [Best Practices](#best-practices)

**Other Docs**: [API Reference](api-reference.md) • [Game Features](game-features.md)

---

## Overview

Kyogre uses **Socket.IO** for real-time bidirectional communication between clients and the WebSocket server.

**Key Points**:
- **Server**: Runs separately in `websockets/` directory on port `4001`
- **Client**: Configured in `frontend/socket.js`
- **Uses**: Game events, PvP matchmaking, live messaging, real-time notifications
- **Transport**: WebSocket + HTTP long-polling fallback

**Architecture**:
```
Frontend (Next.js) <--WebSocket--> WebSocket Server (Bun) <---> Redis (Session Store)
     port 3000                             port 4001
```

## Socket.IO Setup

### Server Setup

**Location**: `websockets/server.js`

```javascript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server({
  transports: ['websocket', 'polling'],
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Redis adapter for distributed sessions
io.adapter(createAdapter(pubClient, subClient));
```

**Environment**:
- PORT: `4001`
- REDIS_URL: Configured for session storage and pub/sub

### Client Setup

**Location**: `frontend/socket.js`

```javascript
import { io } from 'socket.io-client';

export const socket = io('http://localhost:4001', {
  transports: ['websocket', 'polling'],
  autoConnect: false,
  reconnection: true
});
```

**Usage in Components**:
```typescript
'use client';

import { socket } from '@/socket';
import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    // Connect socket
    socket.connect();

    // Listen to events
    socket.on('gameUpdate', (data) => {
      console.log('Update:', data);
    });

    // Cleanup
    return () => {
      socket.off('gameUpdate');
      socket.disconnect();
    };
  }, []);

  return <div>Content</div>;
}
```

## Real-Time Features

### Authentication Events

```typescript
// Server sends auth status
socket.on('auth:authenticated', (user) => {
  console.log('User authenticated:', user.name);
});

socket.on('auth:unauthenticated', () => {
  console.log('User disconnected or unauthorized');
});
```

### Game Events

**Game Start**:
```typescript
socket.emit('game:join', {
  characterIds: ['char1', 'char2', 'char3'],
  gameMode: 'pvp' | 'expedition'
});

socket.on('game:started', (gameState) => {
  // Render game with initial state
});
```

**Turn Events**:
```typescript
socket.on('game:turn', (turnData) => {
  const { currentTurn, activeCharacter, actionPrompt } = turnData;
  // Update UI for current player action
});
```

**Action Resolution**:
```typescript
socket.emit('game:action', {
  characterId: 'char1',
  action: 'attack' | 'defend' | 'spell',
  targetId: 'enemy1'
});

socket.on('game:actionResolved', (result) => {
  const { damage, effects, currentHP } = result;
  // Animate and show results
});
```

**Game End**:
```typescript
socket.on('game:ended', (result) => {
  const { winner, playerTeam, opponentTeam, rewards } = result;
  // Show results and grant rewards
});
```

### Matchmaking Events

**See**: [Matchmaking System](#matchmaking-system)

### Messaging Events

**Real-Time Messages**:
```typescript
// Send message
socket.emit('message:send', {
  inboxId: 'inbox-123',
  message: 'Hello!',
  attachments: []
});

// Receive message in real-time
socket.on('message:received', (msg) => {
  const { id, userId, message, createdAt } = msg;
  // Add to message list
});
```

**Typing Indicator**:
```typescript
socket.emit('message:typing', { inboxId: 'inbox-123' });
socket.on('message:userTyping', ({ userId, inboxId }) => {
  // Show "user is typing..."
});
```

**Notification**:
```typescript
socket.on('notification:new', (notif) => {
  const { type, sender, message } = notif;
  // Show toast or banner
});
```

### Friend Request Events

```typescript
// Send request
socket.emit('friend:request', { targetUsername: 'player2' });

// Receive request notification
socket.on('friend:requestReceived', ({ fromUser }) => {
  // Show friend request banner
});

// Accept request
socket.emit('friend:accept', { fromUsername: 'player2' });

socket.on('friend:accepted', ({ user }) => {
  // Update friend list
});
```

### PvP Challenge Events

```typescript
// Challenge another player
socket.emit('pvp:challenge', { opponentUsername: 'player2' });

// Receive challenge
socket.on('pvp:challenged', ({ fromUser }) => {
  // Show duel request banner
});

// Accept challenge
socket.emit('pvp:acceptChallenge', { fromUsername: 'player2' });

// Challenge rejected
socket.on('pvp:challengeRejected', ({ reason }) => {
  // Show message
});
```

## Matchmaking System

**Location**: `websockets/matchmaking.js`

### Queue System

```typescript
// Join matchmaking queue
socket.emit('matchmaking:join', {
  mmr: 1200,              // Matchmaking rating
  characterTeam: ['c1', 'c2', 'c3']
});

socket.on('matchmaking:queued', (position) => {
  console.log(`Queue position: ${position}`);
});
```

### Match Found

```typescript
socket.on('matchmaking:found', (matchData) => {
  const {
    opponentName,
    opponentTeam,
    gameSessionId,
    timeToStart // seconds
  } = matchData;
  
  // Show "opponent found" overlay
  // Countdown to game start
});
```

### Queue Management

```typescript
// Leave queue
socket.emit('matchmaking:leave');

socket.on('matchmaking:left', () => {
  // Queue cancelled
});

// Queue timeout
socket.on('matchmaking:timeout', () => {
  // Queue expired after 5 minutes
});
```

### Ranking Events

```typescript
socket.on('matchmaking:rankUpdate', (newRank) => {
  console.log(`New MMR: ${newRank.mmr}`);
  // Update profile UI
});
```

## Connection Management

### Auto-Reconnection

Socket.IO handles reconnection automatically:

```typescript
socket.on('connect', () => {
  console.log('Connected to server');
  // Rejoin rooms, re-subscribe to events
});

socket.on('disconnect', (reason) => {
  console.log(`Disconnected: ${reason}`);
  // Show offline indicator
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Refresh state from server
});

socket.on('reconnect_error', (error) => {
  console.log('Reconnection error:', error);
});
```

### Handling Network Issues

```typescript
'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/socket';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div>
      {isConnected ? (
        <span>🟢 Connected</span>
      ) : (
        <span>🔴 Disconnected</span>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Cleanup Event Listeners

```typescript
useEffect(() => {
  socket.on('event', handler);
  
  return () => {
    socket.off('event', handler);  // ✅ Remove listener
  };
}, []);
```

### 2. Use Named Event Handlers

```typescript
// ❌ Avoid: inline handler makes cleanup hard
socket.on('message', (msg) => console.log(msg));

// ✅ Good: named function enables cleanup
const handleMessage = (msg) => console.log(msg);
socket.on('message', handleMessage);
socket.off('message', handleMessage);
```

### 3. Validate Data from Server

```typescript
socket.on('gameUpdate', (data) => {
  // ✅ Validate before using
  if (!data || typeof data.hp !== 'number') {
    console.error('Invalid game update:', data);
    return;
  }
  
  // Use data safely
  setHP(data.hp);
});
```

### 4. Handle Reconnection Properly

```typescript
useEffect(() => {
  const handleReconnect = () => {
    // Re-join game, re-fetch state, etc.
    socket.emit('game:rejoin', { gameSessionId });
  };

  socket.on('reconnect', handleReconnect);
  return () => socket.off('reconnect', handleReconnect);
}, []);
```

### 5. Prevent Memory Leaks with Multiple Components

```typescript
// Use context or shared hook to manage socket subscriptions
export function useSocket(event, handler) {
  useEffect(() => {
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}

// Usage
const MyComponent = () => {
  useSocket('message', (msg) => {
    console.log(msg);
  });
};
```

### 6. Implement Heartbeat for Connection Health

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    socket.emit('ping');
  }, 30000); // Every 30 seconds

  socket.on('pong', () => {
    console.log('Server alive');
  });

  return () => {
    clearInterval(interval);
    socket.off('pong');
  };
}, []);
```

## Server Development

### Starting the WebSocket Server

```bash
cd websockets
npm run dev        # Development with hot reload
npm start          # Production
```

### Server Environment Variables

```env
PORT=4001
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

### Adding New Socket Event

**Server** (`websockets/server.js`):
```javascript
io.on('connection', (socket) => {
  socket.on('myEvent', (data) => {
    console.log('Received:', data);
    socket.emit('myEventResponse', { success: true });
  });
});
```

**Client** (`frontend/socket.js`):
```typescript
socket.emit('myEvent', { payload: 'data' });
socket.on('myEventResponse', (response) => {
  console.log('Response:', response);
});
```

## Deployment Notes

- WebSocket server must be **publicly accessible** for production
- Use **HTTPS + WSS** (secure WebSocket) in production
- Enable **CORS** properly for production domain
- Use **Redis Adapter** for scaling across multiple server instances
- Monitor **connection limits** and implement backpressure
