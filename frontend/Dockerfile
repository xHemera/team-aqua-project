FROM oven/bun:1-alpine

ENV CI=true

RUN apk add --no-cache postgresql16-client

WORKDIR /app

COPY package.json ./

RUN bun install --ignore-scripts

COPY prisma ./prisma

COPY . .
