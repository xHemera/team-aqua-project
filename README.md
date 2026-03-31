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

**Kyogre** is a modern full-stack application that provides:
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

## Documentation

Explore detailed project documentation:

- [Frontend Overview](docs/frontend-overview.md) - Frontend architecture and structure
- [Components Guide](docs/components-guide.md) - Reusable components and atomic design patterns
- [Hooks Guide](docs/hooks-guide.md) - Shared React hooks and state management
- [Authentication Guide](docs/authentication-guide.md) - Authentication flow and Better Auth setup
- [Styling Guide](docs/styling-guide.md) - CSS and styling approach with Tailwind CSS

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

## Repository Structure

```text
kyogre/
├── frontend/          # Next.js app (main frontend)
│   ├── app/           # Routes (App Router)
│   ├── components/    # Components (atomic design)
│   ├── hooks/         # Shared React hooks
│   ├── lib/           # Utilities
│   ├── prisma/        # Schema + migrations
│   └── public/        # Assets
├── websockets/        # WebSocket Service (Bun + TS)
├── docs/              # Documentation
├── docker-compose.yml # Docker services
└── dev.sh             # Helper script
```

## License

MIT
