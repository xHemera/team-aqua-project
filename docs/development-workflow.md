# Dev workflow

## Démarrer

```bash
git clone <repo> && cd RPG
docker compose up --build -d
```

Services :
- Frontend → `http://localhost:3000`
- WebSocket → port 4001
- PostgreSQL → port 5432
- Redis → port 6379
- Prisma Studio → `bun run prisma studio` (port 5555)

## Frontend

Hot reload automatique. Édite un fichier, le navigateur se met à jour.

Ajouter une page : créer `app/mapage/page.tsx`
Ajouter une API : créer `app/api/mon-route/route.ts`

## WebSocket (server.js)

Modifier → redémarrer le container :

```bash
docker compose restart websocket
```

Les events sont dans `io.on("connection", ...)`. Voir `websocket-guide.md` pour la liste complète.

## Engine (engine/)

TypeScript pur, pas de serveur. Les changements sont pris en compte au prochain rebuild Docker.

## Prisma / DB

```bash
cd frontend
npx prisma migrate dev --name description
npx prisma generate
```

## Git

```bash
git checkout -b feature/ma-branche
# coder...
git add .
git commit -m "(type): description en français simple"
git push
```

Types de commit : `(ajout)`, `(modif)`, `(supp)`, `(fix)`, `(docs)`.

## Checklist manuelle

- [ ] Créer compte / login
- [ ] Home page — Mine, PvP queue, team build
- [ ] PvP queue → matchmaking → écran game
- [ ] Personnages — level up sorts
- [ ] Social — messages, amis, défis
- [ ] Admin — ban, modos, reports

## Debug

```bash
docker logs aqua-web           # Frontend
docker logs aqua-websockets    # WebSocket
docker logs aqua-db            # PostgreSQL
```

Prisma Studio : `cd frontend && npx prisma studio`
Socket events : `socket.onAny((e, ...a) => console.log(e, a))`
