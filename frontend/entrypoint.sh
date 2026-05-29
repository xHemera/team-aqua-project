#!/bin/sh
set -e

bun install --ignore-scripts
bunx prisma generate
bunx prisma migrate dev --name init --url "$DATABASE_URL"

# Turbopack misresolves require('.prisma/client/') from @prisma/client/
# as a relative path instead of a bare module specifier.
# This symlink makes both resolutions work.
ln -sf /app/node_modules/.prisma /app/node_modules/@prisma/.prisma

exec bun run dev -- --hostname 0.0.0.0
