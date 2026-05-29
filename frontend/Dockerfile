FROM oven/bun:1-alpine

ENV CI=true
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/aqua_temp

RUN apk add --no-cache postgresql16-client

WORKDIR /app

COPY package.json ./

RUN bun install --ignore-scripts

COPY prisma ./prisma

RUN bun prisma generate

COPY . .
