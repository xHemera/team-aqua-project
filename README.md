# Kyogre

A full-stack project with a Next.js frontend, PostgreSQL database, and containerized development tooling.

## 📖 Sommaire

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [🚀 Démarrage](#-démarrage)
- [Repository Structure](#repository-structure)
- [Services and Ports](#services-and-ports)
- [Environment Variables](#environment-variables)
- [Common Commands](#common-commands)
- [Frontend Routes](#frontend-routes-current)
- [Frontend UI Architecture](#frontend-ui-architecture)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

**Kyogre** est une application full-stack moderne qui fournit :
- Une application frontend moderne construite avec Next.js App Router, React 19, TypeScript, Better Auth et Prisma
- Un service websocket pour la communication en temps réel (Socket.IO)
- Une base de données PostgreSQL gérée via Docker Compose
- Un script d'aide développeur (`dev.sh`) pour faciliter les opérations locales

## Features

✨ **Features principales** :
- 🔐 Authentification robuste avec Better Auth
- 🎨 Architecture UI atomique pour une maintenabilité optimale
- 🔄 Service websocket pour les fonctionnalités temps réel
- 🐘 Base de données PostgreSQL avec migrations Prisma
- 🐳 Environnement de développement containerisé
- 📝 Documentation technique structurée

## Documentation

Explorez la documentation détaillée du projet :

- [Frontend Atomic Design Guide](docs/frontend-atomic-guide.md) - Guide d'architecture atomique pour le frontend

## Tech Stack

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Authentification** | Better Auth |
| **Base de données** | PostgreSQL + Prisma ORM |
| **Temps réel** | Socket.IO |
| **Package Manager** | Bun 1.2.5+ |
| **Orchestration** | Docker Compose |

## 🚀 Démarrage

### Option 1 : Docker Compose (Recommandé)

**Prérequis** : Docker + Docker Compose

```bash
# Clone le projet
git clone <repository-url> <name>
cd <name>

# Option A : Avec le script helper
./dev.sh

# Option B : Lancer directement
docker compose up --build -d
```

Allez à : **http://localhost:3000**

### Option 2 : Développement local (Bun)

**Prérequis** : Bun 1.2.5+ et PostgreSQL en cours d'exécution

#### Frontend

```bash
cd frontend
bun install
bunx prisma generate
bun run dev
```

#### Websocket workspace

```bash
cd websockets
bun install
bun run dev
```

## Repository Structure

```text
kyogre/
├── frontend/          # Next.js app (frontend principal)
│   ├── app/           # Routes (App Router)
│   ├── components/    # Composants (design atomique)
│   ├── hooks/         # React hooks partagés
│   ├── lib/           # Utilitaires
│   ├── prisma/        # Schéma + migrations
│   └── public/        # Assets
├── websockets/        # Service WebSocket (Bun + TS)
├── docs/              # Documentation
├── docker-compose.yml # Services Docker
└── dev.sh             # Script helper
```

## Services and Ports

Quand les services sont démarrés via Docker Compose :

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Websocket | http://localhost:4001 | 4001 |
| PostgreSQL | localhost:5432 | 5432 |

## Environment Variables

### Frontend

```env
NODE_ENV=production
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=dev-secret-change-me-please-at-least-32-characters
BETTER_AUTH_DATABASE_URL=postgres://postgres:postgres@db:5432/aqua_temp
DATABASE_URL=postgresql://postgres:postgres@db:5432/aqua_temp
```

### Websocket workspace

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db:5432/aqua_temp
PORT=4001
```

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
bun run server.js
```

### Database access

```bash
docker compose exec db psql -U postgres -d aqua_temp
```

**Promouvoir un utilisateur en admin** :

```bash
docker compose exec db psql -U postgres -d aqua_temp -c \
  "UPDATE \"user\" SET role = 'admin' WHERE email = 'email@example.com';"
```

## Frontend Routes (Current)

### Pages principales

- `/` - Entrée login/auth
- `/register` - Inscription
- `/home` - Page d'accueil
- `/decks` - Gestion des decks
- `/social` - Section sociale
- `/game` - Interface de jeu
- `/profile/[pseudo]` - Profil utilisateur
- `/not-connected` - Page pour utilisateurs non connectés

### API Routes

- `/api/auth/[...all]` - Authentification
- `/api/profile` - Gestion du profil
- `/api/avatars` - Avatars utilisateur
- `/api/social/invite` - Invitations sociales
- `/api/users` - Gestion utilisateurs

## Frontend UI Architecture

Le frontend suit une approche design atomique.

Consultez :
- [Frontend Atomic Design Guide](docs/frontend-atomic-guide.md)

## Troubleshooting

| Problème | Solution |
|----------|----------|
| Compose démarre mais le frontend est indisponible | Vérifiez `docker compose logs frontend -f` et assurez-vous que le port `3000` est libre |
| Problèmes de connexion à la base de données | Vérifiez la santé du service `db` avec `docker compose ps` |
| Bun manquant sur la machine hôte | Exécutez tout via Docker au lieu de commandes Bun locales |

## License

MIT
