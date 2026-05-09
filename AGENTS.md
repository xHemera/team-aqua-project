# Agent Instructions

This repository is Kyogre, a full-stack app with a Next.js frontend in `frontend/` and a Socket.IO service in `websockets/`.

## Start Here
- Prefer the existing docs for details instead of duplicating them: [README.md](README.md), [docs/frontend-overview.md](docs/frontend-overview.md), [docs/components-guide.md](docs/components-guide.md), [docs/hooks-guide.md](docs/hooks-guide.md), [docs/authentication-guide.md](docs/authentication-guide.md), [docs/styling-guide.md](docs/styling-guide.md).
- This app is first and foremost a turn-based RPG with a party of 3 characters; the game engine is being built in pure TypeScript and is still under active development.
- Use Server Components by default in the Next.js app; only add Client Components when browser APIs, hooks, or interactive state are required.
- Keep UI changes aligned with the atomic design structure in `frontend/components/` and the existing medieval fantasy theme in `frontend/app/globals.css` and `frontend/app/layout.tsx`.

## Useful Commands
- Start the stack from the repo root with `docker compose up --build -d` or `./dev.sh`.
- Frontend scripts live in [frontend/package.json](frontend/package.json): `bun run dev`, `bun run build`, `bun run start`, `bun run lint`, and `bun run auth:migrate`.
- The websocket service is started from [websockets/server.js](websockets/server.js); it is separate from the Next.js app.

## Project Conventions
- TypeScript path alias `@/*` maps to `frontend/*`.
- Auth is Better Auth + Prisma; use server-side session checks for protected routes and API handlers.
- Avoid touching websockets, the database, or backend code as much as possible; if a change is necessary there, the reason must be explicit, clear, and direct.
- Prefer shared hooks in `frontend/hooks/` and reusable UI primitives over one-off page logic.
- Match existing localStorage patterns that avoid hydration mismatches by deferring reads into effects.
- Keep remote image and runtime assumptions aligned with `frontend/next.config.ts`, `frontend/socket.js`, and the Docker compose setup.
- Keep the future mini-game in mind: a 1v1 top-down PvP mode where movement uses the arrow keys, attack uses click or space, hits push both players back with a stronger recoil on the attacker, and orientation is computed automatically from movement. Do not implement it unless requested, but avoid design choices that would block it.

## Common Pitfalls
- The frontend service command in [docker-compose.yml](docker-compose.yml) chains `bun run dev` before `bun run start`, so treat it as a container bootstrap rather than a normal local dev command.
- The websocket service expects Redis to be available on the Docker network.
- Respect the required env vars for auth and database access: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_DATABASE_URL`, and `DATABASE_URL`.

## Editing Guidance
- Link to existing docs and code rather than copying them into this file.
- Keep changes small, focused, and consistent with the current component and route structure.
- If a task is specific to one area, read the nearest relevant doc before editing code.
