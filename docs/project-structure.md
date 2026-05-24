# Structure du projet

```
RPG/
├── frontend/          — Next.js app (port 3000)
│   ├── app/           — Pages + API routes
│   │   ├── api/       — REST API (auth, user, characters, social, admin, profile, home)
│   │   ├── home/      — Dashboard
│   │   ├── game/      — Écran de combat PvP
│   │   ├── characters/ — Gestion des héros
│   │   ├── social/    — Messagerie / amis
│   │   ├── admin/     — Panel admin
│   │   └── not-connected/
│   ├── components/    — Atomic design
│   │   ├── atoms/     — Button, Input, Card, Fighter, EnemyFighter, ManaBar, etc.
│   │   ├── molecules/ — IconField, SpellSelector, FriendRequestBanner
│   │   └── organisms/ — TeamBuilder, CharacterViewer, PvpMatchmakingModal
│   ├── lib/           — auth-client, auth server, prisma, redis, rateLimit
│   ├── prisma/        — Schema + migrations
│   └── public/        — Assets, gameResources/heroes/
│
├── websockets/        — Socket.IO server (port 4001)
│   ├── server.js      — Connexions, events sociaux, matchmaking
│   ├── matchmaking.js — Boucle de matchmaking PvP
│   ├── matchmakingpong.js — Boucle de matchmaking Pong
│   ├── gameManager.js — Création du GameState via l'engine
│   └── package.json
│
├── engine/            — Moteur de combat (TypeScript pur)
│   ├── GameEngine.ts  — initGame, processAction, getCurrentTurnCharacter
│   ├── GameState/     — TurnSystem (charge-based)
│   ├── Instances/     — PlayerInstance, CharacterInstance, HeroData
│   ├── Spells/        — 15 sorts, SpellRegistry
│   └── Utils/         — Damage, targets, crit, lastStand
│
├── docs/              — Documentation
└── docker-compose.yml — Frontend + Websocket + Redis + PostgreSQL
```

## Frontend — fichiers clés

| Fichier | Rôle |
|---------|------|
| `app/game/page.tsx` | Écran de combat |
| `app/game/spells.tsx` | Event socket "initiate" + Team type |
| `app/home/page.tsx` | Dashboard (Mine, PvP, team) |
| `app/api/home/route.ts` | Queue PvP + save team |
| `app/api/user/opponent/route.ts` | Récupère adversaire + roomId |
| `app/api/characters/route.ts` | CRUD persos + level up sorts |
| `socket.js` | Client Socket.IO |
| `lib/auth-client.ts` | Better Auth client |
| `lib/prisma.ts` | Prisma client singleton |

## Websocket — flow

1. `matchmaking.js` pop 2 joueurs → stocke dans Redis `inGamePlayers`
2. Les 2 frontends recoivent `"matchFound"` → vont sur `/game`
3. Chacun envoie `"initiate"` avec sa team
4. `server.js` stocke les teams → quand les 2 sont là → `gameManager.createGameInstance()`
5. `gameManager.js` crée les `PlayerInstance`/`CharacterInstance` → `initGame()` de l'engine
6. `broadcastGameState()` envoie l'état aux 2 joueurs

## Conventions

- Fichiers : `kebab-case.ts` / `PascalCase.tsx` (composants)
- Routes API : `app/api/<name>/route.ts`
- Composants : `components/<atomic>/<domain>/<Name>.tsx`
- Base de données : `PascalCase` (User, GameState, Match_history)
