# Game Features & Mechanics Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Character System](#character-system)
- [Combat System](#combat-system)
- [PvP Matchmaking](#pvp-matchmaking)
- [Expedition System](#expedition-system)
- [Progression & Resources](#progression--resources)
- [Social Features](#social-features)

**Other Docs**: [WebSocket Guide](websocket-guide.md) • [Database Guide](database-guide.md) • [API Reference](api-reference.md)

---

## Overview

Kyogre is a **turn-based JRPG** with a party of 3 characters. Players progress through expeditions, engage in PvP combat, and build friendships through social features.

**Core Gameplay Loop**:
1. Build a team of 3 characters
2. Level up characters and spells
3. Send characters on expeditions for rewards
4. Challenge other players in PvP matches
5. Social interactions: friends, messaging, profiles

## Character System

### Character Roster

Each player has a roster of characters stored in `GameState.characters`.

**Data Structure**:
```typescript
type Character {
  id: string;
  name: string;
  level: number;        // 1-10+
  hp: number;           // Current/Max health
  spells: Spell[];      // Array of learned spells
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
  status: {
    countering: boolean;
    silenced: boolean;
    poisoned: boolean;
    berserk: boolean;
    aBoost: number;     // Attack boost multiplier
    dBoost: number;     // Defense boost multiplier
  };
}
```

### Character Management

**Viewing Roster**: `GET /api/characters`
```typescript
const response = await fetch('/api/characters');
const { characters, resources } = await response.json();
```

**Selecting for Team**: Store in local state during team building
```typescript
const [selectedTeam, setSelectedTeam] = useState(['char1', 'char2', 'char3']);
```

**Leveling**: Send PUT request to upgrade spell level
```typescript
const response = await fetch('/api/characters', {
  method: 'POST',
  body: JSON.stringify({
    characterId: 'char-id',
    spellId: 'spell-id',
    action: 'upgrade'  // or 'downgrade'
  })
});
```

### Hero Portraits

Character avatars and visual assets:
- **Location**: `frontend/lib/hero-portraits.ts`
- **Directory**: `frontend/public/gameResources/heroes/`
- **Rotation**: Used in team builder and game display

## Combat System

### Turn-Based Battle

**Battle Setup**:
- Player team: 3 characters
- Opponent team: 3 characters
- Initiative: Determined by character speed stats

**Turn Flow**:
1. **Action Selection**: Player chooses action for active character
2. **Action Types**:
   - **Attack**: Deal physical damage
   - **Defend**: Reduce incoming damage for turn
   - **Cast Spell**: Use MP to deal damage/heal
   - **Item**: Use consumable item
3. **Resolution**: Action resolved, effects applied
4. **Status Updates**: HP changes, status effects update
5. **Next Turn**: Move to next character or opponent

**WebSocket Events**:
```typescript
// Start game
socket.emit('game:join', { characterIds, gameMode: 'pvp' });
socket.on('game:started', (gameState) => { /* render */ });

// Player turn
socket.on('game:turn', (turnData) => {
  const { currentTurn, activeCharacter, actionPrompt } = turnData;
});

// Submit action
socket.emit('game:action', {
  characterId: 'char1',
  action: 'attack',  // or 'defend', 'spell', 'item'
  targetId: 'enemy1',
  spellId?: 'spell1'  // if action is 'spell'
});

// Action resolved
socket.on('game:actionResolved', (result) => {
  const { damage, healing, effects, survivor } = result;
});

// Game ended
socket.on('game:ended', (result) => {
  const { winner, rewards } = result;
});
```

### Status Effects

**Negative Statuses**:
- `silenced: true` - Cannot cast spells
- `poisoned: true` - Lose HP each turn
- `berserk: true` - Auto-attack, can't defend
- `countering: true` - Counter incoming attacks

**Stat Modifiers**:
- `aBoost: 1.5` - 50% attack increase
- `dBoost: 0.8` - 20% defense reduction
- `nturnEffect: 2` - Effect duration in turns

### Combat Calculations

**Damage Formula**:
```
baseDamage = attacker.attack * spell.effect
actualDamage = baseDamage * aBoost * (1 - defender.defense / 100) * dBoost
```

**Healing Formula**:
```
healing = spell.effect * attacker.attack / 10
```

## PvP Matchmaking

### Matchmaking System

**MMR-Based Matching**: Players matched by skill rating

**Queue System**:
```typescript
// Join queue
socket.emit('matchmaking:join', {
  mmr: 1200,
  characterTeam: ['char1', 'char2', 'char3']
});

// Queue events
socket.on('matchmaking:queued', (position) => { /* position: number */ });
socket.on('matchmaking:found', (matchData) => {
  const { opponentName, opponentTeam, gameSessionId } = matchData;
});
```

**Matchmaking Parameters**:
- MMR Range: ±250 by default
- Queue Timeout: 5 minutes
- Max Wait Time: 2 minutes (expands search range)

### Rank System

**MMR (Matchmaking Rating)**:
- Base: 1200
- Win: +16-32 points (varies by opponent MMR)
- Loss: -16 to -1 points
- Decay: -1 point per day after 7 days inactive

**Leaderboard**: Top 100 players by MMR

**Storage**: `User.matchHistory[]`

```typescript
type MatchRecord = {
  id: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  playerTeam: string[];      // Character IDs
  opponentTeam: string[];
  createdAt: Date;
  mmrChange: number;
};
```

## Expedition System

### Expedition Mechanics

**What are Expeditions**:
- Send characters to gather resources
- Time-based: 15min, 1hr, 4hr, 8hr, 24hr
- Earn: XP + occasionally items

**Starting Expedition**:
```typescript
socket.emit('expedition:start', {
  characterId: 'char-id',
  duration: '1h' | '4h' | '8h' | '24h'
});

socket.on('expedition:started', (expedition) => {
  const { endsAt, xp } = expedition;
});
```

**Tracking**:
- **Active Expeditions**: Stored in frontend state
- **Data**: Character ID, start time, end time, rewards
- **Countdown**: UI shows remaining time

**Completion**:
```typescript
socket.on('expedition:completed', (result) => {
  const { characterId, xp } = result;
  // Apply rewards to game state
});
```

### Expedition Rewards

**By Duration**:
| Duration | XP | Chance (rare item) |
|----------|----|--------------------|
| 15 min   | 25 | 5%                 |
| 1 hour   | 100| 10%                |
| 4 hours  | 400| 15%                |
| 8 hours  | 800| 20%                |
| 24 hours | 2400| 30%               |

## Progression & Resources

### Resource Economy

**Rubis** (`GameState.rubis`):
- Currency
- Earned from: Mining, special rewards
- Spent on: Battle pass, cosmetics, convenience items
- Initial: 42

**XP** (Character-specific):
- Character experience
- Earned from: Expeditions, PvP wins, missions
- Spent on: Level ups
- Level cap: 10+

### Character Progression

**Leveling**:
- Max level: 10+ (expandable)
- XP requirement: Increases per level
- Benefits: HP increase, stat boost, new spells available

**Spell Leveling**:
- Each spell has independent level: 1-3
- Level 1 spell → Level 2: Increased effect (20% more damage/healing)
- Level 2 spell → Level 3: MP cost reduction (10% less)
- Cost: Rubis per upgrade

## Social Features

### Friend System

**Friend States**:
- `request_sent: true` - Pending request
- `request_sent: false` - Accepted friend
- Blocked: User in `User.blockedUsers` array

**Operations**:
```typescript
// Send request
fetch('/api/social/friend', {
  method: 'POST',
  body: JSON.stringify({
    friendName: 'username',
    action: 'request'
  })
});

// Accept request
fetch('/api/social/friend', {
  method: 'POST',
  body: JSON.stringify({
    friendName: 'username',
    action: 'accept'
  })
});

// Remove friend
fetch('/api/social/friend', {
  method: 'POST',
  body: JSON.stringify({
    friendName: 'username',
    action: 'remove'
  })
});
```

### Messaging System

**Conversation Model**:
- `Inbox`: Container for 1-on-1 conversation
- `Messages`: Individual messages in conversation
- `Attachments`: Files attached to messages

**Features**:
- Rich text messaging
- File attachments (max 10 MB each)
- Typing indicators
- Unread message tracking

**WebSocket Events**:
```typescript
// Send message
socket.emit('message:send', {
  inboxId: 'inbox-123',
  message: 'Hello!',
  attachments: []
});

// Receive in real-time
socket.on('message:received', (msg) => {
  const { id, userId, message, createdAt, attachments } = msg;
});

// Typing indicator
socket.emit('message:typing', { inboxId: 'inbox-123' });
socket.on('message:userTyping', ({ userId, inboxId }) => { /* show indicator */ });
```

### Blocking & Reporting

**Block User**:
```typescript
fetch('/api/social/block', {
  method: 'POST',
  body: JSON.stringify({
    targetUsername: 'user',
    action: 'block'
  })
});
```

**Report Conversation**:
```typescript
fetch('/api/social/report', {
  method: 'POST',
  body: JSON.stringify({
    inboxId: 'inbox-123',
    reason: 'harassment | spam | inappropriate'
  })
});
```

### Profile System

**Profile Data**:
- Username, Avatar, Badges
- Custom background/banner
- Match history (last 10 matches)
- Total wins/losses ratio

**Viewing Profile**:
```typescript
const profile = await fetch(`/api/profile?username=${pseudo}`);
const data = await profile.json();
```

**Custom Avatar**:
- Select from available avatars (heroes)
- Each avatar has primary + hover accent color
- Stored in `User.avatarId`

### Badges & Achievements

**Badge Types**:
- Rank badges (Gold, Silver, Bronze)
- Achievement badges (100 wins, first friend, etc.)
- Special badges (admin, founder, etc.)

**Storage**: `User.badges[]` (array of badge IDs)

## Future Mini-Game

Reserved for later implementation:
- **Mode**: 1v1 top-down PvP
- **Controls**: Arrow keys (movement), click/space (attack)
- **Physics**: Hit pushback with recoil
- **Orientation**: Auto-computed from movement

Current design supports future expansion without breaking changes.
