FROM oven/bun:1-alpine

ENV CI=true

RUN apk add --no-cache postgresql16-client

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY prisma ./prisma

COPY . .
