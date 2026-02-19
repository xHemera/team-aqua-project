# team-aqua-project

Projet simplifié pour rester lisible et léger.

## Architecture

- `frontend`: Next.js + Better Auth
- `backend`: Express + Prisma
- `db`: PostgreSQL temporaire (éphémère)
- `game-engine`: service placeholder

## Démarrage

```bash
docker compose up --build -d
```

Ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4001/health`
- DB: `localhost:5432`

## Commandes utiles

```bash
docker compose logs -f
docker compose down
```

Prisma backend:

```bash
docker compose exec backend pnpm prisma:studio
docker compose exec backend pnpm prisma:push
```

Better Auth frontend:

```bash
cd frontend
pnpm auth:migrate
```

## Variables d'environnement

- Frontend: voir `frontend/.env.example`
- Backend: voir `backend/.env.example`

## Nettoyage local (taille)

Pour supprimer caches et dépendances locales générées:

```bash
rm -rf frontend/node_modules frontend/.next frontend/.pnpm-store
rm -rf backend/node_modules backend/.pnpm-store backend/dist
```
