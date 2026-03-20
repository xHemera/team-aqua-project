# Team Aqua Project

Full-stack project with a Next.js frontend, PostgreSQL, and containerized development tooling.

## Overview

This repository contains:
- A modern frontend application built with Next.js App Router, React 19, TypeScript, Better Auth, and Prisma.
- A websocket service workspace (currently scaffolded and containerized for iterative development).
- A PostgreSQL database managed through Docker Compose.
- A shell-based developer helper (`dev.sh`) for common local operations.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- Auth: Better Auth
- ORM / DB access: Prisma + PostgreSQL
- Realtime workspace: Socket.IO service (`websockets/`)
- Package manager: Bun (`bun@1.2.5`)
- Local orchestration: Docker Compose

## Repository Structure

```text
team-aqua-project/
├── frontend/                # Next.js app (main product surface)
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # Atomic design components
│   ├── hooks/               # Shared React hooks
│   ├── lib/                 # Shared frontend utilities
│   ├── prisma/              # Frontend Prisma schema/migrations
│   └── docs/                # Frontend-specific documentation
├── websockets/              # Socket service workspace (Bun + TS)
├── game-engine/             # Reserved workspace
├── docker-compose.yml       # Local dev services
└── dev.sh                   # Interactive dev helper script
```

## Services and Ports

When started via Docker Compose:
- Frontend: `http://localhost:3000`
- Websocket workspace: `http://localhost:4001`
- PostgreSQL: `localhost:5432`

## Quick Start (Recommended)

### Prerequisites

- Docker + Docker Compose

### Start with helper script

```bash
./dev.sh
```

The script provides a menu to:
- start/restart/stop services,
- inspect logs and service status,
- access PostgreSQL,
- promote an existing user to admin,
- run basic service checks.

### Start manually

```bash
docker compose up --build -d
```

Then open:
- `http://localhost:3000`

## Local Development Without Docker (Optional)

If you prefer running services directly:

### Prerequisites

- Bun `1.2.5+`
- A running PostgreSQL instance

### Frontend

```bash
cd frontend
bun install
bunx prisma generate
bun run dev
```

### Websocket workspace

```bash
cd websockets
bun install
bun run dev
```

Note:
- If Bun is not installed on your host machine, use Docker Compose workflows instead.

## Environment Variables

Current Compose setup defines these variables:

### Frontend

- `NODE_ENV=development`
- `BETTER_AUTH_URL=http://localhost:3000`
- `BETTER_AUTH_SECRET=dev-secret-change-me-please-at-least-32-characters`
- `BETTER_AUTH_DATABASE_URL=postgres://postgres:postgres@db:5432/aqua_temp`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/aqua_temp`

### Websocket workspace

- `NODE_ENV=development`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/aqua_temp`
- `PORT=4001`

## Common Commands

### Docker lifecycle

```bash
docker compose up -d
docker compose up --build -d
docker compose down
docker compose down -v
```

### Logs

```bash
docker compose logs -f
docker compose logs frontend -f
docker compose logs websockets -f
docker compose logs db -f
```

### Frontend commands

```bash
cd frontend
bun install
bun run lint
bun run build
bun run start
bun run auth:migrate
```

### Websocket workspace commands

```bash
cd websockets
bun install
bun run dev
bun run build
bun run start
bun run prisma:generate
bun run prisma:push
bun run prisma:studio
```

### Database access

```bash
docker compose exec db psql -U postgres -d aqua_temp
```

Promote a user to admin:

```bash
docker compose exec db psql -U postgres -d aqua_temp -c \
  "UPDATE \"user\" SET role = 'admin' WHERE email = 'email@example.com';"
```

## Frontend Routes (Current)

Main app pages include:
- `/` login/auth entry
- `/register`
- `/home`
- `/decks`
- `/social`
- `/game`
- `/profile/[pseudo]`
- `/not-connected`

Frontend API routes include:
- `/api/auth/[...all]`
- `/api/profile`
- `/api/avatars`
- `/api/social/invite`

## Frontend UI Architecture

The frontend follows an atomic design approach.

See:
- [frontend/docs/frontend-atomic-guide.md](frontend/docs/frontend-atomic-guide.md)

## Troubleshooting

- Compose starts but frontend is unavailable:
  - Check `docker compose logs frontend -f`
  - Ensure port `3000` is free.
- Database connection issues:
  - Verify `db` service health with `docker compose ps`.
- Host missing Bun:
  - Run everything through Docker instead of local Bun commands.

## License

MIT
