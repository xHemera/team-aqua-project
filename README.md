# Kyogre

A full-stack project with a Next.js frontend, PostgreSQL database, and containerized development tooling.

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [🚀 Getting Started](#-getting-started)
- [Repository Structure](#repository-structure)
- [License](#license)

## Overview

**Kyogre** is a modern full-stack web-app game that provides:
- A modern frontend application built with Next.js App Router, React 19, TypeScript, Better Auth, and Prisma
- A WebSocket service for real-time communication (Socket.IO)
- A PostgreSQL database managed via Docker Compose
- A developer helper script (`dev.sh`) for facilitating local operations

## Features

✨ **Key Features**:
- 🔐 Robust authentication with Better Auth
- 🎨 Atomic UI architecture for optimal maintainability
- 🔄 WebSocket service for real-time functionality
- 🐘 PostgreSQL database with Prisma migrations
- 🐳 Containerized development environment
- 📝 Structured technical documentation
- A fully automatic PTCG Simulator with more than 30 cards fully implemented

## Documentation

Explore detailed project documentation:

### Architecture & Setup
- [Frontend Overview](docs/frontend-overview.md) - Frontend architecture and folder structure
- [Project Structure](docs/project-structure.md) - Complete directory reference and file purposes
- [Development Workflow](docs/development-workflow.md) - Setup, common tasks, debugging, and optimization

### Frontend Development
- [Components Guide](docs/components-guide.md) - Reusable components, atomic design, component library
- [Hooks Guide](docs/hooks-guide.md) - React hooks, custom hooks, and common patterns
- [Authentication Guide](docs/authentication-guide.md) - Better Auth setup, sign-in/up/out, protected routes
- [Styling Guide](docs/styling-guide.md) - Tailwind CSS, theming, responsive design, medieval fantasy theme

### Backend & Services
- [API Reference](docs/api-reference.md) - All API endpoints, request/response formats, rate limiting
- [Database Guide](docs/database-guide.md) - Prisma models, schema, migrations, common queries
- [WebSocket Guide](docs/websocket-guide.md) - Socket.IO setup, real-time events, matchmaking

### Game & Features
- [Game Features](docs/game-features.md) - Game mechanics, character system, combat, PvP, expeditions, progression

### Deployment & Operations
- [Deployment Guide](docs/deployment.md) - Production deployment, environment configuration, monitoring

## Tech Stack

| Category | Technologies |
|----------|----------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Authentication** | Better Auth |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | Socket.IO |
| **Package Manager** | Bun 1.2.5+ |
| **Orchestration** | Docker Compose |

## 🚀 Getting Started

**Prerequisites**: Docker + Docker Compose

```bash
# Clone the project
git clone <repository-url> <name>
cd <name>

# Option A: Using the helper script
./dev.sh

# Option B: Start directly
docker compose up --build -d
```

Go to: **http://localhost:3000**

> **Socket.IO Service**: Runs on `http://localhost:4001` for real-time communication (games, messaging, matchmaking)

## Repository Structure

```text
kyogre/
├── frontend/                 # Next.js app (main frontend)
│   ├── app/                  # Routes (App Router)
│   │   ├── (auth)/          # Public routes: login, register
│   │   ├── (main)/          # Protected routes: home, game, characters, etc.
│   │   ├── api/             # Backend endpoints
│   │   └── admin/           # Admin dashboard
│   ├── components/           # Components (atomic design)
│   │   ├── atoms/           # Basic elements
│   │   ├── molecules/       # Atom combinations
│   │   └── organisms/       # Complex sections
│   ├── lib/                  # Utilities & configs
│   │   ├── auth.ts          # Better Auth server setup
│   │   ├── auth-client.ts   # Better Auth client setup
│   │   ├── prisma.ts        # Database client
│   │   └── *.ts             # Other utilities
│   ├── prisma/              # Database schema + migrations
│   ├── socket.js            # Socket.IO client configuration
│   └── public/              # Static assets
├── websockets/              # WebSocket Service (Bun + Socket.IO)
│   ├── server.js            # Main server
│   ├── matchmaking.js       # PvP matchmaking logic
│   └── package.json         # Dependencies
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services (Next.js, PostgreSQL, Redis)
├── dev.sh                   # Development helper script
└── AGENTS.md                # AI agent instructions
```

## License

MIT
