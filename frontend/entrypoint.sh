#!/bin/sh
set -e

bun install --ignore-scripts
bunx prisma generate
bunx prisma migrate dev --name init --url "$DATABASE_URL"

exec bun run dev -- --hostname 0.0.0.0
