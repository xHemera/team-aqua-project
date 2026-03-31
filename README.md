# Kyogre

A full-stack project with a Next.js frontend, PostgreSQL database, and containerized development tooling.

## 📖 Sommaire

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [🚀 Démarrage](#-démarrage)
- [Repository Structure](#repository-structure)
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

## License

MIT
